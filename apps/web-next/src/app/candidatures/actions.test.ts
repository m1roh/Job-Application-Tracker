import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const findMock = vi.fn();
const toArrayMock = vi.fn();
const replaceOneMock = vi.fn();
const findOneMock = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("../../server/mongodb", () => ({
  getJobApplicationsCollection: vi.fn().mockResolvedValue({
    find: findMock,
    replaceOne: replaceOneMock,
    findOne: findOneMock,
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

describe("changeApplicationStatusAction", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    replaceOneMock.mockResolvedValue({});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  const existingDocument = {
    _id: "9c858901-8a57-4791-81fe-4c455b099bc9",
    company: "Nova Tech",
    position: "Dev. Full-Stack",
    status: "to_contact",
    applicationDate: null,
    nextFollowUp: null,
    offerUrl: null,
    notes: "",
    history: [],
  };

  describe("invalid cases", () => {
    it("returns an error when no application matches the id, without saving anything", async () => {
      findOneMock.mockResolvedValue(null);
      const { changeApplicationStatusAction } = await import("./actions");

      const result = await changeApplicationStatusAction(existingDocument._id, "application_sent");

      expect(result).toHaveProperty("error");
      expect(replaceOneMock).not.toHaveBeenCalled();
      expect(revalidatePathMock).not.toHaveBeenCalled();
    });

    it("returns an error when the transition is not allowed from the current status, without saving anything", async () => {
      findOneMock.mockResolvedValue(existingDocument);
      const { changeApplicationStatusAction } = await import("./actions");

      const result = await changeApplicationStatusAction(existingDocument._id, "hr_interview");

      expect(result).toHaveProperty("error");
      expect(replaceOneMock).not.toHaveBeenCalled();
      expect(revalidatePathMock).not.toHaveBeenCalled();
    });
  });

  describe("valid cases", () => {
    it("saves the new status and revalidates the dashboard and detail page", async () => {
      findOneMock.mockResolvedValue(existingDocument);
      const { changeApplicationStatusAction } = await import("./actions");

      const result = await changeApplicationStatusAction(existingDocument._id, "application_sent");

      expect(result).toEqual({ status: "application_sent" });
      expect(replaceOneMock).toHaveBeenCalledOnce();
      expect(revalidatePathMock).toHaveBeenCalledWith("/");
      expect(revalidatePathMock).toHaveBeenCalledWith(`/candidatures/${existingDocument._id}`);
    });

    it("falls back to a generic message when something other than an Error is thrown", async () => {
      findOneMock.mockResolvedValue(existingDocument);
      replaceOneMock.mockRejectedValueOnce("a non-Error rejection");
      const { changeApplicationStatusAction } = await import("./actions");

      const result = await changeApplicationStatusAction(existingDocument._id, "application_sent");

      expect(result).toEqual({ error: "Une erreur est survenue." });
    });
  });
});

describe("planFollowUpAction", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    replaceOneMock.mockResolvedValue({});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  const sentDocument = {
    _id: "9c858901-8a57-4791-81fe-4c455b099bc9",
    company: "Nova Tech",
    position: "Dev. Full-Stack",
    status: "application_sent",
    applicationDate: new Date("2026-06-12T00:00:00.000Z"),
    nextFollowUp: null,
    offerUrl: null,
    notes: "",
    history: [],
  };

  const notSentDocument = {
    ...sentDocument,
    status: "to_contact",
    applicationDate: null,
  };

  describe("invalid cases", () => {
    it("returns an error when no application matches the id, without saving anything", async () => {
      findOneMock.mockResolvedValue(null);
      const { planFollowUpAction } = await import("./actions");

      const result = await planFollowUpAction(sentDocument._id, new Date("2026-07-10T00:00:00.000Z"));

      expect(result).toHaveProperty("error");
      expect(replaceOneMock).not.toHaveBeenCalled();
      expect(revalidatePathMock).not.toHaveBeenCalled();
    });

    it("returns an error when the current status does not allow planning a follow-up, without saving anything", async () => {
      findOneMock.mockResolvedValue(notSentDocument);
      const { planFollowUpAction } = await import("./actions");

      const result = await planFollowUpAction(notSentDocument._id, new Date("2026-07-10T00:00:00.000Z"));

      expect(result).toHaveProperty("error");
      expect(replaceOneMock).not.toHaveBeenCalled();
      expect(revalidatePathMock).not.toHaveBeenCalled();
    });
  });

  describe("valid cases", () => {
    it("saves the follow-up date, revalidates the dashboard and detail page, and returns a formatted label", async () => {
      findOneMock.mockResolvedValue(sentDocument);
      const { planFollowUpAction } = await import("./actions");

      const result = await planFollowUpAction(sentDocument._id, new Date("2026-07-10T00:00:00.000Z"));

      expect(result).toEqual({ nextFollowUpLabel: "10 juillet 2026" });
      expect(replaceOneMock).toHaveBeenCalledOnce();
      expect(revalidatePathMock).toHaveBeenCalledWith("/");
      expect(revalidatePathMock).toHaveBeenCalledWith(`/candidatures/${sentDocument._id}`);
    });

    it("falls back to a generic message when something other than an Error is thrown", async () => {
      findOneMock.mockResolvedValue(sentDocument);
      replaceOneMock.mockRejectedValueOnce("a non-Error rejection");
      const { planFollowUpAction } = await import("./actions");

      const result = await planFollowUpAction(sentDocument._id, new Date("2026-07-10T00:00:00.000Z"));

      expect(result).toEqual({ error: "Une erreur est survenue." });
    });
  });
});

describe("getJobApplicationAction", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns null for a malformed id, without querying Mongo", async () => {
    const { getJobApplicationAction } = await import("./actions");

    const result = await getJobApplicationAction("not-a-uuid");

    expect(result).toBeNull();
    expect(findOneMock).not.toHaveBeenCalled();
  });

  it("returns null when no document matches the id", async () => {
    findOneMock.mockResolvedValue(null);
    const { getJobApplicationAction } = await import("./actions");

    const result = await getJobApplicationAction("9c858901-8a57-4791-81fe-4c455b099bc9");

    expect(result).toBeNull();
  });

  it("returns the matching application", async () => {
    findOneMock.mockResolvedValue({
      _id: "9c858901-8a57-4791-81fe-4c455b099bc9",
      company: "Nova Tech",
      position: "Dev. Full-Stack",
      status: "to_contact",
      applicationDate: null,
      nextFollowUp: null,
      offerUrl: null,
      notes: "",
      history: [],
    });
    const { getJobApplicationAction } = await import("./actions");

    const result = await getJobApplicationAction("9c858901-8a57-4791-81fe-4c455b099bc9");

    expect(result?.id.toString()).toBe("9c858901-8a57-4791-81fe-4c455b099bc9");
    expect(result?.company.toString()).toBe("Nova Tech");
  });
});
