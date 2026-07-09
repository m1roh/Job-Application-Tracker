const MAX_LENGTH = 200;
// eslint-disable-next-line no-control-regex -- intentional: rejects control characters in user input (security, section 10 of the design doc)
const CONTROL_CHAR_PATTERN = /[\x00-\x1F\x7F]/;

export class CompanyName {
  private constructor(private readonly value: string) {}

  static from(value: string): CompanyName {
    if (value.trim().length === 0) {
      throw new Error("Invalid CompanyName: value cannot be empty");
    }

    if (value.length > MAX_LENGTH) {
      throw new Error(`Invalid CompanyName: exceeds ${MAX_LENGTH} characters`);
    }

    if (CONTROL_CHAR_PATTERN.test(value)) {
      throw new Error("Invalid CompanyName: contains a control character");
    }

    return new CompanyName(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: CompanyName): boolean {
    return this.value === other.value;
  }
}
