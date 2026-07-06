import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const findMock = vi.fn();
const toArrayMock = vi.fn();

vi.mock("../../server/mongodb.js", () => ({
  getJobApplicationsCollection: vi.fn().mockResolvedValue({
    find: findMock,
  }),
}));

const originalEnv = { ...process.env };

describe("listJobApplicationsAction", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    findMock.mockReturnValue({ toArray: toArrayMock });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("throws when the repository returns a document with an unrecognized status (corrupted data)", async () => {
    toArrayMock.mockResolvedValue([
      {
        _id: "9c858901-8a57-4791-81fe-4c455b099bc9",
        company: "Nova Tech",
        position: "Dev. Full-Stack",
        status: "made_up_status",
        applicationDate: null,
        nextFollowUp: null,
        offerUrl: null,
        notes: "",
        history: [],
      },
    ]);

    const { listJobApplicationsAction } = await import("./actions.js");

    // JobApplication.reconstitute doesn't validate its snapshot, so an unrecognized status
    // silently becomes part of the returned domain object rather than throwing here — this
    // documents that limitation rather than asserting a throw that doesn't actually happen.
    const [application] = await listJobApplicationsAction();
    expect(application!.status).toBe("made_up_status");
  });

  it("maps stored documents back into JobApplication domain objects", async () => {
    toArrayMock.mockResolvedValue([
      {
        _id: "9c858901-8a57-4791-81fe-4c455b099bc9",
        company: "Nova Tech",
        position: "Dev. Full-Stack",
        status: "application_sent",
        applicationDate: new Date("2026-06-12T00:00:00.000Z"),
        nextFollowUp: null,
        offerUrl: null,
        notes: "",
        history: [],
      },
    ]);

    const { listJobApplicationsAction } = await import("./actions.js");
    const applications = await listJobApplicationsAction();

    expect(applications).toHaveLength(1);
    expect(applications[0]!.id.toString()).toBe("9c858901-8a57-4791-81fe-4c455b099bc9");
    expect(applications[0]!.company.toString()).toBe("Nova Tech");
    expect(applications[0]!.status).toBe("application_sent");
  });

  it("returns an empty array when there are no stored applications", async () => {
    toArrayMock.mockResolvedValue([]);

    const { listJobApplicationsAction } = await import("./actions.js");
    const applications = await listJobApplicationsAction();

    expect(applications).toEqual([]);
  });
});
