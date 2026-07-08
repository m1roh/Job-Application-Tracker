import { describe, expect, it } from "vitest";
import { CreateJobApplicationUseCase } from "./create-job-application";
import { GetJobApplicationUseCase } from "./get-job-application";
import { FixedClock } from "./test-doubles/fixed-clock";
import { InMemoryJobApplicationRepository } from "./test-doubles/in-memory-job-application-repository";
import { JobApplicationId } from "../../domain/value-objects/job-application-id";

const NOW = new Date("2026-07-02T10:00:00.000Z");

function setup() {
  const repository = new InMemoryJobApplicationRepository();
  const clock = new FixedClock(NOW);
  const createUseCase = new CreateJobApplicationUseCase(repository, clock);
  const useCase = new GetJobApplicationUseCase(repository);
  return { repository, createUseCase, useCase };
}

describe("GetJobApplicationUseCase", () => {
  describe("no matching application", () => {
    it("returns null when the id was never saved", async () => {
      const { useCase } = setup();

      await expect(useCase.execute(JobApplicationId.generate())).resolves.toBeNull();
    });
  });

  describe("valid cases", () => {
    it("returns the matching application", async () => {
      const { createUseCase, useCase } = setup();
      const application = await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });

      const found = await useCase.execute(application.id);

      expect(found?.id.equals(application.id)).toBe(true);
      expect(found?.company.toString()).toBe("Acme Corp");
    });
  });
});
