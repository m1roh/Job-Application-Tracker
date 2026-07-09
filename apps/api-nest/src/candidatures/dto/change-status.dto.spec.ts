import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ChangeStatusDto } from "./change-status.dto";

describe("ChangeStatusDto (invalid cases)", () => {
  it("rejects a missing status", async () => {
    const dto = plainToInstance(ChangeStatusDto, {});

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === "status")).toBe(true);
  });

  it("rejects a status that is not one of the known application statuses", async () => {
    const dto = plainToInstance(ChangeStatusDto, { status: "made_up_status" });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === "status")).toBe(true);
  });
});

describe("ChangeStatusDto (valid cases)", () => {
  it("accepts a known application status", async () => {
    const dto = plainToInstance(ChangeStatusDto, { status: "application_sent" });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
