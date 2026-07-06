export function getInitials(company: string): string {
  const words = company.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    throw new Error("Invalid company name: cannot be empty");
  }

  if (words.length >= 2) {
    return (words[0]!.charAt(0) + words[1]!.charAt(0)).toUpperCase();
  }

  return words[0]!.slice(0, 2).toUpperCase();
}
