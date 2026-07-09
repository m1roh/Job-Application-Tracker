import { describe, expect, it } from "vitest";
import { CreateJobApplicationUseCase } from "./create-job-application";
import { FixedClock } from "./test-doubles/fixed-clock";
import { InMemoryJobApplicationRepository } from "./test-doubles/in-memory-job-application-repository";

const NOW = new Date("2026-07-02T10:00:00.000Z");

function setup() {
  const repository = new InMemoryJobApplicationRepository();
  const clock = new FixedClock(NOW);
  const useCase = new CreateJobApplicationUseCase(repository, clock);
  return { repository, clock, useCase };
}

describe("CreateJobApplicationUseCase", () => {
  describe("invalid cases", () => {
    it("rejects an empty company name", async () => {
      const { useCase } = setup();

      await expect(useCase.execute({ company: "", position: "Backend Engineer" })).rejects.toThrow();
    });

    it("rejects an empty position", async () => {
      const { useCase } = setup();

      await expect(useCase.execute({ company: "Acme Corp", position: "" })).rejects.toThrow();
    });

    it("rejects an applicationDate in the future", async () => {
      const { useCase } = setup();
      const future = new Date("2026-07-03T00:00:00.000Z");

      await expect(
        useCase.execute({ company: "Acme Corp", position: "Backend Engineer", applicationDate: future }),
      ).rejects.toThrow();
    });

    it("does not persist anything when creation fails", async () => {
      const { useCase, repository } = setup();

      await expect(useCase.execute({ company: "", position: "Backend Engineer" })).rejects.toThrow();

      expect(await repository.list()).toEqual([]);
    });
  });

  describe("valid cases", () => {
    it("creates a job application with status to_contact", async () => {
      const { useCase } = setup();

      const application = await useCase.execute({ company: "Acme Corp", position: "Backend Engineer" });

      expect(application.status).toBe("to_contact");
      expect(application.company.toString()).toBe("Acme Corp");
      expect(application.position).toBe("Backend Engineer");
    });

    it("persists the created application in the repository", async () => {
      const { useCase, repository } = setup();

      const application = await useCase.execute({ company: "Acme Corp", position: "Backend Engineer" });
      const found = await repository.findById(application.id);

      expect(found?.equals(application)).toBe(true);
    });

    it("generates a different id for each application", async () => {
      const { useCase } = setup();

      const first = await useCase.execute({ company: "Acme Corp", position: "Backend Engineer" });
      const second = await useCase.execute({ company: "Acme Corp", position: "Backend Engineer" });

      expect(first.id.equals(second.id)).toBe(false);
    });
  });
});
