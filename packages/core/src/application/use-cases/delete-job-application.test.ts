import { describe, expect, it } from "vitest";
import { CreateJobApplicationUseCase } from "./create-job-application.js";
import { DeleteJobApplicationUseCase } from "./delete-job-application.js";
import { FixedClock } from "./test-doubles/fixed-clock.js";
import { InMemoryJobApplicationRepository } from "./test-doubles/in-memory-job-application-repository.js";
import { JobApplicationId } from "../../domain/value-objects/job-application-id.js";

const NOW = new Date("2026-07-02T10:00:00.000Z");

function setup() {
  const repository = new InMemoryJobApplicationRepository();
  const clock = new FixedClock(NOW);
  const createUseCase = new CreateJobApplicationUseCase(repository, clock);
  const useCase = new DeleteJobApplicationUseCase(repository);
  return { repository, createUseCase, useCase };
}

describe("DeleteJobApplicationUseCase", () => {
  describe("no matching application", () => {
    it("does not throw when the id was never saved", async () => {
      const { useCase } = setup();

      await expect(useCase.execute(JobApplicationId.generate())).resolves.toBeUndefined();
    });
  });

  describe("valid cases", () => {
    it("removes an existing application", async () => {
      const { createUseCase, useCase, repository } = setup();
      const application = await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });

      await useCase.execute(application.id);
      const found = await repository.findById(application.id);

      expect(found).toBeNull();
    });

    it("does not affect other applications", async () => {
      const { createUseCase, useCase, repository } = setup();
      const toDelete = await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });
      const toKeep = await createUseCase.execute({ company: "Globex", position: "Frontend Engineer" });

      await useCase.execute(toDelete.id);
      const remaining = await repository.list();

      expect(remaining).toHaveLength(1);
      expect(remaining[0]?.id.equals(toKeep.id)).toBe(true);
    });
  });
});
