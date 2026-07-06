import { describe, expect, it } from "vitest";
import { getInitials } from "./get-initials.js";

describe("getInitials", () => {
  it("throws when given only whitespace", () => {
    expect(() => getInitials("   ")).toThrow("Invalid company name: cannot be empty");
  });

  it("takes the first letter of the first two words for a multi-word name", () => {
    expect(getInitials("Nova Tech")).toBe("NT");
  });

  it("ignores words beyond the first two", () => {
    expect(getInitials("Solstice Labs Inc")).toBe("SL");
  });

  it("takes the first two letters of a single-word name", () => {
    expect(getInitials("Acme")).toBe("AC");
  });

  it("uppercases the result", () => {
    expect(getInitials("nova tech")).toBe("NT");
  });

  it("ignores extra whitespace between and around words", () => {
    expect(getInitials("  Nova   Tech  ")).toBe("NT");
  });

  it("returns a single uppercase letter for a single-character word", () => {
    expect(getInitials("X")).toBe("X");
  });
});
