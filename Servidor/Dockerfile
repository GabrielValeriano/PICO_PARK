FROM oven/bun:1.4.4
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY . .
EXPOSE 3000
# La imagen no trae curl: el chequeo se hace con el propio bun
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["bun", "run", "index.ts"]
