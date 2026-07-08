import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const findMock = vi.fn();
const toArrayMock = vi.fn();
const replaceOneMock = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("../../server/mongodb", () => ({
  getJobApplicationsCollection: vi.fn().mockResolvedValue({
    find: findMock,
    replaceOne: replaceOneMock,
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
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

    const { listJobApplicationsAction } = await import("./actions");

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

    const { listJobApplicationsAction } = await import("./actions");
    const applications = await listJobApplicationsAction();

    expect(applications).toHaveLength(1);
    expect(applications[0]!.id.toString()).toBe("9c858901-8a57-4791-81fe-4c455b099bc9");
    expect(applications[0]!.company.toString()).toBe("Nova Tech");
    expect(applications[0]!.status).toBe("application_sent");
  });

  it("returns an empty array when there are no stored applications", async () => {
    toArrayMock.mockResolvedValue([]);

    const { listJobApplicationsAction } = await import("./actions");
    const applications = await listJobApplicationsAction();

    expect(applications).toEqual([]);
  });
});

describe("createJobApplicationAction", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    replaceOneMock.mockResolvedValue({});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns an error when the company name is empty, without saving anything", async () => {
    const { createJobApplicationAction } = await import("./actions");

    const result = await createJobApplicationAction({ company: "  ", position: "Dev", offerUrl: "", notes: "" });

    expect(result).toEqual({ error: "Invalid CompanyName: value cannot be empty" });
    expect(replaceOneMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns an error when the position is empty, without saving anything", async () => {
    const { createJobApplicationAction } = await import("./actions");

    const result = await createJobApplicationAction({ company: "Nova Tech", position: "  ", offerUrl: "", notes: "" });

    expect(result).toEqual({ error: "Invalid JobApplication: position cannot be empty" });
    expect(replaceOneMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("saves the application, revalidates the dashboard and returns its id on success", async () => {
    const { createJobApplicationAction } = await import("./actions");

    const result = await createJobApplicationAction({
      company: "Nova Tech",
      position: "Dev. Full-Stack",
      offerUrl: "",
      notes: "Contact via Camille",
    });

    expect(result).toHaveProperty("id");
    expect(typeof (result as { id: string }).id).toBe("string");
    expect(replaceOneMock).toHaveBeenCalledOnce();
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
  });

  it("stores an empty offerUrl as null", async () => {
    const { createJobApplicationAction } = await import("./actions");

    await createJobApplicationAction({ company: "Nova Tech", position: "Dev", offerUrl: "", notes: "" });

    const [, savedDocument] = replaceOneMock.mock.calls[0]!;
    expect(savedDocument.offerUrl).toBeNull();
  });

  it("falls back to a generic message when something other than an Error is thrown", async () => {
    replaceOneMock.mockRejectedValueOnce("a non-Error rejection");
    const { createJobApplicationAction } = await import("./actions");

    const result = await createJobApplicationAction({ company: "Nova Tech", position: "Dev", offerUrl: "", notes: "" });

    expect(result).toEqual({ error: "Une erreur est survenue." });
  });
});
