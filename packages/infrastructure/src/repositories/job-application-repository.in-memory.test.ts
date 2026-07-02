import { JobApplication } from "@job-tracker/core/domain/job-application.js";
import { CompanyName } from "@job-tracker/core/domain/value-objects/company-name.js";
import { JobApplicationId } from "@job-tracker/core/domain/value-objects/job-application-id.js";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryJobApplicationRepository } from "./job-application-repository.in-memory.js";

const NOW = new Date("2026-07-02T10:00:00.000Z");

function buildApplication(overrides: { id?: JobApplicationId } = {}): JobApplication {
  return JobApplication.create(
    {
      id: overrides.id ?? JobApplicationId.generate(),
      company: CompanyName.from("Acme Corp"),
      position: "Backend Engineer",
    },
    NOW,
  );
}

describe("InMemoryJobApplicationRepository", () => {
  let repository: InMemoryJobApplicationRepository;

  beforeEach(() => {
    repository = new InMemoryJobApplicationRepository();
  });

  describe("findById (not found)", () => {
    it("returns null when no application matches the id", async () => {
      const result = await repository.findById(JobApplicationId.generate());

      expect(result).toBeNull();
    });
  });

  describe("list (empty)", () => {
    it("returns an empty array when nothing was saved", async () => {
      const result = await repository.list();

      expect(result).toEqual([]);
    });
  });

  describe("delete (not found)", () => {
    it("does not throw when deleting an id that was never saved", async () => {
      await expect(repository.delete(JobApplicationId.generate())).resolves.toBeUndefined();
    });
  });

  describe("save / findById", () => {
    it("returns the saved application by id", async () => {
      const application = buildApplication();

      await repository.save(application);
      const found = await repository.findById(application.id);

      expect(found?.equals(application)).toBe(true);
    });

    it("overwrites the previous state when saving the same id again", async () => {
      const id = JobApplicationId.generate();
      const application = buildApplication({ id });
      const updated = application.changeStatus("application_sent", NOW);

      await repository.save(application);
      await repository.save(updated);
      const found = await repository.findById(id);

      expect(found?.status).toBe("application_sent");
    });
  });

  describe("list", () => {
    it("returns every saved application", async () => {
      const a = buildApplication();
      const b = buildApplication();

      await repository.save(a);
      await repository.save(b);
      const result = await repository.list();

      expect(result).toHaveLength(2);
    });

    it("filters by status when a filter is provided", async () => {
      const toContact = buildApplication();
      const sent = buildApplication().changeStatus("application_sent", NOW);

      await repository.save(toContact);
      await repository.save(sent);
      const result = await repository.list({ status: "application_sent" });

      expect(result).toHaveLength(1);
      expect(result[0]?.status).toBe("application_sent");
    });
  });

  describe("delete", () => {
    it("removes a previously saved application", async () => {
      const application = buildApplication();
      await repository.save(application);

      await repository.delete(application.id);
      const found = await repository.findById(application.id);

      expect(found).toBeNull();
    });
  });
});
