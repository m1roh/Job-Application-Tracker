import { describe, expect, it } from "vitest";
import type { KanbanApplication } from "../../components/organisms/kanban-board/kanban-board";
import { filterAndSortApplications, type DashboardFilters } from "./filter-and-sort-applications";

let nextId = 0;

function buildApplication(overrides: Partial<KanbanApplication> = {}): KanbanApplication {
  nextId += 1;
  return {
    id: `id-${nextId}`,
    company: "Nova Tech",
    initials: "NT",
    position: "Dev. Full-Stack",
    status: "to_contact",
    dateLabel: null,
    sortDate: null,
    ...overrides,
  };
}

const NO_FILTERS: DashboardFilters = {
  searchValue: "",
  statusFilter: "all",
  followUpOnly: false,
  sortOrder: "recent",
};

describe("filterAndSortApplications", () => {
  it("throws when the same application id appears twice (corrupted/duplicated data)", () => {
    const applications = [buildApplication({ id: "same-id" }), buildApplication({ id: "same-id" })];
    expect(() => filterAndSortApplications(applications, NO_FILTERS)).toThrow(
      "Invalid KanbanApplication list: duplicate id same-id",
    );
  });

  it("returns an empty array when there are no applications", () => {
    expect(filterAndSortApplications([], NO_FILTERS)).toEqual([]);
  });

  it("excludes applications that don't match the search value in company or position", () => {
    const match = buildApplication({ company: "Nova Tech" });
    const noMatch = buildApplication({ company: "Acme Corp", position: "Data Engineer" });

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
    const followUp = buildApplication({ status: "follow_up_sent" });
    const sent = buildApplication({ status: "application_sent" });

    const result = filterAndSortApplications([followUp, sent], { ...NO_FILTERS, followUpOnly: true });

    expect(result).toEqual([followUp]);
  });

  it("sorts applications with a sortDate before those without one, regardless of sort order", () => {
    const withDate = buildApplication({ sortDate: new Date("2026-06-01T00:00:00.000Z") });
    const withoutDate = buildApplication({ sortDate: null });

    expect(filterAndSortApplications([withoutDate, withDate], { ...NO_FILTERS, sortOrder: "recent" })).toEqual([
      withDate,
      withoutDate,
    ]);
    expect(filterAndSortApplications([withoutDate, withDate], { ...NO_FILTERS, sortOrder: "oldest" })).toEqual([
      withDate,
      withoutDate,
    ]);
  });

  it("keeps the original order between two applications that both have no sortDate", () => {
    const first = buildApplication({ sortDate: null });
    const second = buildApplication({ sortDate: null });

    expect(filterAndSortApplications([first, second], NO_FILTERS)).toEqual([first, second]);
  });

  it("orders by most recent sortDate first when sortOrder is recent", () => {
    const older = buildApplication({ sortDate: new Date("2026-06-01T00:00:00.000Z") });
    const newer = buildApplication({ sortDate: new Date("2026-06-15T00:00:00.000Z") });

    const result = filterAndSortApplications([older, newer], { ...NO_FILTERS, sortOrder: "recent" });

    expect(result).toEqual([newer, older]);
  });

  it("orders by oldest sortDate first when sortOrder is oldest", () => {
    const older = buildApplication({ sortDate: new Date("2026-06-01T00:00:00.000Z") });
    const newer = buildApplication({ sortDate: new Date("2026-06-15T00:00:00.000Z") });

    const result = filterAndSortApplications([newer, older], { ...NO_FILTERS, sortOrder: "oldest" });

    expect(result).toEqual([older, newer]);
  });
});
