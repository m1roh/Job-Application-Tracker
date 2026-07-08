import { describe, expect, it } from "vitest";
import { JobApplicationId } from "./job-application-id";

describe("JobApplicationId", () => {
  describe("from (invalid cases)", () => {
    it("rejects an empty string", () => {
      expect(() => JobApplicationId.from("")).toThrow();
    });

    it("rejects a string that is not a UUID", () => {
      expect(() => JobApplicationId.from("not-a-uuid")).toThrow();
    });
  });

  describe("from (valid cases)", () => {
    it("accepts a valid UUID v4 and exposes its value", () => {
      const uuid = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

      const id = JobApplicationId.from(uuid);

      expect(id.toString()).toBe(uuid);
    });
  });

  describe("generate", () => {
    it("generates a valid identifier (reusable via from)", () => {
      const id = JobApplicationId.generate();

      expect(() => JobApplicationId.from(id.toString())).not.toThrow();
    });

    it("generates a different identifier on each call", () => {
      const first = JobApplicationId.generate();
      const second = JobApplicationId.generate();

      expect(first.toString()).not.toBe(second.toString());
    });
  });

  describe("equals", () => {
    it("returns true for two identifiers built from the same value", () => {
      const uuid = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

      expect(JobApplicationId.from(uuid).equals(JobApplicationId.from(uuid))).toBe(true);
    });

    it("returns false for two different identifiers", () => {
      const a = JobApplicationId.generate();
      const b = JobApplicationId.generate();

      expect(a.equals(b)).toBe(false);
    });
  });
});
