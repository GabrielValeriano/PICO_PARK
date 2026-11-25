#!/usr/bin/env bash
# Despliega una versión de PICO_PARK en la VM y vuelve a la anterior si la verificación falla.
#
# Uso:   scripts/deploy.sh <tag>          ej: scripts/deploy.sh "sha-$(git rev-parse d562bdf)"
# Prueba de rollback:  SIMULAR_FALLO=1 scripts/deploy.sh <tag>
# Lo llama el job "deploy" del workflow (runner self-hosted) y también sirve
# para desplegar o volver atrás a mano desde la VM.
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/proyecto/PICO_PARK}"
STATE_DIR="$PROJECT_DIR/.deploy"            # versión actual + bitácora (no se versiona)
NEW_TAG="${1:?Falta el tag a desplegar (ej: sha-d562bdf)}"
JUEGO_URL="${JUEGO_URL:-http://localhost:4321/}"
SERVIDOR_URL="${SERVIDOR_URL:-http://localhost:3002/}"
TIMEOUT="${HEALTH_TIMEOUT:-60}"             # segundos para que la versión nueva responda

cd "$PROJECT_DIR"
mkdir -p "$STATE_DIR"
PREV_TAG="$(cat "$STATE_DIR/current" 2>/dev/null || echo latest)"

log() { echo "[$(date '+%F %T')] $*" | tee -a "$STATE_DIR/deploy.log"; }

# Descarga las imágenes de un tag, con 3 intentos (la red de la VM a veces corta descargas).
descargar() {
  local intento
  for intento in 1 2 3; do
    if IMAGE_TAG="$1" docker compose pull --quiet; then return 0; fi
    log "Falló la descarga de $1 (intento $intento/3)"
    sleep 5
  done
  return 1
}

levantar() {
  export IMAGE_TAG="$1"                     # docker-compose.yml usa ${IMAGE_TAG:-latest}
  docker compose up -d --remove-orphans || log "docker compose up devolvió error con $1"
}

# OK si la URL devuelve cualquier respuesta HTTP 2xx, 3xx o 4xx
# (un 404 en la raíz del servidor igual demuestra que el proceso está vivo).
responde() {
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "$1" || true)"
  [[ "$code" =~ ^[234][0-9][0-9]$ ]]
}

# OK si todos los contenedores están "running" y, si la imagen trae HEALTHCHECK, "healthy".
# Las imágenes viejas (sin HEALTHCHECK) dan "none" y se aceptan: así el rollback a
# versiones anteriores a la 06 sigue funcionando.
contenedores_sanos() {
  local id estado total=0
  for id in $(docker compose ps -q); do
    total=$((total + 1))
    estado="$(docker inspect -f '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$id")"
    [[ "$estado" == "running/healthy" || "$estado" == "running/none" ]] || return 1
  done
  (( total >= 2 ))
}

# Borra las imágenes viejas de PICO_PARK: conserva solo la versión nueva y la anterior
# (para poder hacer rollback). Nunca hace fallar el deploy.
limpiar_imagenes() {
  local repo img
  for repo in gabrielvaleriano/picopark-juego gabrielvaleriano/picopark-servidor; do
    docker images "$repo" --format '{{.Repository}}:{{.Tag}}' | while read -r img; do
      case "${img##*:}" in
        "$NEW_TAG"|"$PREV_TAG"|latest) ;;
        *) docker rmi "$img" >/dev/null 2>&1 || true ;;
      esac
    done
  done
  docker image prune -f >/dev/null 2>&1 || true   # capas huérfanas
  log "Limpieza de imágenes hecha. Disco: $(df -h / | awk 'NR==2 {print $4 " libres (" $5 " usado)"}')"
}

verificar() {
  # Prueba de rollback: con SIMULAR_FALLO=1 la PRIMERA verificación falla a propósito;
  # la del rollback se hace normal.
  if [[ "${SIMULAR_FALLO:-0}" == 1 ]]; then
    SIMULAR_FALLO=0
    log "(prueba) se simula una verificación fallida"
    return 1
  fi
  local fin=$((SECONDS + TIMEOUT))
  while (( SECONDS < fin )); do
    if contenedores_sanos && responde "$JUEGO_URL" && responde "$SERVIDOR_URL"; then
      return 0
    fi
    sleep 3
  done
  return 1
}

log "Desplegando $NEW_TAG (versión anterior: $PREV_TAG)"

# Si no se pudo descargar, no se tocó nada: sigue corriendo la versión anterior.
if ! descargar "$NEW_TAG"; then
  log "No se pudo descargar $NEW_TAG. No se cambió nada: sigue en línea $PREV_TAG"
  exit 1
fi
levantar "$NEW_TAG"

if verificar; then
  echo "$NEW_TAG" > "$STATE_DIR/current"
  log "OK: $NEW_TAG en línea"
  docker compose ps
  limpiar_imagenes || true
  exit 0
fi

log "FALLÓ la verificación de $NEW_TAG. Últimos logs:"
docker compose logs --tail=50 || true
log "Rollback a $PREV_TAG"
descargar "$PREV_TAG" || log "No se pudo descargar $PREV_TAG; se usa la copia local de la imagen"
levantar "$PREV_TAG"
if verificar; then
  log "Rollback OK: $PREV_TAG en línea"
else
  log "El rollback también falló: revisar a mano (docker compose logs)"
fi
exit 1                                       # el pipeline queda en rojo aunque el rollback funcione
