import { JobApplication, type JobApplicationSnapshot } from "@job-tracker/core/domain/job-application";
import { CompanyName } from "@job-tracker/core/domain/value-objects/company-name";
import { JobApplicationId } from "@job-tracker/core/domain/value-objects/job-application-id";
import { toCandidatureResponse } from "./to-candidature-response";

function buildApplication(overrides: Partial<JobApplicationSnapshot> = {}): JobApplication {
  return JobApplication.reconstitute({
    id: JobApplicationId.generate(),
    company: CompanyName.from("Nova Tech"),
    position: "Dev. Full-Stack",
    status: "to_contact",
    applicationDate: null,
    nextFollowUp: null,
    offerUrl: null,
    notes: "",
    history: [],
    ...overrides,
  });
}

describe("toCandidatureResponse", () => {
  it("maps id, company, position, status and notes", () => {
    const id = JobApplicationId.generate();
    const application = buildApplication({ id, company: CompanyName.from("Nova Tech"), notes: "Contact via Camille" });

    const result = toCandidatureResponse(application);

    expect(result.id).toBe(id.toString());
    expect(result.company).toBe("Nova Tech");
    expect(result.position).toBe("Dev. Full-Stack");
    expect(result.status).toBe("to_contact");
    expect(result.notes).toBe("Contact via Camille");
  });

  it("has null applicationDate/nextFollowUp when not set", () => {
    const application = buildApplication({ applicationDate: null, nextFollowUp: null });

    const result = toCandidatureResponse(application);

    expect(result.applicationDate).toBeNull();
    expect(result.nextFollowUp).toBeNull();
  });

  it("formats applicationDate/nextFollowUp as raw ISO 8601 strings when set", () => {
    const application = buildApplication({
      applicationDate: new Date("2026-06-12T10:00:00.000Z"),
      nextFollowUp: new Date("2026-06-26T10:00:00.000Z"),
    });

    const result = toCandidatureResponse(application);

    expect(result.applicationDate).toBe("2026-06-12T10:00:00.000Z");
    expect(result.nextFollowUp).toBe("2026-06-26T10:00:00.000Z");
  });

  it("passes offerUrl through as-is", () => {
    const application = buildApplication({ offerUrl: "https://example.com/offer" });

    expect(toCandidatureResponse(application).offerUrl).toBe("https://example.com/offer");
  });

  it("returns an empty history array when there is no history yet", () => {
    const application = buildApplication({ history: [] });

    expect(toCandidatureResponse(application).history).toEqual([]);
  });

  it("maps history entries with ISO 8601 dates, in original order", () => {
    const application = buildApplication({
      status: "hr_interview",
      history: [
        { previousStatus: "to_contact", newStatus: "application_sent", date: new Date("2026-06-01T00:00:00.000Z") },
        {
          previousStatus: "application_sent",
          newStatus: "hr_interview",
          date: new Date("2026-06-10T00:00:00.000Z"),
        },
      ],
    });

    const result = toCandidatureResponse(application);

    expect(result.history).toEqual([
      { previousStatus: "to_contact", newStatus: "application_sent", date: "2026-06-01T00:00:00.000Z" },
      { previousStatus: "application_sent", newStatus: "hr_interview", date: "2026-06-10T00:00:00.000Z" },
    ]);
  });
});
