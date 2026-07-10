FROM node:22.23.1-slim

ENV COREPACK_HOME=/workspace/.corepack-cache
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json packages/core/package.json
COPY packages/infrastructure/package.json packages/infrastructure/package.json
COPY packages/design-tokens/package.json packages/design-tokens/package.json
COPY apps/api-nest/package.json apps/api-nest/package.json
COPY apps/web-next/package.json apps/web-next/package.json
COPY apps/web-angular/package.json apps/web-angular/package.json
RUN pnpm install --frozen-lockfile --filter "@job-tracker/api-nest..."

COPY . .

WORKDIR /workspace/apps/api-nest
ENV NODE_ENV=production
EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
  CMD node -e "fetch('http://localhost:4000/candidatures').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

USER node
CMD ["pnpm", "start"]
