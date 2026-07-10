FROM node:22.23.1-slim AS builder

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
RUN pnpm install --frozen-lockfile --filter "@job-tracker/web-next..."

COPY . .
RUN pnpm --filter @job-tracker/web-next build

FROM node:22.23.1-slim AS runner

ENV COREPACK_HOME=/workspace/.corepack-cache
RUN corepack enable
WORKDIR /workspace

COPY --from=builder /workspace/pnpm-lock.yaml /workspace/pnpm-workspace.yaml /workspace/package.json ./
COPY --from=builder /workspace/packages ./packages
COPY --from=builder /workspace/apps/web-next ./apps/web-next
RUN pnpm install --frozen-lockfile --prod --filter "@job-tracker/web-next..."

WORKDIR /workspace/apps/web-next
ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
  CMD node -e "fetch('http://localhost:3000/').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

USER node
CMD ["pnpm", "start"]
