FROM node:20-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
RUN node scripts/use-postgres.js && npx prisma generate && npm run build
ENV NODE_ENV=production PORT=4000
EXPOSE 4000
# `db push` applies the schema without dropping data; switch to `prisma migrate deploy` once you commit migrations.
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/server.js"]
