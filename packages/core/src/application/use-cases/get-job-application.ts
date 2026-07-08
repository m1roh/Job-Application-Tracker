import type { JobApplication } from "../../domain/job-application";
import type { JobApplicationId } from "../../domain/value-objects/job-application-id";
import type { JobApplicationRepository } from "../ports/job-application-repository";

export class GetJobApplicationUseCase {
  constructor(private readonly repository: JobApplicationRepository) {}

  async execute(id: JobApplicationId): Promise<JobApplication | null> {
    return this.repository.findById(id);
  }
}
