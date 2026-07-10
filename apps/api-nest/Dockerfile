FROM node:22-slim

RUN corepack enable
WORKDIR /workspace

COPY . .
RUN pnpm install --frozen-lockfile --filter "@job-tracker/api-nest..."

WORKDIR /workspace/apps/api-nest
ENV NODE_ENV=production
EXPOSE 4000

CMD ["pnpm", "start"]
