const formatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date: cannot format an invalid Date");
  }

  return formatter.format(date);
}
