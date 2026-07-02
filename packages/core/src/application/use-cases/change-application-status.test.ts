import { describe, expect, it } from "vitest";
import { ChangeApplicationStatusUseCase } from "./change-application-status.js";
import { CreateJobApplicationUseCase } from "./create-job-application.js";
import { FixedClock } from "./test-doubles/fixed-clock.js";
import { InMemoryJobApplicationRepository } from "./test-doubles/in-memory-job-application-repository.js";
import { JobApplicationId } from "../../domain/value-objects/job-application-id.js";

const NOW = new Date("2026-07-02T10:00:00.000Z");

function setup() {
  const repository = new InMemoryJobApplicationRepository();
  const clock = new FixedClock(NOW);
  const createUseCase = new CreateJobApplicationUseCase(repository, clock);
  const useCase = new ChangeApplicationStatusUseCase(repository, clock);
  return { repository, clock, createUseCase, useCase };
}

describe("ChangeApplicationStatusUseCase", () => {
  describe("invalid cases", () => {
    it("rejects when no application matches the id", async () => {
      const { useCase } = setup();

      await expect(useCase.execute(JobApplicationId.generate(), "application_sent")).rejects.toThrow();
    });

    it("rejects a transition that is not allowed from the current status", async () => {
      const { createUseCase, useCase } = setup();
      const application = await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });

      await expect(useCase.execute(application.id, "hr_interview")).rejects.toThrow();
    });

    it("does not change the persisted status when the transition is rejected", async () => {
      const { createUseCase, useCase, repository } = setup();
      const application = await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });

      await expect(useCase.execute(application.id, "hr_interview")).rejects.toThrow();

      const found = await repository.findById(application.id);
      expect(found?.status).toBe("to_contact");
    });
  });

  describe("valid cases", () => {
    it("changes the status of an existing application", async () => {
      const { createUseCase, useCase } = setup();
      const application = await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });

      const updated = await useCase.execute(application.id, "application_sent");

      expect(updated.status).toBe("application_sent");
    });

    it("persists the updated status", async () => {
      const { createUseCase, useCase, repository } = setup();
      const application = await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });

      await useCase.execute(application.id, "application_sent");
      const found = await repository.findById(application.id);

      expect(found?.status).toBe("application_sent");
    });

    it("allows chaining multiple valid transitions", async () => {
      const { createUseCase, useCase } = setup();
      const application = await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });

      await useCase.execute(application.id, "application_sent");
      const finalApplication = await useCase.execute(application.id, "hr_interview");

      expect(finalApplication.status).toBe("hr_interview");
      expect(finalApplication.history).toHaveLength(2);
    });
  });
});
