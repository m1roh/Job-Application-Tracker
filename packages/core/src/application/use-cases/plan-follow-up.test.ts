import { describe, expect, it } from "vitest";
import { ChangeApplicationStatusUseCase } from "./change-application-status.js";
import { CreateJobApplicationUseCase } from "./create-job-application.js";
import { PlanFollowUpUseCase } from "./plan-follow-up.js";
import { FixedClock } from "./test-doubles/fixed-clock.js";
import { InMemoryJobApplicationRepository } from "./test-doubles/in-memory-job-application-repository.js";
import { JobApplicationId } from "../../domain/value-objects/job-application-id.js";

const NOW = new Date("2026-07-02T10:00:00.000Z");
const FOLLOW_UP_DATE = new Date("2026-07-10T00:00:00.000Z");

function setup() {
  const repository = new InMemoryJobApplicationRepository();
  const clock = new FixedClock(NOW);
  const createUseCase = new CreateJobApplicationUseCase(repository, clock);
  const changeStatusUseCase = new ChangeApplicationStatusUseCase(repository, clock);
  const useCase = new PlanFollowUpUseCase(repository);
  return { repository, createUseCase, changeStatusUseCase, useCase };
}

describe("PlanFollowUpUseCase", () => {
  describe("invalid cases", () => {
    it("rejects when no application matches the id", async () => {
      const { useCase } = setup();

      await expect(useCase.execute(JobApplicationId.generate(), FOLLOW_UP_DATE)).rejects.toThrow();
    });

    it("rejects when the status does not allow planning a follow-up", async () => {
      const { createUseCase, useCase } = setup();
      const application = await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });

      await expect(useCase.execute(application.id, FOLLOW_UP_DATE)).rejects.toThrow();
    });

    it("does not persist a follow-up date when the status does not allow it", async () => {
      const { createUseCase, useCase, repository } = setup();
      const application = await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });

      await expect(useCase.execute(application.id, FOLLOW_UP_DATE)).rejects.toThrow();

      const found = await repository.findById(application.id);
      expect(found?.nextFollowUp).toBeNull();
    });
  });

  describe("valid cases", () => {
    it("sets the follow-up date when status is application_sent", async () => {
      const { createUseCase, changeStatusUseCase, useCase } = setup();
      const application = await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });
      await changeStatusUseCase.execute(application.id, "application_sent");

      const updated = await useCase.execute(application.id, FOLLOW_UP_DATE);

      expect(updated.nextFollowUp).toEqual(FOLLOW_UP_DATE);
    });

    it("sets the follow-up date when status is follow_up_sent", async () => {
      const { createUseCase, changeStatusUseCase, useCase } = setup();
      const application = await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });
      await changeStatusUseCase.execute(application.id, "application_sent");
      await changeStatusUseCase.execute(application.id, "follow_up_sent");

      const updated = await useCase.execute(application.id, FOLLOW_UP_DATE);

      expect(updated.nextFollowUp).toEqual(FOLLOW_UP_DATE);
    });

    it("persists the follow-up date", async () => {
      const { createUseCase, changeStatusUseCase, useCase, repository } = setup();
      const application = await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });
      await changeStatusUseCase.execute(application.id, "application_sent");

      await useCase.execute(application.id, FOLLOW_UP_DATE);
      const found = await repository.findById(application.id);

      expect(found?.nextFollowUp).toEqual(FOLLOW_UP_DATE);
    });
  });
});
