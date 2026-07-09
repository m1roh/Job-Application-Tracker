import { MongoClient, type Collection } from "mongodb";
import {
  JOB_APPLICATIONS_COLLECTION_NAME,
  type JobApplicationDocument,
} from "@job-tracker/infrastructure/repositories/job-application-repository.mongodb";

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function getRequiredEnv(): { uri: string; dbName: string } {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!uri) {
    throw new Error("Missing required environment variable: MONGODB_URI");
  }

  if (!dbName) {
    throw new Error("Missing required environment variable: MONGODB_DB_NAME");
  }

  return { uri, dbName };
}

function getClientPromise(uri: string): Promise<MongoClient> {
  const cached = globalThis.__mongoClientPromise ?? new MongoClient(uri).connect();
  globalThis.__mongoClientPromise = cached;

  return cached;
}

export async function getJobApplicationsCollection(): Promise<Collection<JobApplicationDocument>> {
  const { uri, dbName } = getRequiredEnv();
  const client = await getClientPromise(uri);

  return client.db(dbName).collection<JobApplicationDocument>(JOB_APPLICATIONS_COLLECTION_NAME);
}
