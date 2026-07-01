import { randomUUID } from "node:crypto";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CandidatureId {
  private constructor(private readonly value: string) {}

  static from(value: string): CandidatureId {
    if (!UUID_PATTERN.test(value)) {
      throw new Error(`CandidatureId invalide : "${value}" n'est pas un UUID`);
    }

    return new CandidatureId(value);
  }

  static generate(): CandidatureId {
    return new CandidatureId(randomUUID());
  }

  toString(): string {
    return this.value;
  }

  equals(other: CandidatureId): boolean {
    return this.value === other.value;
  }
}
