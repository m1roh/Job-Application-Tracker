import type { JobApplication } from "../../domain/job-application";
import type { ApplicationFilter, JobApplicationRepository } from "../ports/job-application-repository";

export class ListJobApplicationsUseCase {
  constructor(private readonly repository: JobApplicationRepository) {}

  async execute(filter?: ApplicationFilter): Promise<JobApplication[]> {
    return this.repository.list(filter);
  }
}
