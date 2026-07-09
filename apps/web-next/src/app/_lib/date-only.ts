const ISO_DATE_ONLY_LENGTH = 10;

export function toIsoDateOnly(date: Date): string {
  return date.toISOString().slice(0, ISO_DATE_ONLY_LENGTH);
}
