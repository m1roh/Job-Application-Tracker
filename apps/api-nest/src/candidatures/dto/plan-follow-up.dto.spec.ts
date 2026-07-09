import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PlanFollowUpDto } from "./plan-follow-up.dto";

describe("PlanFollowUpDto (invalid cases)", () => {
  it("rejects a missing date", async () => {
    const dto = plainToInstance(PlanFollowUpDto, {});

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === "date")).toBe(true);
  });

  it("rejects a date that is not a valid ISO 8601 string", async () => {
    const dto = plainToInstance(PlanFollowUpDto, { date: "not-a-date" });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === "date")).toBe(true);
  });
});

describe("PlanFollowUpDto (valid cases)", () => {
  it("accepts a valid ISO 8601 date string", async () => {
    const dto = plainToInstance(PlanFollowUpDto, { date: "2026-07-24" });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
