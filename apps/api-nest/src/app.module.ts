import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { CandidaturesModule } from "./candidatures/candidatures.module";

const THROTTLE_TTL_MS = 60_000;
const THROTTLE_LIMIT = 20;

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT }]), CandidaturesModule],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
