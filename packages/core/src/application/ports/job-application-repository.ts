import type { ApplicationStatus, JobApplication } from "../../domain/job-application";
import type { JobApplicationId } from "../../domain/value-objects/job-application-id";

export type ApplicationFilter = {
  status?: ApplicationStatus;
};

export interface JobApplicationRepository {
  save(application: JobApplication): Promise<void>;
  findById(id: JobApplicationId): Promise<JobApplication | null>;
  list(filter?: ApplicationFilter): Promise<JobApplication[]>;
  delete(id: JobApplicationId): Promise<void>;
}
