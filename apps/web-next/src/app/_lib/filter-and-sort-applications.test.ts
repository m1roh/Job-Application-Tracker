import { JobApplication, type JobApplicationSnapshot } from "@job-tracker/core/domain/job-application.js";
import { CompanyName } from "@job-tracker/core/domain/value-objects/company-name.js";
import { JobApplicationId } from "@job-tracker/core/domain/value-objects/job-application-id.js";
import { describe, expect, it } from "vitest";
import { filterAndSortApplications, type DashboardFilters } from "./filter-and-sort-applications.js";

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

const NO_FILTERS: DashboardFilters = {
  searchValue: "",
  statusFilter: "all",
  followUpOnly: false,
  sortOrder: "recent",
};

describe("filterAndSortApplications", () => {
  it("throws when the same application id appears twice (corrupted/duplicated data)", () => {
    const id = JobApplicationId.generate();
    const applications = [buildApplication({ id }), buildApplication({ id })];
    expect(() => filterAndSortApplications(applications, NO_FILTERS)).toThrow(
      `Invalid JobApplication list: duplicate id ${id.toString()}`,
    );
  });

  it("throws for an unrecognized status (corrupted data)", () => {
    const applications = [buildApplication({ status: "made_up_status" as JobApplicationSnapshot["status"] })];
    expect(() => filterAndSortApplications(applications, NO_FILTERS)).toThrow(
      "Invalid JobApplication: unrecognized status made_up_status",
    );
  });

  it("propagates the error from a recognized status with no matching history entry (corrupted data)", () => {
    const applications = [buildApplication({ status: "hr_interview", history: [] })];
    expect(() => filterAndSortApplications(applications, NO_FILTERS)).toThrow(
      "Invalid JobApplication: no history entry for status hr_interview",
    );
  });

  it("returns an empty array when there are no applications", () => {
    expect(filterAndSortApplications([], NO_FILTERS)).toEqual([]);
  });

  it("excludes applications that don't match the search value in company or position", () => {
    const match = buildApplication({ company: CompanyName.from("Nova Tech") });
    const noMatch = buildApplication({ company: CompanyName.from("Acme Corp"), position: "Data Engineer" });

    const result = filterAndSortApplications([match, noMatch], { ...NO_FILTERS, searchValue: "nova" });

    expect(result).toEqual([match]);
  });

  it("matches the search value case-insensitively against the position too", () => {
    const match = buildApplication({ position: "Ingénieur Backend" });
    const result = filterAndSortApplications([match], { ...NO_FILTERS, searchValue: "BACKEND" });

    expect(result).toEqual([match]);
  });

  it("excludes applications that don't match the status filter", () => {
    const sent = buildApplication({ status: "application_sent" });
    const toContact = buildApplication({ status: "to_contact" });

    const result = filterAndSortApplications([sent, toContact], { ...NO_FILTERS, statusFilter: "application_sent" });

    expect(result).toEqual([sent]);
  });

  it("keeps only follow_up_sent applications when followUpOnly is set", () => {
    const followUp = buildApplication({ status: "follow_up_sent", nextFollowUp: new Date("2026-06-01T00:00:00.000Z") });
    const sent = buildApplication({ status: "application_sent" });

    const result = filterAndSortApplications([followUp, sent], { ...NO_FILTERS, followUpOnly: true });

    expect(result).toEqual([followUp]);
  });

  it("sorts applications with an activity date before those without one, regardless of sort order", () => {
    const withDate = buildApplication({
      status: "application_sent",
      applicationDate: new Date("2026-06-01T00:00:00.000Z"),
    });
    const withoutDate = buildApplication({ status: "to_contact" });

    expect(filterAndSortApplications([withoutDate, withDate], { ...NO_FILTERS, sortOrder: "recent" })).toEqual([
      withDate,
      withoutDate,
    ]);
    expect(filterAndSortApplications([withoutDate, withDate], { ...NO_FILTERS, sortOrder: "oldest" })).toEqual([
      withDate,
      withoutDate,
    ]);
  });

  it("keeps the original order between two applications that both have no activity date", () => {
    const first = buildApplication({ status: "to_contact" });
    const second = buildApplication({ status: "offer_open" });

    expect(filterAndSortApplications([first, second], NO_FILTERS)).toEqual([first, second]);
  });

  it("orders by most recent activity first when sortOrder is recent", () => {
    const older = buildApplication({
      status: "application_sent",
      applicationDate: new Date("2026-06-01T00:00:00.000Z"),
    });
    const newer = buildApplication({
      status: "application_sent",
      applicationDate: new Date("2026-06-15T00:00:00.000Z"),
    });

    const result = filterAndSortApplications([older, newer], { ...NO_FILTERS, sortOrder: "recent" });

    expect(result).toEqual([newer, older]);
  });

  it("orders by oldest activity first when sortOrder is oldest", () => {
    const older = buildApplication({
      status: "application_sent",
      applicationDate: new Date("2026-06-01T00:00:00.000Z"),
    });
    const newer = buildApplication({
      status: "application_sent",
      applicationDate: new Date("2026-06-15T00:00:00.000Z"),
    });

    const result = filterAndSortApplications([newer, older], { ...NO_FILTERS, sortOrder: "oldest" });

    expect(result).toEqual([older, newer]);
  });
});
