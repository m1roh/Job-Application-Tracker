import { JobApplication } from "../../domain/job-application";
import { CompanyName } from "../../domain/value-objects/company-name";
import { JobApplicationId } from "../../domain/value-objects/job-application-id";
import type { Clock } from "../ports/clock";
import type { JobApplicationRepository } from "../ports/job-application-repository";

export type CreateJobApplicationCommand = {
  company: string;
  position: string;
  applicationDate?: Date | null;
  offerUrl?: string | null;
  notes?: string;
};

export class CreateJobApplicationUseCase {
  constructor(
    private readonly repository: JobApplicationRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: CreateJobApplicationCommand): Promise<JobApplication> {
    const application = JobApplication.create(
      {
        id: JobApplicationId.generate(),
        company: CompanyName.from(command.company),
        position: command.position,
        applicationDate: command.applicationDate,
        offerUrl: command.offerUrl,
        notes: command.notes,
      },
      this.clock.now(),
    );

    await this.repository.save(application);

    return application;
  }
}
