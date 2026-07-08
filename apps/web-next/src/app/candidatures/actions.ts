"use server";

import { revalidatePath } from "next/cache";
import { CreateJobApplicationUseCase } from "@job-tracker/core/application/use-cases/create-job-application";
import { ListJobApplicationsUseCase } from "@job-tracker/core/application/use-cases/list-job-applications";
import type { JobApplication } from "@job-tracker/core/domain/job-application";
import { MongoJobApplicationRepository } from "@job-tracker/infrastructure/repositories/job-application-repository.mongodb";
import { SystemClock } from "@job-tracker/infrastructure/services/clock.impl";
import { getJobApplicationsCollection } from "../../server/mongodb";

export async function listJobApplicationsAction(): Promise<JobApplication[]> {
  const collection = await getJobApplicationsCollection();
  const repository = new MongoJobApplicationRepository(collection);
  const useCase = new ListJobApplicationsUseCase(repository);

  return useCase.execute();
}

export type CreateJobApplicationCommand = {
  company: string;
  position: string;
  offerUrl: string;
  notes: string;
};

export type CreateJobApplicationResult = { id: string } | { error: string };

export async function createJobApplicationAction(
  command: CreateJobApplicationCommand,
): Promise<CreateJobApplicationResult> {
  try {
    const collection = await getJobApplicationsCollection();
    const repository = new MongoJobApplicationRepository(collection);
    const useCase = new CreateJobApplicationUseCase(repository, new SystemClock());

    const application = await useCase.execute({
      company: command.company,
      position: command.position,
      offerUrl: command.offerUrl || null,
      notes: command.notes,
    });

    revalidatePath("/");

    return { id: application.id.toString() };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Une erreur est survenue." };
  }
}
