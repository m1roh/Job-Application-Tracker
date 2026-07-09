import { Module, type Provider } from "@nestjs/common";
import { ChangeApplicationStatusUseCase } from "@job-tracker/core/application/use-cases/change-application-status";
import { CreateJobApplicationUseCase } from "@job-tracker/core/application/use-cases/create-job-application";
import { DeleteJobApplicationUseCase } from "@job-tracker/core/application/use-cases/delete-job-application";
import { GetJobApplicationUseCase } from "@job-tracker/core/application/use-cases/get-job-application";
import { ListJobApplicationsUseCase } from "@job-tracker/core/application/use-cases/list-job-applications";
import { PlanFollowUpUseCase } from "@job-tracker/core/application/use-cases/plan-follow-up";
import type { Clock } from "@job-tracker/core/application/ports/clock";
import type { JobApplicationRepository } from "@job-tracker/core/application/ports/job-application-repository";
import {
  MongoJobApplicationRepository,
  type JobApplicationDocument,
} from "@job-tracker/infrastructure/repositories/job-application-repository.mongodb";
import { SystemClock } from "@job-tracker/infrastructure/services/clock.impl";
import type { Collection } from "mongodb";
import {
  jobApplicationsCollectionProvider,
  mongoClientProvider,
  MongoConnectionCloser,
} from "../database/mongo-collection.provider";
import { JOB_APPLICATIONS_COLLECTION } from "../database/tokens";
import { CandidaturesController } from "./candidatures.controller";
import { CLOCK, JOB_APPLICATION_REPOSITORY } from "./tokens";

const clockProvider: Provider = {
  provide: CLOCK,
  useFactory: (): Clock => new SystemClock(),
};

const repositoryProvider: Provider = {
  provide: JOB_APPLICATION_REPOSITORY,
  useFactory: (collection: Collection<JobApplicationDocument>): JobApplicationRepository =>
    new MongoJobApplicationRepository(collection),
  inject: [JOB_APPLICATIONS_COLLECTION],
};

const createUseCaseProvider: Provider = {
  provide: CreateJobApplicationUseCase,
  useFactory: (repository: JobApplicationRepository, clock: Clock) =>
    new CreateJobApplicationUseCase(repository, clock),
  inject: [JOB_APPLICATION_REPOSITORY, CLOCK],
};

const getUseCaseProvider: Provider = {
  provide: GetJobApplicationUseCase,
  useFactory: (repository: JobApplicationRepository) => new GetJobApplicationUseCase(repository),
  inject: [JOB_APPLICATION_REPOSITORY],
};

const listUseCaseProvider: Provider = {
  provide: ListJobApplicationsUseCase,
  useFactory: (repository: JobApplicationRepository) => new ListJobApplicationsUseCase(repository),
  inject: [JOB_APPLICATION_REPOSITORY],
};

const changeStatusUseCaseProvider: Provider = {
  provide: ChangeApplicationStatusUseCase,
  useFactory: (repository: JobApplicationRepository, clock: Clock) =>
    new ChangeApplicationStatusUseCase(repository, clock),
  inject: [JOB_APPLICATION_REPOSITORY, CLOCK],
};

const planFollowUpUseCaseProvider: Provider = {
  provide: PlanFollowUpUseCase,
  useFactory: (repository: JobApplicationRepository) => new PlanFollowUpUseCase(repository),
  inject: [JOB_APPLICATION_REPOSITORY],
};

const deleteUseCaseProvider: Provider = {
  provide: DeleteJobApplicationUseCase,
  useFactory: (repository: JobApplicationRepository) => new DeleteJobApplicationUseCase(repository),
  inject: [JOB_APPLICATION_REPOSITORY],
};

@Module({
  controllers: [CandidaturesController],
  providers: [
    mongoClientProvider,
    jobApplicationsCollectionProvider,
    MongoConnectionCloser,
    clockProvider,
    repositoryProvider,
    createUseCaseProvider,
    getUseCaseProvider,
    listUseCaseProvider,
    changeStatusUseCaseProvider,
    planFollowUpUseCaseProvider,
    deleteUseCaseProvider,
  ],
})
export class CandidaturesModule {}
