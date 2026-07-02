import type { JobApplication } from "../../domain/job-application.js";
import type { JobApplicationId } from "../../domain/value-objects/job-application-id.js";
import type { JobApplicationRepository } from "../ports/job-application-repository.js";

export class PlanFollowUpUseCase {
  constructor(private readonly repository: JobApplicationRepository) {}

  async execute(id: JobApplicationId, date: Date): Promise<JobApplication> {
    const application = await this.repository.findById(id);

    if (!application) {
      throw new Error(`No job application found for id: ${id.toString()}`);
    }

    const updated = application.planFollowUp(date);

    await this.repository.save(updated);

    return updated;
  }
}
