import { JobApplication, type JobApplicationSnapshot } from "@job-tracker/core/domain/job-application.js";
import { CompanyName } from "@job-tracker/core/domain/value-objects/company-name.js";
import { JobApplicationId } from "@job-tracker/core/domain/value-objects/job-application-id.js";
import { describe, expect, it } from "vitest";
import { toStatItems } from "./to-stat-items.js";

function buildApplication(overrides: Partial<JobApplicationSnapshot> & { id?: JobApplicationId } = {}): JobApplication {
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

function findValue(items: ReturnType<typeof toStatItems>, label: string): string | number {
  const item = items.find((entry) => entry.label === label);
  if (!item) {
    throw new Error(`No stat item found for label "${label}"`);
  }
  return item.value;
}

describe("toStatItems", () => {
  it("throws for an unrecognized status (corrupted data)", () => {
    const applications = [buildApplication({ status: "made_up_status" as JobApplicationSnapshot["status"] })];
    expect(() => toStatItems(applications)).toThrow("Invalid JobApplication: unrecognized status made_up_status");
  });

  it("throws when the same application id appears twice (corrupted/duplicated data)", () => {
    const id = JobApplicationId.generate();
    const applications = [buildApplication({ id }), buildApplication({ id })];
    expect(() => toStatItems(applications)).toThrow(`Invalid JobApplication list: duplicate id ${id.toString()}`);
  });

  it("shows a dash for the response rate when there are no applications yet", () => {
    expect(findValue(toStatItems([]), "Taux de réponse")).toBe("—");
  });

  it("shows a dash for the response rate when nothing has been sent yet", () => {
    const applications = [buildApplication({ status: "to_contact" }), buildApplication({ status: "offer_open" })];
    expect(findValue(toStatItems(applications), "Taux de réponse")).toBe("—");
  });

  it("counts zero active applications and zero upcoming interviews when there are none", () => {
    const items = toStatItems([]);
    expect(findValue(items, "Candidatures actives")).toBe(0);
    expect(findValue(items, "Entretiens à venir")).toBe(0);
  });

  it("never exceeds 100%, even when every sent application has moved past application_sent", () => {
    // "Réponses" (status ≠ to_contact/offer_open/application_sent) is always a subset of
    // "Envoyées" (status ≠ to_contact/offer_open) — the ratio is capped at 100% by construction,
    // it never depends on whether the optional applicationDate field was filled in.
    const applications = [
      buildApplication({ status: "hr_interview", applicationDate: null }),
      buildApplication({ status: "rejected", applicationDate: null }),
    ];
    expect(findValue(toStatItems(applications), "Taux de réponse")).toBe("100%");
  });

  it("counts active applications as everyone except rejected, withdrawn and offer_received", () => {
    const applications = [
      buildApplication({ status: "to_contact" }),
      buildApplication({ status: "application_sent" }),
      buildApplication({ status: "on_hold" }),
      buildApplication({ status: "rejected" }),
      buildApplication({ status: "withdrawn" }),
      buildApplication({ status: "offer_received" }),
    ];
    expect(findValue(toStatItems(applications), "Candidatures actives")).toBe(3);
  });

  it("counts upcoming interviews as hr_interview and technical_interview only", () => {
    const applications = [
      buildApplication({ status: "hr_interview" }),
      buildApplication({ status: "technical_interview" }),
      buildApplication({ status: "application_sent" }),
      buildApplication({ status: "offer_received" }),
    ];
    expect(findValue(toStatItems(applications), "Entretiens à venir")).toBe(2);
  });

  it("computes the response rate as statuses past application_sent over statuses past to_contact/offer_open", () => {
    const applications = [
      buildApplication({ status: "to_contact" }),
      buildApplication({ status: "application_sent" }),
      buildApplication({ status: "application_sent" }),
      buildApplication({ status: "hr_interview" }),
      buildApplication({ status: "rejected" }),
    ];
    // envoyées = application_sent, application_sent, hr_interview, rejected = 4
    // réponses = hr_interview, rejected = 2
    expect(findValue(toStatItems(applications), "Taux de réponse")).toBe("50%");
  });

  it("rounds the response rate to the nearest percent", () => {
    const applications = [
      buildApplication({ status: "application_sent" }),
      buildApplication({ status: "application_sent" }),
      buildApplication({ status: "application_sent" }),
      buildApplication({ status: "offer_received" }),
    ];
    // envoyées = 4, réponses = 1 (offer_received) = 25%
    expect(findValue(toStatItems(applications), "Taux de réponse")).toBe("25%");
  });
});
