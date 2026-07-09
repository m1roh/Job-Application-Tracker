"use server";

import { revalidatePath } from "next/cache";
import { ChangeApplicationStatusUseCase } from "@job-tracker/core/application/use-cases/change-application-status";
import { CreateJobApplicationUseCase } from "@job-tracker/core/application/use-cases/create-job-application";
import { DeleteJobApplicationUseCase } from "@job-tracker/core/application/use-cases/delete-job-application";
import { GetJobApplicationUseCase } from "@job-tracker/core/application/use-cases/get-job-application";
import { ListJobApplicationsUseCase } from "@job-tracker/core/application/use-cases/list-job-applications";
import { PlanFollowUpUseCase } from "@job-tracker/core/application/use-cases/plan-follow-up";
import type { ApplicationStatus, JobApplication } from "@job-tracker/core/domain/job-application";
import { JobApplicationId } from "@job-tracker/core/domain/value-objects/job-application-id";
import { MongoJobApplicationRepository } from "@job-tracker/infrastructure/repositories/job-application-repository.mongodb";
import { SystemClock } from "@job-tracker/infrastructure/services/clock.impl";
import { formatDate } from "../_lib/format-date";
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

export type ChangeApplicationStatusResult = { status: ApplicationStatus } | { error: string };

export async function changeApplicationStatusAction(
  id: string,
  newStatus: ApplicationStatus,
): Promise<ChangeApplicationStatusResult> {
  try {
    const collection = await getJobApplicationsCollection();
    const repository = new MongoJobApplicationRepository(collection);
    const useCase = new ChangeApplicationStatusUseCase(repository, new SystemClock());

    const application = await useCase.execute(JobApplicationId.from(id), newStatus);

    revalidatePath("/");
    revalidatePath(`/candidatures/${id}`);

    return { status: application.status };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Une erreur est survenue." };
  }
}

export type PlanFollowUpResult = { nextFollowUpLabel: string } | { error: string };

export async function planFollowUpAction(id: string, date: Date): Promise<PlanFollowUpResult> {
  try {
    const collection = await getJobApplicationsCollection();
    const repository = new MongoJobApplicationRepository(collection);
    const useCase = new PlanFollowUpUseCase(repository);

    const application = await useCase.execute(JobApplicationId.from(id), date);

    revalidatePath("/");
    revalidatePath(`/candidatures/${id}`);

    return { nextFollowUpLabel: formatDate(application.nextFollowUp!) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Une erreur est survenue." };
  }
}

export type DeleteJobApplicationResult = { success: true } | { error: string };

export async function deleteJobApplicationAction(id: string): Promise<DeleteJobApplicationResult> {
  try {
    const collection = await getJobApplicationsCollection();
    const repository = new MongoJobApplicationRepository(collection);
    const useCase = new DeleteJobApplicationUseCase(repository);

    await useCase.execute(JobApplicationId.from(id));

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Une erreur est survenue." };
  }
}

export async function getJobApplicationAction(id: string): Promise<JobApplication | null> {
  let jobApplicationId: JobApplicationId;

  try {
    jobApplicationId = JobApplicationId.from(id);
  } catch {
    return null;
  }

  const collection = await getJobApplicationsCollection();
  const repository = new MongoJobApplicationRepository(collection);
  const useCase = new GetJobApplicationUseCase(repository);

  return useCase.execute(jobApplicationId);
}
