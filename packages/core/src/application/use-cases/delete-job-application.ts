import type { JobApplicationId } from "../../domain/value-objects/job-application-id";
import type { JobApplicationRepository } from "../ports/job-application-repository";

export class DeleteJobApplicationUseCase {
  constructor(private readonly repository: JobApplicationRepository) {}

  async execute(id: JobApplicationId): Promise<void> {
    await this.repository.delete(id);
  }
}
