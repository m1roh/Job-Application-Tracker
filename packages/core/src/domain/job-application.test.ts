import { describe, expect, it } from "vitest";
import { JobApplication, type ApplicationStatus } from "./job-application.js";
import { CompanyName } from "./value-objects/company-name.js";
import { JobApplicationId } from "./value-objects/job-application-id.js";

const NOW = new Date("2026-07-02T10:00:00.000Z");

function createParams(overrides: Partial<Parameters<typeof JobApplication.create>[0]> = {}) {
  return {
    id: JobApplicationId.generate(),
    company: CompanyName.from("Acme Corp"),
    position: "Backend Engineer",
    ...overrides,
  };
}

const TERMINAL_STATUSES: ApplicationStatus[] = ["offer_received", "rejected", "withdrawn"];

const VALID_TRANSITIONS: Array<{ from: ApplicationStatus; to: ApplicationStatus }> = [
  { from: "to_contact", to: "offer_open" },
  { from: "to_contact", to: "application_sent" },
  { from: "to_contact", to: "withdrawn" },
  { from: "offer_open", to: "application_sent" },
  { from: "offer_open", to: "withdrawn" },
  { from: "application_sent", to: "follow_up_sent" },
  { from: "application_sent", to: "hr_interview" },
  { from: "application_sent", to: "rejected" },
  { from: "application_sent", to: "on_hold" },
  { from: "application_sent", to: "withdrawn" },
  { from: "follow_up_sent", to: "hr_interview" },
  { from: "follow_up_sent", to: "rejected" },
  { from: "follow_up_sent", to: "on_hold" },
  { from: "follow_up_sent", to: "withdrawn" },
  { from: "hr_interview", to: "technical_interview" },
  { from: "hr_interview", to: "rejected" },
  { from: "hr_interview", to: "on_hold" },
  { from: "technical_interview", to: "offer_received" },
  { from: "technical_interview", to: "rejected" },
  { from: "technical_interview", to: "on_hold" },
];

const PATHS_FROM_TO_CONTACT: Record<ApplicationStatus, ApplicationStatus[]> = {
  to_contact: [],
  offer_open: ["offer_open"],
  application_sent: ["application_sent"],
  follow_up_sent: ["application_sent", "follow_up_sent"],
  hr_interview: ["application_sent", "hr_interview"],
  technical_interview: ["application_sent", "hr_interview", "technical_interview"],
  offer_received: ["application_sent", "hr_interview", "technical_interview", "offer_received"],
  rejected: ["application_sent", "rejected"],
  on_hold: ["application_sent", "hr_interview", "on_hold"],
  withdrawn: ["withdrawn"],
};

function moveTo(status: ApplicationStatus, params = createParams()): JobApplication {
  let application = JobApplication.create(params, NOW);
  for (const step of PATHS_FROM_TO_CONTACT[status]) {
    application = application.changeStatus(step, NOW);
  }
  return application;
}

