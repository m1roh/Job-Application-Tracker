import { statusColors } from "@job-tracker/design-tokens";
import { JobApplication, type JobApplicationSnapshot } from "@job-tracker/core/domain/job-application";
import { CompanyName } from "@job-tracker/core/domain/value-objects/company-name";
import { JobApplicationId } from "@job-tracker/core/domain/value-objects/job-application-id";
import { describe, expect, it } from "vitest";
import { toApplicationDetailProps } from "./to-application-detail-props";

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

describe("toApplicationDetailProps", () => {
  it("throws for an unrecognized top-level status (corrupted data)", () => {
    const application = buildApplication({ status: "made_up_status" as JobApplicationSnapshot["status"] });
    expect(() => toApplicationDetailProps(application)).toThrow(
      "Invalid JobApplication: unrecognized status made_up_status",
    );
  });

  it("throws for an unrecognized status inside a history entry (corrupted data)", () => {
    const application = buildApplication({
      status: "application_sent",
      history: [
        {
          previousStatus: "to_contact",
          newStatus: "made_up_status" as JobApplicationSnapshot["status"],
          date: new Date("2026-06-01T00:00:00.000Z"),
        },
      ],
    });
    expect(() => toApplicationDetailProps(application)).toThrow(
      "Invalid JobApplication: unrecognized status made_up_status",
    );
  });

  it("maps company, initials, position and status", () => {
    const application = buildApplication({ company: CompanyName.from("Nova Tech"), position: "Dev. Full-Stack" });
    const result = toApplicationDetailProps(application);

    expect(result.company).toBe("Nova Tech");
    expect(result.initials).toBe("NT");
    expect(result.position).toBe("Dev. Full-Stack");
    expect(result.status).toBe("to_contact");
  });

  it("passes the application id through as a string", () => {
    const id = JobApplicationId.generate();
    const application = buildApplication({ id });
    const result = toApplicationDetailProps(application);

    expect(result.id).toBe(id.toString());
  });

  it("returns an empty nextStatusActions array for a terminal status", () => {
    const application = buildApplication({ status: "rejected" });
    expect(toApplicationDetailProps(application).nextStatusActions).toEqual([]);
  });

  it("maps allowedNextStatuses to status/label pairs", () => {
    const application = buildApplication({ status: "to_contact" });
    const result = toApplicationDetailProps(application);

    expect(result.nextStatusActions).toEqual([
      { status: "offer_open", label: "Offre ouverte", requiresConfirmation: false },
      { status: "application_sent", label: "Candidature envoyée", requiresConfirmation: false },
      { status: "withdrawn", label: "Abandonné", requiresConfirmation: true },
    ]);
  });

  it("has null applicationDateLabel/nextFollowUpLabel when not set", () => {
    const application = buildApplication({ applicationDate: null, nextFollowUp: null });
    const result = toApplicationDetailProps(application);

    expect(result.applicationDateLabel).toBeNull();
    expect(result.nextFollowUpLabel).toBeNull();
  });

  it("formats applicationDateLabel and nextFollowUpLabel when set", () => {
    const application = buildApplication({
      applicationDate: new Date("2026-06-12T10:00:00.000Z"),
      nextFollowUp: new Date("2026-06-26T10:00:00.000Z"),
    });
    const result = toApplicationDetailProps(application);

    expect(result.applicationDateLabel).toBe("12 juin 2026");
    expect(result.nextFollowUpLabel).toBe("26 juin 2026");
  });

  it("passes offerUrl and notes through as-is", () => {
    const application = buildApplication({ offerUrl: "https://example.com/offer", notes: "Contact via Camille" });
    const result = toApplicationDetailProps(application);

    expect(result.offerUrl).toBe("https://example.com/offer");
    expect(result.notes).toBe("Contact via Camille");
  });

  it("returns an empty history array when there is no history yet", () => {
    const application = buildApplication({ history: [] });
    expect(toApplicationDetailProps(application).history).toEqual([]);
  });

  it("maps history entries to label/date/dotColor, most recent first", () => {
    const application = buildApplication({
      status: "hr_interview",
      history: [
        {
          previousStatus: "to_contact",
          newStatus: "application_sent",
          date: new Date("2026-06-01T00:00:00.000Z"),
        },
        {
          previousStatus: "application_sent",
          newStatus: "hr_interview",
          date: new Date("2026-06-10T00:00:00.000Z"),
        },
      ],
    });

    const result = toApplicationDetailProps(application);

    expect(result.history).toEqual([
      { label: "Entretien RH", date: "10 juin 2026", dotColor: statusColors.hr_interview.dot },
      { label: "Candidature envoyée", date: "1 juin 2026", dotColor: statusColors.application_sent.dot },
    ]);
  });
});
