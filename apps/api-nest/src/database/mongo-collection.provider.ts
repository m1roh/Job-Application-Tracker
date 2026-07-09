import { Inject, Injectable, type OnModuleDestroy, type Provider } from "@nestjs/common";
import { MongoClient, type Collection } from "mongodb";
import {
  JOB_APPLICATIONS_COLLECTION_NAME,
  type JobApplicationDocument,
} from "@job-tracker/infrastructure/repositories/job-application-repository.mongodb";
import { env } from "../env";
import { JOB_APPLICATIONS_COLLECTION, MONGO_CLIENT } from "./tokens";

export const mongoClientProvider: Provider = {
  provide: MONGO_CLIENT,
  useFactory: (): Promise<MongoClient> => new MongoClient(env.mongodbUri).connect(),
};

export const jobApplicationsCollectionProvider: Provider = {
  provide: JOB_APPLICATIONS_COLLECTION,
  useFactory: (client: MongoClient): Collection<JobApplicationDocument> =>
    client.db(env.mongodbDbName).collection<JobApplicationDocument>(JOB_APPLICATIONS_COLLECTION_NAME),
  inject: [MONGO_CLIENT],
};

@Injectable()
export class MongoConnectionCloser implements OnModuleDestroy {
  constructor(@Inject(MONGO_CLIENT) private readonly client: MongoClient) {}

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }
}
