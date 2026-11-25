# 07 · Monitoreo: Prometheus, Node Exporter y Grafana

Objetivo: ver el estado de la VM y de los contenedores para detectar consumo de recursos, caídas y cuellos de botella **antes** de que afecten al juego. El incidente de la actividad 06 (disco al 100%, runner caído) es exactamente lo que este monitoreo habría avisado con tiempo.

## Arquitectura

```
                     ┌──────────────── VM (MaquinaVirtual-nain) ───────────────────┐
                     │                                                              │
 navegador ──:3030──►│ Grafana ──consulta──► Prometheus (:9091) ──cada 15 s lee──┐  │
                     │                         │  guarda 15 días / máx 1 GB      │  │
                     │                         │  evalúa alertas                 │  │
                     │       ┌─────────────────┴──────────┬──────────────────────┤  │
                     │       ▼                            ▼                      ▼  │
                     │ Node Exporter (:9101)     cAdvisor (:8080)    picopark-servidor │
                     │ CPU, RAM, disco, red      CPU, RAM, red por   :3002/metrics     │
                     │ de la VM                  contenedor          jugadores, msgs   │
                     └──────────────────────────────────────────────────────────────┘
```

| Componente | Imagen | Qué mide |
|---|---|---|
| Node Exporter | `prom/node-exporter` | El host: CPU, memoria, disco, red, carga, uptime |
| cAdvisor | `ghcr.io/google/cadvisor:v0.60.6` | Cada contenedor Docker: CPU, memoria, red, desde cuándo corre |
| Prometheus | `prom/prometheus` | Recolecta todo cada 15 s, lo guarda y evalúa las alertas |
| Grafana | `grafana/grafana` | Dashboard "PICO_PARK · VM y contenedores" |
| `/metrics` del servidor | (código propio en `Servidor/index.ts`) | Métricas del juego: jugadores conectados, conexiones y mensajes WebSocket |

## Decisiones

- **Compose separado** (`monitoring/docker-compose.yml`, proyecto `picopark-monitoring`): el monitoreo tiene otro ciclo de vida que el juego. Un deploy del juego no reinicia Prometheus (no se pierden datos) y un problema del monitoreo no frena el juego.
- **Se despliega con el mismo pipeline:** el job `deploy` tiene un paso extra que hace `pull` + `up -d` del compose de monitoreo. Tiene `continue-on-error`, así que si falla no marca el deploy del juego como fallido.
- **cAdvisor además de Node Exporter:** Node Exporter solo ve la VM entera; para saber *qué contenedor* consume, hace falta cAdvisor.
- **Node Exporter con `network_mode: host`:** así ve las interfaces de red reales de la VM, no las de su propio contenedor.
- **Retención limitada** (`15d` y `1GB`): lección de la actividad 06, para que Prometheus no llene el disco.
- **Todo como código (provisioning):** el datasource y el dashboard están en el repo y Grafana los carga solo al arrancar. No hay que configurar nada a mano.
- **VM compartida:** en la VM corren otros stacks de monitoreo (de otros grupos y prácticas) que ya usan los nombres `prometheus`, `grafana` y `node-exporter` y los puertos 9090, 9100, 3003, 3010 y 3040. Por eso todos nuestros contenedores llevan el prefijo `picopark-` y usan puertos propios: Prometheus 9091, Node Exporter 9101 y Grafana 3030. cAdvisor no publica ningún puerto: solo lo lee Prometheus por la red interna del compose.
- **Secretos:** la contraseña de admin de Grafana es el secreto `GRAFANA_ADMIN_PASSWORD` de GitHub; no está en el repo.

## Acceso

| Qué | URL |
|---|---|
| Grafana | `http://10.56.31.44:3030` (usuario `admin`, contraseña del secreto) → Dashboards → PICO_PARK |
| Prometheus | `http://10.56.31.44:9091` → *Status → Targets* (qué se está leyendo) y *Alerts* |
| Métricas del juego | `http://10.56.31.44:3002/metrics` |

## Qué muestra el dashboard y cómo se interpreta

### Estado general
- **Servicios monitoreados:** `OK` / `CAÍDO` por cada fuente (`up`). Si uno aparece caído, Prometheus no lo puede leer: el servicio está apagado o hay un problema de red.
- **Jugadores conectados:** mandos conectados ahora (0 a 4).
- **Alertas activas:** si es mayor a 0, ver el detalle en Prometheus → Alerts.

### VM
| Panel | Normal | Señal de problema |
|---|---|---|
| CPU | bajo en reposo; sube un poco al jugar o durante un deploy | > 90% sostenido: algo consume de más (ver CPU por contenedor) |
| Memoria | estable | > 90%: riesgo de que el sistema mate procesos |
| Disco / | estable, sube un poco con cada deploy y baja con la limpieza | subida constante; > 85% dispara `DiscoCasiLleno` |
| Red | picos durante deploys (descarga de imágenes) | tráfico alto sin deploys ni partidas |
| Load average | menor a la cantidad de núcleos | mayor a los núcleos de forma sostenida: la VM está saturada |

### Contenedores
- **CPU y memoria por contenedor:** muestra qué contenedor consume. La VM tiene más contenedores además de PICO_PARK, así que acá se ve si el problema es nuestro o de otro.
- **Tiempo desde el arranque** de `picopark-juego` y `picopark-servidor`: si vuelve a cero, el contenedor se reinició. Si coincide con un deploy, es normal; si no, el proceso se cayó y Docker lo levantó (`restart: unless-stopped`).

### PICO_PARK (métricas propias)
- **Jugadores conectados** a lo largo del tiempo: muestra cuándo hubo partidas.
- **Mensajes WebSocket por segundo:** comandos de los mandos. Si hay jugadores conectados pero los mensajes caen a 0, los mandos no están llegando al servidor.
- **Conexiones nuevas por minuto:** muchas conexiones seguidas con pocos jugadores indican mandos que se desconectan y reconectan (red inestable).

## Alertas (`monitoring/prometheus/alertas.yml`)

| Alerta | Condición | Por qué |
|---|---|---|
| `DiscoCasiLleno` | disco > 85% durante 5 min | evita repetir el incidente de la 06 |
| `MemoriaAlta` | memoria > 90% durante 5 min | |
| `CPUAlta` | CPU > 90% durante 10 min | |
| `ServicioCaido` | cualquier fuente con `up == 0` durante 1 min | servidor del juego, Node Exporter o cAdvisor caídos |
| `JuegoCaido` | el contenedor `picopark-juego` no corre hace más de 1 min | el juego no tiene `/metrics`, se controla por cAdvisor |

Las alertas se ven en Prometheus → *Alerts* y en el panel "Alertas activas". No se envían por mail: para eso haría falta Alertmanager, que queda como mejora futura.

## Operación

```bash
cd /opt/proyecto/PICO_PARK
docker compose -f monitoring/docker-compose.yml ps        # estado del monitoreo
docker compose -f monitoring/docker-compose.yml logs -f prometheus
curl -s localhost:9091/api/v1/targets | grep -o '"health":"[a-z]*"'   # salud de cada target
docker system df -v | grep -E 'picopark-monitoring'       # espacio de los volúmenes
```

## Evidencia

1. Prometheus → *Status → Targets* con los 4 jobs en `UP`.
2. El dashboard de Grafana con datos de la VM y de los contenedores.
3. Una partida de prueba: el panel "Jugadores conectados" sube y "Mensajes WebSocket por segundo" muestra actividad.
4. Prueba de alerta: `docker stop picopark-juego`, esperar 2 minutos y ver `JuegoCaido` en Prometheus → Alerts; después `docker start picopark-juego`.
