FROM node:22-slim AS builder

RUN corepack enable
WORKDIR /workspace

COPY . .
RUN pnpm install --frozen-lockfile --filter "@job-tracker/web-next..."
RUN pnpm --filter @job-tracker/web-next build

FROM node:22-slim AS runner

RUN corepack enable
WORKDIR /workspace

COPY --from=builder /workspace/pnpm-lock.yaml /workspace/pnpm-workspace.yaml /workspace/package.json ./
COPY --from=builder /workspace/packages ./packages
COPY --from=builder /workspace/apps/web-next ./apps/web-next
RUN pnpm install --frozen-lockfile --prod --filter "@job-tracker/web-next..."

WORKDIR /workspace/apps/web-next
ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "start"]
