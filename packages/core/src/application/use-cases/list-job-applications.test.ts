import { describe, expect, it } from "vitest";
import { ChangeApplicationStatusUseCase } from "./change-application-status";
import { CreateJobApplicationUseCase } from "./create-job-application";
import { ListJobApplicationsUseCase } from "./list-job-applications";
import { FixedClock } from "./test-doubles/fixed-clock";
import { InMemoryJobApplicationRepository } from "./test-doubles/in-memory-job-application-repository";

const NOW = new Date("2026-07-02T10:00:00.000Z");

function setup() {
  const repository = new InMemoryJobApplicationRepository();
  const clock = new FixedClock(NOW);
  const createUseCase = new CreateJobApplicationUseCase(repository, clock);
  const changeStatusUseCase = new ChangeApplicationStatusUseCase(repository, clock);
  const useCase = new ListJobApplicationsUseCase(repository);
  return { repository, createUseCase, changeStatusUseCase, useCase };
}

describe("ListJobApplicationsUseCase", () => {
  describe("empty repository", () => {
    it("returns an empty array when no application was created", async () => {
      const { useCase } = setup();

      const result = await useCase.execute();

      expect(result).toEqual([]);
    });
  });

  describe("without a filter", () => {
    it("returns every application", async () => {
      const { createUseCase, useCase } = setup();

      await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });
      await createUseCase.execute({ company: "Globex", position: "Frontend Engineer" });

      const result = await useCase.execute();

      expect(result).toHaveLength(2);
    });
  });

  describe("with a status filter", () => {
    it("returns only applications matching the given status", async () => {
      const { createUseCase, changeStatusUseCase, useCase } = setup();

      const toContact = await createUseCase.execute({ company: "Acme Corp", position: "Backend Engineer" });
      const sentApplication = await createUseCase.execute({ company: "Globex", position: "Frontend Engineer" });
      await changeStatusUseCase.execute(sentApplication.id, "application_sent");

      const result = await useCase.execute({ status: "application_sent" });

      expect(result).toHaveLength(1);
      expect(result[0]?.id.equals(toContact.id)).toBe(false);
      expect(result[0]?.status).toBe("application_sent");
    });
  });
});
