import type { Clock } from "@job-tracker/core/application/ports/clock.js";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
