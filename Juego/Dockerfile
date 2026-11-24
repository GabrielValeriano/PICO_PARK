FROM oven/bun:1.4.4
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY . .
EXPOSE 4321
CMD ["bun", "run", "dev", "--", "--host", "0.0.0.0"]
