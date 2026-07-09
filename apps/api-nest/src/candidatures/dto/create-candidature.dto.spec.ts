import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateCandidatureDto } from "./create-candidature.dto";

describe("CreateCandidatureDto (invalid cases)", () => {
  it("rejects an empty company", async () => {
    const dto = plainToInstance(CreateCandidatureDto, { company: "", position: "Dev" });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === "company")).toBe(true);
  });

  it("rejects a missing company", async () => {
    const dto = plainToInstance(CreateCandidatureDto, { position: "Dev" });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === "company")).toBe(true);
  });

  it("rejects an empty position", async () => {
    const dto = plainToInstance(CreateCandidatureDto, { company: "Acme", position: "" });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === "position")).toBe(true);
  });

  it("rejects a missing position", async () => {
    const dto = plainToInstance(CreateCandidatureDto, { company: "Acme" });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === "position")).toBe(true);
  });
});

describe("CreateCandidatureDto (valid cases)", () => {
  it("accepts company and position only", async () => {
    const dto = plainToInstance(CreateCandidatureDto, { company: "Acme", position: "Dev" });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it("accepts an optional offerUrl and notes", async () => {
    const dto = plainToInstance(CreateCandidatureDto, {
      company: "Acme",
      position: "Dev",
      offerUrl: "https://example.com/offer",
      notes: "Contact via Camille",
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
