import type {
  ApplicationFilter,
  JobApplicationRepository,
} from "@job-tracker/core/application/ports/job-application-repository";
import type { JobApplication } from "@job-tracker/core/domain/job-application";
import type { JobApplicationId } from "@job-tracker/core/domain/value-objects/job-application-id";

export class InMemoryJobApplicationRepository implements JobApplicationRepository {
  private readonly applications = new Map<string, JobApplication>();

  async save(application: JobApplication): Promise<void> {
    this.applications.set(application.id.toString(), application);
  }

  async findById(id: JobApplicationId): Promise<JobApplication | null> {
    return this.applications.get(id.toString()) ?? null;
  }

  async list(filter?: ApplicationFilter): Promise<JobApplication[]> {
    const all = [...this.applications.values()];

    if (!filter?.status) {
      return all;
    }

    return all.filter((application) => application.status === filter.status);
  }

  async delete(id: JobApplicationId): Promise<void> {
    this.applications.delete(id.toString());
  }
}
