import type { ApplicationStatus, JobApplication } from "../../domain/job-application";
import type { JobApplicationId } from "../../domain/value-objects/job-application-id";
import type { Clock } from "../ports/clock";
import type { JobApplicationRepository } from "../ports/job-application-repository";

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
