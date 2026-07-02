import type { ApplicationStatus, JobApplication } from "../../domain/job-application.js";
import type { JobApplicationId } from "../../domain/value-objects/job-application-id.js";
import type { Clock } from "../ports/clock.js";
import type { JobApplicationRepository } from "../ports/job-application-repository.js";

export class ChangeApplicationStatusUseCase {
  constructor(
    private readonly repository: JobApplicationRepository,
    private readonly clock: Clock,
  ) {}

  async execute(id: JobApplicationId, newStatus: ApplicationStatus): Promise<JobApplication> {
    const application = await this.repository.findById(id);

    if (!application) {
      throw new Error(`No job application found for id: ${id.toString()}`);
    }

    const updated = application.changeStatus(newStatus, this.clock.now());

    await this.repository.save(updated);

    return updated;
  }
}
