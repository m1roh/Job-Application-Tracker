import { describe, expect, it } from "vitest";
import { formatDate } from "./format-date";

describe("formatDate", () => {
  it("throws when given an invalid Date", () => {
    expect(() => formatDate(new Date("not-a-date"))).toThrow("Invalid date: cannot format an invalid Date");
  });

  it("formats a date as a long French date", () => {
    expect(formatDate(new Date("2026-06-12T10:00:00.000Z"))).toBe("12 juin 2026");
  });

  it("formats a different month correctly", () => {
    expect(formatDate(new Date("2026-07-01T10:00:00.000Z"))).toBe("1 juillet 2026");
  });
});