describe("JobApplication", () => {
  describe("create (invalid cases)", () => {
    it("rejects an empty position", () => {
      expect(() => JobApplication.create(createParams({ position: "" }), NOW)).toThrow();
    });

    it("rejects a whitespace-only position", () => {
      expect(() => JobApplication.create(createParams({ position: "   " }), NOW)).toThrow();
    });

    it("rejects an applicationDate in the future", () => {
      const future = new Date("2026-07-03T00:00:00.000Z");

      expect(() => JobApplication.create(createParams({ applicationDate: future }), NOW)).toThrow();
    });
  });

  describe("create (valid cases)", () => {
    it("starts with status to_contact and an empty history", () => {
      const application = JobApplication.create(createParams(), NOW);

      expect(application.status).toBe("to_contact");
      expect(application.history).toEqual([]);
    });

    it("accepts a past applicationDate", () => {
      const past = new Date("2026-01-01T00:00:00.000Z");

      expect(() => JobApplication.create(createParams({ applicationDate: past }), NOW)).not.toThrow();
    });

    it("accepts an applicationDate equal to now", () => {
      expect(() => JobApplication.create(createParams({ applicationDate: NOW }), NOW)).not.toThrow();
    });

    it("accepts a null applicationDate", () => {
      const application = JobApplication.create(createParams({ applicationDate: null }), NOW);

      expect(application.applicationDate).toBeNull();
    });

    it("starts with a null nextFollowUp", () => {
      const application = JobApplication.create(createParams(), NOW);

      expect(application.nextFollowUp).toBeNull();
    });
  });

  describe("changeStatus (invalid cases)", () => {
    it("rejects an unlisted transition from to_contact", () => {
      const application = JobApplication.create(createParams(), NOW);

      expect(() => application.changeStatus("hr_interview", NOW)).toThrow();
    });

    for (const status of TERMINAL_STATUSES) {
      it(`rejects any transition from the terminal status ${status}`, () => {
        const application = moveTo(status);

        expect(() => application.changeStatus("to_contact", NOW)).toThrow();
      });
    }

    it("rejects returning from on_hold to a status other than the one right before the pause", () => {
      const application = moveTo("on_hold");

      expect(() => application.changeStatus("to_contact", NOW)).toThrow();
    });
  });

  describe("changeStatus (valid cases)", () => {
    for (const { from, to } of VALID_TRANSITIONS) {
      it(`allows ${from} → ${to} and records it in history`, () => {
        const application = moveTo(from);

        const updated = application.changeStatus(to, NOW);

        expect(updated.status).toBe(to);
        expect(updated.history.at(-1)).toEqual({ previousStatus: from, newStatus: to, date: NOW });
      });
    }

    it("allows returning from on_hold to the status right before the pause", () => {
      const beforePause = moveTo("hr_interview");
      const paused = beforePause.changeStatus("on_hold", NOW);

      const resumed = paused.changeStatus("hr_interview", NOW);

      expect(resumed.status).toBe("hr_interview");
    });

    it("resets nextFollowUp to null when moving to a status other than application_sent/follow_up_sent", () => {
      const sent = moveTo("application_sent");
      const withFollowUp = sent.planFollowUp(new Date("2026-07-10T00:00:00.000Z"));

      const interviewing = withFollowUp.changeStatus("hr_interview", NOW);

      expect(interviewing.nextFollowUp).toBeNull();
    });

    it("keeps history entries in order across multiple transitions", () => {
      const application = moveTo("hr_interview");

      expect(application.history.map((entry) => entry.newStatus)).toEqual(["application_sent", "hr_interview"]);
    });
  });

  describe("planFollowUp (invalid cases)", () => {
    const disallowedStatuses: ApplicationStatus[] = ["to_contact", "offer_open", "hr_interview", "technical_interview"];

    for (const status of disallowedStatuses) {
      it(`rejects planning a follow-up while status is ${status}`, () => {
        const application = moveTo(status);

        expect(() => application.planFollowUp(new Date("2026-07-10T00:00:00.000Z"))).toThrow();
      });
    }
  });

  describe("planFollowUp (valid cases)", () => {
    it("sets nextFollowUp when status is application_sent", () => {
      const application = moveTo("application_sent");
      const followUpDate = new Date("2026-07-10T00:00:00.000Z");

      const updated = application.planFollowUp(followUpDate);

      expect(updated.nextFollowUp).toEqual(followUpDate);
    });

    it("sets nextFollowUp when status is follow_up_sent", () => {
      const application = moveTo("follow_up_sent");
      const followUpDate = new Date("2026-07-15T00:00:00.000Z");

      const updated = application.planFollowUp(followUpDate);

      expect(updated.nextFollowUp).toEqual(followUpDate);
    });
  });

  describe("equals", () => {
    it("returns true for two applications with the same id", () => {
      const id = JobApplicationId.generate();

      const a = JobApplication.create(createParams({ id }), NOW);
      const b = JobApplication.create(createParams({ id }), NOW);

      expect(a.equals(b)).toBe(true);
    });

    it("returns false for two applications with different ids", () => {
      const a = JobApplication.create(createParams(), NOW);
      const b = JobApplication.create(createParams(), NOW);

      expect(a.equals(b)).toBe(false);
    });
  });
});
