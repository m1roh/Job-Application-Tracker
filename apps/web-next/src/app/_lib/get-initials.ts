const INITIALS_LENGTH = 2;

export function getInitials(company: string): string {
  const words = company.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    throw new Error("Invalid company name: cannot be empty");
  }

  if (words.length >= INITIALS_LENGTH) {
    return (words[0]!.charAt(0) + words[1]!.charAt(0)).toUpperCase();
  }

  return words[0]!.slice(0, INITIALS_LENGTH).toUpperCase();
}
