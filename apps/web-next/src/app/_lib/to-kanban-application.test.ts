import { JobApplication, type JobApplicationSnapshot } from "@job-tracker/core/domain/job-application.js";
import { CompanyName } from "@job-tracker/core/domain/value-objects/company-name.js";
import { JobApplicationId } from "@job-tracker/core/domain/value-objects/job-application-id.js";
import { describe, expect, it } from "vitest";
import { toKanbanApplication } from "./to-kanban-application.js";

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

describe("toKanbanApplication", () => {
  it("throws when follow_up_sent has neither nextFollowUp nor a matching history entry (inconsistent data)", () => {
    const application = buildApplication({ status: "follow_up_sent", nextFollowUp: null, history: [] });
    expect(() => toKanbanApplication(application)).toThrow(
      "Invalid JobApplication: no history entry for status follow_up_sent",
    );
  });

  it("throws when a status is reached with no matching history entry (inconsistent data)", () => {
    const application = buildApplication({ status: "hr_interview", history: [] });
    expect(() => toKanbanApplication(application)).toThrow(
      "Invalid JobApplication: no history entry for status hr_interview",
    );
  });

  it("throws for an unrecognized status (corrupted data)", () => {
    const application = buildApplication({ status: "made_up_status" as JobApplicationSnapshot["status"] });
    expect(() => toKanbanApplication(application)).toThrow("Invalid JobApplication: unrecognized status made_up_status");
  });

  it("has no dateLabel for to_contact", () => {
    const application = buildApplication({ status: "to_contact" });
    expect(toKanbanApplication(application).dateLabel).toBeNull();
  });

  it("has no dateLabel for offer_open", () => {
    const application = buildApplication({ status: "offer_open" });
    expect(toKanbanApplication(application).dateLabel).toBeNull();
  });

  it("has no dateLabel for application_sent without an applicationDate", () => {
    const application = buildApplication({ status: "application_sent", applicationDate: null });
    expect(toKanbanApplication(application).dateLabel).toBeNull();
  });

  it("maps id, company, initials, position and status", () => {
    const application = buildApplication({ company: CompanyName.from("Nova Tech"), position: "Dev. Full-Stack" });
    const result = toKanbanApplication(application);

    expect(result.id).toBe(application.id.toString());
    expect(result.company).toBe("Nova Tech");
    expect(result.initials).toBe("NT");
    expect(result.position).toBe("Dev. Full-Stack");
    expect(result.status).toBe("to_contact");
  });

  it("labels application_sent with the applicationDate", () => {
    const application = buildApplication({
      status: "application_sent",
      applicationDate: new Date("2026-06-12T10:00:00.000Z"),
    });
    expect(toKanbanApplication(application).dateLabel).toBe("Envoyée le 12 juin 2026");
  });

  it("labels follow_up_sent with nextFollowUp when set", () => {
    const application = buildApplication({
      status: "follow_up_sent",
      nextFollowUp: new Date("2026-06-26T10:00:00.000Z"),
    });
    expect(toKanbanApplication(application).dateLabel).toBe("Relance le 26 juin 2026");
  });

  it("falls back to history for follow_up_sent when nextFollowUp is not set", () => {
    const application = buildApplication({
      status: "follow_up_sent",
      nextFollowUp: null,
      history: [
        { previousStatus: "application_sent", newStatus: "follow_up_sent", date: new Date("2026-06-20T10:00:00.000Z") },
      ],
    });
    expect(toKanbanApplication(application).dateLabel).toBe("Relance le 20 juin 2026");
  });

  it("labels hr_interview with the date it was reached", () => {
    const application = buildApplication({
      status: "hr_interview",
      history: [
        { previousStatus: "application_sent", newStatus: "hr_interview", date: new Date("2026-07-02T10:00:00.000Z") },
      ],
    });
    expect(toKanbanApplication(application).dateLabel).toBe("Entretien RH le 2 juillet 2026");
  });

  it("labels technical_interview with the date it was reached", () => {
    const application = buildApplication({
      status: "technical_interview",
      history: [
        { previousStatus: "hr_interview", newStatus: "technical_interview", date: new Date("2026-07-04T10:00:00.000Z") },
      ],
    });
    expect(toKanbanApplication(application).dateLabel).toBe("Entretien technique le 4 juillet 2026");
  });

  it("labels offer_received with the date it was reached", () => {
    const application = buildApplication({
      status: "offer_received",
      history: [
        {
          previousStatus: "technical_interview",
          newStatus: "offer_received",
          date: new Date("2026-06-28T10:00:00.000Z"),
        },
      ],
    });
    expect(toKanbanApplication(application).dateLabel).toBe("Reçue le 28 juin 2026");
  });

  it("labels rejected with the date it was reached", () => {
    const application = buildApplication({
      status: "rejected",
      history: [
        { previousStatus: "hr_interview", newStatus: "rejected", date: new Date("2026-06-10T10:00:00.000Z") },
      ],
    });
    expect(toKanbanApplication(application).dateLabel).toBe("Refus le 10 juin 2026");
  });

  it("labels on_hold with the date it was reached", () => {
    const application = buildApplication({
      status: "on_hold",
      history: [
        { previousStatus: "application_sent", newStatus: "on_hold", date: new Date("2026-05-05T10:00:00.000Z") },
      ],
    });
    expect(toKanbanApplication(application).dateLabel).toBe("En pause depuis le 5 mai 2026");
  });

  it("labels withdrawn with the date it was reached", () => {
    const application = buildApplication({
      status: "withdrawn",
      history: [
        { previousStatus: "to_contact", newStatus: "withdrawn", date: new Date("2026-04-01T10:00:00.000Z") },
      ],
    });
    expect(toKanbanApplication(application).dateLabel).toBe("Abandonnée le 1 avril 2026");
  });

  it("uses the most recent matching history entry when a status was reached more than once", () => {
    const application = buildApplication({
      status: "on_hold",
      history: [
        { previousStatus: "application_sent", newStatus: "on_hold", date: new Date("2026-04-01T10:00:00.000Z") },
        { previousStatus: "on_hold", newStatus: "hr_interview", date: new Date("2026-04-10T10:00:00.000Z") },
        { previousStatus: "hr_interview", newStatus: "on_hold", date: new Date("2026-05-05T10:00:00.000Z") },
      ],
    });
    expect(toKanbanApplication(application).dateLabel).toBe("En pause depuis le 5 mai 2026");
  });
});
