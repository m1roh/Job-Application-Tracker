import { randomUUID } from "node:crypto";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class JobApplicationId {
  private constructor(private readonly value: string) {}

  static from(value: string): JobApplicationId {
    if (!UUID_PATTERN.test(value)) {
      throw new Error(`Invalid JobApplicationId: "${value}" is not a UUID`);
    }

    return new JobApplicationId(value);
  }

  static generate(): JobApplicationId {
    return new JobApplicationId(randomUUID());
  }

  toString(): string {
    return this.value;
  }

  equals(other: JobApplicationId): boolean {
    return this.value === other.value;
  }
}
