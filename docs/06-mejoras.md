# 06 · Endurecimiento y extras

**Mejora seleccionada:** dejar los dos servicios listos para producción. Son tres cambios que se apoyan entre sí:

1. El juego se sirve como sitio estático con **nginx**, en lugar del servidor de desarrollo de Astro.
2. **Healthchecks** en las dos imágenes, que el deploy usa para decidir si una versión anda.
3. **Rotación de logs** de los contenedores y un procedimiento para revisarlos.

Además, la IP que muestra el QR pasa a leerse de una **variable de entorno** en vez de estar escrita en el código.

## Por qué esta mejora

- Antes, el contenedor del juego corría `astro dev`: el servidor de desarrollo, con recarga en caliente, mensajes de Vite y archivos sin optimizar. No está pensado para atender jugadores. El juego no necesita servidor (es HTML, CSS y JS), así que alcanza con generar el sitio una vez y servirlo con nginx: la imagen es más chica, arranca al instante y gasta menos memoria.
- La verificación del deploy (actividad 05) solo comprobaba que los puertos respondieran. Con un healthcheck, cada servicio dice explícitamente si está sano, y Docker lo informa en `docker ps`.
- Los logs de Docker crecen sin límite por defecto y pueden llenar el disco de la VM.

Se eligió esto antes que HTTPS, backups o Swarm porque mejora directamente el pipeline que ya funciona, sin agregar infraestructura nueva.

## 1. Juego en modo producción (nginx)

`Juego/Dockerfile` tiene dos etapas (*multi-stage build*):

| Etapa | Imagen | Qué hace |
|---|---|---|
| `build` | `oven/bun:1.4.4` | Instala dependencias y ejecuta `astro build`, que genera `dist/` |
| final | `nginx:stable-alpine` | Copia solo `dist/` y `nginx.conf`. No lleva Bun, `node_modules` ni el código fuente |

En `Juego/nginx.conf`:
- `/health` responde `ok`, sin escribir en el log de accesos.
- Los archivos de `/_astro/` (llevan un hash en el nombre) se cachean un año en el navegador.
- Compresión gzip para CSS, JS y SVG.

nginx escucha en el puerto 80 del contenedor y el compose lo publica como `4321:80`, así que la URL del juego no cambia (`http://10.56.31.44:4321`).

## 2. Healthchecks

| Servicio | Ruta | Chequeo (`HEALTHCHECK` en el Dockerfile) |
|---|---|---|
| juego | `GET /health` de nginx | `wget` contra `127.0.0.1/health` |
| servidor | `GET /health` de Elysia, que devuelve `status`, `jugadores` conectados y `uptime` | `bun -e "fetch(...)"`, porque la imagen no trae `curl` |

Los dos se ejecutan cada 5 s; si fallan 3 veces seguidas, el contenedor pasa a `unhealthy`.

El healthcheck está en el **Dockerfile** y no en el compose a propósito: así viaja con la imagen. Si se vuelve a una versión anterior a esta actividad, que no tiene `/health`, Docker informa `none` en lugar de `unhealthy`, y el rollback sigue funcionando.

**Cambio en `scripts/deploy.sh`:** ahora una versión se da por buena cuando todos los contenedores están `running` y `healthy` (o `none`, en imágenes viejas), además de responder por HTTP.

## 3. Logs

En `docker-compose.yml`, los dos servicios usan:

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

Cada contenedor guarda como máximo 3 archivos de 10 MB (30 MB). Al llenarse, se descarta el más viejo.

**Revisión de logs y estado:**

```bash
cd /opt/proyecto/PICO_PARK
docker compose ps                                   # columna STATUS: (healthy) / (unhealthy)
docker compose logs -f --tail=100 servidor          # logs en vivo del servidor
docker compose logs --since=1h juego                # accesos al juego de la última hora
docker inspect --format '{{json .State.Health}}' picopark-servidor   # últimos resultados del healthcheck
curl http://localhost:3002/health                   # {"status":"ok","jugadores":0,"uptime":...}
cat .deploy/deploy.log                              # bitácora de deploys (actividad 05)
```

## 4. Variable de entorno para la IP del QR

El servidor ya leía `process.env.PUBLIC_IP`, pero nadie la definía y se usaba la IP escrita en el código. Ahora el compose la toma de `VM_IP`, del archivo `.env` de la VM:

```yaml
environment:
  PUBLIC_IP: ${VM_IP:-10.56.31.44}
```

Si la VM cambia de IP, alcanza con editar el `.env` y correr `docker compose up -d`, sin reconstruir la imagen.

## Evidencia

1. Pipeline en verde con el commit de esta actividad.
2. `docker compose ps` con los dos servicios `Up (healthy)`.
3. `curl http://localhost:3002/health` y `curl http://localhost:4321/health`.
4. `docker compose logs --tail=20 juego`: ahora muestra accesos de nginx en lugar de `astro dev`.
5. `docker images`: la imagen del juego pasa a pesar bastante menos que antes.
