import type { ApplicationStatus, JobApplicationSnapshot, StatusChange } from "@job-tracker/core/domain/job-application";
import { JobApplication } from "@job-tracker/core/domain/job-application";
import { CompanyName } from "@job-tracker/core/domain/value-objects/company-name";
import { JobApplicationId } from "@job-tracker/core/domain/value-objects/job-application-id";
import type {
  ApplicationFilter,
  JobApplicationRepository,
} from "@job-tracker/core/application/ports/job-application-repository";
import type { Collection, Filter } from "mongodb";

export const JOB_APPLICATIONS_COLLECTION_NAME = "job-applications";

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
  const { position, status, applicationDate, nextFollowUp, offerUrl, notes, history } = application;

  return {
    _id: application.id.toString(),
    company: application.company.toString(),
    position,
    status,
    applicationDate,
    nextFollowUp,
    offerUrl,
    notes,
    history,
  };
}

function toDomain(document: JobApplicationDocument): JobApplication {
  const { _id, company, position, status, applicationDate, nextFollowUp, offerUrl, notes, history } = document;

  const snapshot: JobApplicationSnapshot = {
    id: JobApplicationId.from(_id),
    company: CompanyName.from(company),
    position,
    status,
    applicationDate,
    nextFollowUp,
    offerUrl,
    notes,
    history,
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
