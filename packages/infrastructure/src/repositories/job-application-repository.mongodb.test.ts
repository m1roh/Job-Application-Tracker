import { JobApplication } from "@job-tracker/core/domain/job-application";
import { CompanyName } from "@job-tracker/core/domain/value-objects/company-name";
import { JobApplicationId } from "@job-tracker/core/domain/value-objects/job-application-id";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, type Collection } from "mongodb";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoJobApplicationRepository, type JobApplicationDocument } from "./job-application-repository.mongodb";

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

describe("MongoJobApplicationRepository", () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let collection: Collection<JobApplicationDocument>;
  let repository: MongoJobApplicationRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    client = new MongoClient(mongoServer.getUri());
    await client.connect();
    collection = client.db("job-tracker-test").collection<JobApplicationDocument>("job-applications");
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(() => {
    repository = new MongoJobApplicationRepository(collection);
  });

  afterEach(async () => {
    await collection.deleteMany({});
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
      expect(found?.company.toString()).toBe("Acme Corp");
      expect(found?.status).toBe("to_contact");
    });

    it("round-trips history entries with their dates intact", async () => {
      const application = buildApplication().changeStatus("application_sent", NOW);

      await repository.save(application);
      const found = await repository.findById(application.id);

      expect(found?.history).toEqual(application.history);
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
