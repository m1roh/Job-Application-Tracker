import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const connectMock = vi.fn();
const collectionMock = vi.fn();
const dbMock = vi.fn(() => ({ collection: collectionMock }));

vi.mock("mongodb", () => {
  return {
    MongoClient: vi.fn().mockImplementation(function MockMongoClient(this: { connect: typeof connectMock }) {
      this.connect = connectMock;
    }),
  };
});

const originalEnv = { ...process.env };

describe("getJobApplicationsCollection", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete (globalThis as { __mongoClientPromise?: unknown }).__mongoClientPromise;
    connectMock.mockResolvedValue({ db: dbMock });
    process.env.MONGODB_URI = "mongodb://test-host:27017";
    process.env.MONGODB_DB_NAME = "test-db";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("throws when MONGODB_URI is missing", async () => {
    delete process.env.MONGODB_URI;
    const { getJobApplicationsCollection } = await import("./mongodb.js");

    await expect(getJobApplicationsCollection()).rejects.toThrow("MONGODB_URI");
  });

  it("throws when MONGODB_DB_NAME is missing", async () => {
    delete process.env.MONGODB_DB_NAME;
    const { getJobApplicationsCollection } = await import("./mongodb.js");

    await expect(getJobApplicationsCollection()).rejects.toThrow("MONGODB_DB_NAME");
  });

  it("does not attempt to connect when an environment variable is missing", async () => {
    delete process.env.MONGODB_URI;
    const { getJobApplicationsCollection } = await import("./mongodb.js");

    await expect(getJobApplicationsCollection()).rejects.toThrow();
    expect(connectMock).not.toHaveBeenCalled();
  });

  it("reuses the same MongoClient connection across calls", async () => {
    const { MongoClient } = await import("mongodb");
    const { getJobApplicationsCollection } = await import("./mongodb.js");

    await getJobApplicationsCollection();
    await getJobApplicationsCollection();

    expect(MongoClient).toHaveBeenCalledTimes(1);
  });

  it("returns the job-applications collection from the configured database", async () => {
    const { getJobApplicationsCollection } = await import("./mongodb.js");

    await getJobApplicationsCollection();

    expect(dbMock).toHaveBeenCalledWith("test-db");
    expect(collectionMock).toHaveBeenCalledWith("job-applications");
  });
});
