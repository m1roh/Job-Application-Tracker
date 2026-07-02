import type { JobApplicationId } from "../../domain/value-objects/job-application-id.js";
import type { JobApplicationRepository } from "../ports/job-application-repository.js";

export class DeleteJobApplicationUseCase {
  constructor(private readonly repository: JobApplicationRepository) {}

  async execute(id: JobApplicationId): Promise<void> {
    await this.repository.delete(id);
  }
}
