"use server";

import { ListJobApplicationsUseCase } from "@job-tracker/core/application/use-cases/list-job-applications.js";
import type { JobApplication } from "@job-tracker/core/domain/job-application.js";
import { MongoJobApplicationRepository } from "@job-tracker/infrastructure/repositories/job-application-repository.mongodb.js";
import { getJobApplicationsCollection } from "../../server/mongodb";

export async function listJobApplicationsAction(): Promise<JobApplication[]> {
  const collection = await getJobApplicationsCollection();
  const repository = new MongoJobApplicationRepository(collection);
  const useCase = new ListJobApplicationsUseCase(repository);

  return useCase.execute();
}
