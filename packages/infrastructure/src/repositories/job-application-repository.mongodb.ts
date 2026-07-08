import type { ApplicationStatus, JobApplicationSnapshot, StatusChange } from "@job-tracker/core/domain/job-application";
import { JobApplication } from "@job-tracker/core/domain/job-application";
import { CompanyName } from "@job-tracker/core/domain/value-objects/company-name";
import { JobApplicationId } from "@job-tracker/core/domain/value-objects/job-application-id";
import type { ApplicationFilter, JobApplicationRepository } from "@job-tracker/core/application/ports/job-application-repository";
import type { Collection, Filter } from "mongodb";

export type JobApplicationDocument = {
  _id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  applicationDate: Date | null;
  nextFollowUp: Date | null;
  offerUrl: string | null;
  notes: string;
  history: StatusChange[];
};

function toDocument(application: JobApplication): JobApplicationDocument {
  return {
    _id: application.id.toString(),
    company: application.company.toString(),
    position: application.position,
    status: application.status,
    applicationDate: application.applicationDate,
    nextFollowUp: application.nextFollowUp,
    offerUrl: application.offerUrl,
    notes: application.notes,
    history: application.history,
  };
}

function toDomain(document: JobApplicationDocument): JobApplication {
  const snapshot: JobApplicationSnapshot = {
    id: JobApplicationId.from(document._id),
    company: CompanyName.from(document.company),
    position: document.position,
    status: document.status,
    applicationDate: document.applicationDate,
    nextFollowUp: document.nextFollowUp,
    offerUrl: document.offerUrl,
    notes: document.notes,
    history: document.history,
  };

  return JobApplication.reconstitute(snapshot);
}

export class MongoJobApplicationRepository implements JobApplicationRepository {
  constructor(private readonly collection: Collection<JobApplicationDocument>) {}

  async save(application: JobApplication): Promise<void> {
    const document = toDocument(application);

    await this.collection.replaceOne({ _id: document._id }, document, { upsert: true });
  }

  async findById(id: JobApplicationId): Promise<JobApplication | null> {
    const document = await this.collection.findOne({ _id: id.toString() });

    return document ? toDomain(document) : null;
  }

  async list(filter?: ApplicationFilter): Promise<JobApplication[]> {
    const query: Filter<JobApplicationDocument> = {};
    if (filter?.status) {
      query.status = filter.status;
    }

    const documents = await this.collection.find(query).toArray();

    return documents.map(toDomain);
  }

  async delete(id: JobApplicationId): Promise<void> {
    await this.collection.deleteOne({ _id: id.toString() });
  }
}
