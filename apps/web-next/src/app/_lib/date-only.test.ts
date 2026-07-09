import { describe, expect, it } from "vitest";
import { toIsoDateOnly } from "./date-only";

describe("toIsoDateOnly", () => {
  it("truncates a Date to its YYYY-MM-DD portion", () => {
    expect(toIsoDateOnly(new Date("2026-07-24T15:42:00.000Z"))).toBe("2026-07-24");
  });
});
