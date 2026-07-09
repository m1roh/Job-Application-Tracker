import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ChangeApplicationStatusUseCase } from "@job-tracker/core/application/use-cases/change-application-status";
import { CreateJobApplicationUseCase } from "@job-tracker/core/application/use-cases/create-job-application";
import { DeleteJobApplicationUseCase } from "@job-tracker/core/application/use-cases/delete-job-application";
import { GetJobApplicationUseCase } from "@job-tracker/core/application/use-cases/get-job-application";
import { ListJobApplicationsUseCase } from "@job-tracker/core/application/use-cases/list-job-applications";
import { PlanFollowUpUseCase } from "@job-tracker/core/application/use-cases/plan-follow-up";
import { JobApplication } from "@job-tracker/core/domain/job-application";
import { CompanyName } from "@job-tracker/core/domain/value-objects/company-name";
import { JobApplicationId } from "@job-tracker/core/domain/value-objects/job-application-id";
import { CandidaturesController } from "./candidatures.controller";

const VALID_ID = "9c858901-8a57-4791-81fe-4c455b099bc9";
const MALFORMED_ID = "not-a-uuid";

function buildApplication(): JobApplication {
  return JobApplication.reconstitute({
    id: JobApplicationId.from(VALID_ID),
    company: CompanyName.from("Nova Tech"),
    position: "Dev. Full-Stack",
    status: "to_contact",
    applicationDate: null,
    nextFollowUp: null,
    offerUrl: null,
    notes: "",
    history: [],
  });
}

async function buildController(): Promise<{
  controller: CandidaturesController;
  createUseCase: { execute: jest.Mock };
  getUseCase: { execute: jest.Mock };
  listUseCase: { execute: jest.Mock };
  changeStatusUseCase: { execute: jest.Mock };
  planFollowUpUseCase: { execute: jest.Mock };
  deleteUseCase: { execute: jest.Mock };
}> {
  const createUseCase = { execute: jest.fn() };
  const getUseCase = { execute: jest.fn() };
  const listUseCase = { execute: jest.fn() };
  const changeStatusUseCase = { execute: jest.fn() };
  const planFollowUpUseCase = { execute: jest.fn() };
  const deleteUseCase = { execute: jest.fn() };

  const module = await Test.createTestingModule({
    controllers: [CandidaturesController],
    providers: [
      { provide: CreateJobApplicationUseCase, useValue: createUseCase },
      { provide: GetJobApplicationUseCase, useValue: getUseCase },
      { provide: ListJobApplicationsUseCase, useValue: listUseCase },
      { provide: ChangeApplicationStatusUseCase, useValue: changeStatusUseCase },
      { provide: PlanFollowUpUseCase, useValue: planFollowUpUseCase },
      { provide: DeleteJobApplicationUseCase, useValue: deleteUseCase },
    ],
  }).compile();

  return {
    controller: module.get(CandidaturesController),
    createUseCase,
    getUseCase,
    listUseCase,
    changeStatusUseCase,
    planFollowUpUseCase,
    deleteUseCase,
  };
}

describe("CandidaturesController (invalid cases)", () => {
  it("GET /candidatures/:id rejects a malformed id with 400", async () => {
    const { controller } = await buildController();

    await expect(controller.getById(MALFORMED_ID)).rejects.toBeInstanceOf(BadRequestException);
  });

  it("GET /candidatures/:id returns 404 when the application does not exist", async () => {
    const { controller, getUseCase } = await buildController();
    getUseCase.execute.mockResolvedValue(null);

    await expect(controller.getById(VALID_ID)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("PATCH /candidatures/:id/status rejects a malformed id with 400", async () => {
    const { controller } = await buildController();

    await expect(controller.changeStatus(MALFORMED_ID, { status: "application_sent" })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("PATCH /candidatures/:id/status returns 404 when the application does not exist", async () => {
    const { controller, changeStatusUseCase } = await buildController();
    changeStatusUseCase.execute.mockRejectedValue(new Error(`No job application found for id: ${VALID_ID}`));

    await expect(controller.changeStatus(VALID_ID, { status: "application_sent" })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("PATCH /candidatures/:id/status returns 400 on an invalid transition", async () => {
    const { controller, changeStatusUseCase } = await buildController();
    changeStatusUseCase.execute.mockRejectedValue(new Error("Invalid transition: to_contact → offer_received"));

    await expect(controller.changeStatus(VALID_ID, { status: "offer_received" })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("PATCH /candidatures/:id/follow-up returns 404 when the application does not exist", async () => {
    const { controller, planFollowUpUseCase } = await buildController();
    planFollowUpUseCase.execute.mockRejectedValue(new Error(`No job application found for id: ${VALID_ID}`));

    await expect(controller.planFollowUp(VALID_ID, { date: "2026-07-24" })).rejects.toBeInstanceOf(NotFoundException);
  });

  it("DELETE /candidatures/:id rejects a malformed id with 400", async () => {
    const { controller } = await buildController();

    await expect(controller.delete(MALFORMED_ID)).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe("CandidaturesController (valid cases)", () => {
  it("POST /candidatures creates and returns the mapped candidature", async () => {
    const { controller, createUseCase } = await buildController();
    createUseCase.execute.mockResolvedValue(buildApplication());

    const result = await controller.create({ company: "Nova Tech", position: "Dev. Full-Stack" });

    expect(createUseCase.execute).toHaveBeenCalledWith({
      company: "Nova Tech",
      position: "Dev. Full-Stack",
      offerUrl: null,
      notes: "",
    });
    expect(result.id).toBe(VALID_ID);
    expect(result.company).toBe("Nova Tech");
  });

  it("GET /candidatures lists the mapped candidatures", async () => {
    const { controller, listUseCase } = await buildController();
    listUseCase.execute.mockResolvedValue([buildApplication()]);

    const result = await controller.list();

    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(VALID_ID);
  });

  it("GET /candidatures/:id returns the mapped candidature", async () => {
    const { controller, getUseCase } = await buildController();
    getUseCase.execute.mockResolvedValue(buildApplication());

    const result = await controller.getById(VALID_ID);

    expect(result.id).toBe(VALID_ID);
  });

  it("PATCH /candidatures/:id/status returns the updated candidature", async () => {
    const { controller, changeStatusUseCase } = await buildController();
    changeStatusUseCase.execute.mockResolvedValue(buildApplication());

    const result = await controller.changeStatus(VALID_ID, { status: "application_sent" });

    expect(changeStatusUseCase.execute).toHaveBeenCalledWith(expect.any(JobApplicationId), "application_sent");
    expect(result.id).toBe(VALID_ID);
  });

  it("PATCH /candidatures/:id/follow-up returns the updated candidature", async () => {
    const { controller, planFollowUpUseCase } = await buildController();
    planFollowUpUseCase.execute.mockResolvedValue(buildApplication());

    const result = await controller.planFollowUp(VALID_ID, { date: "2026-07-24" });

    expect(planFollowUpUseCase.execute).toHaveBeenCalledWith(expect.any(JobApplicationId), new Date("2026-07-24"));
    expect(result.id).toBe(VALID_ID);
  });

  it("DELETE /candidatures/:id calls the use case and returns nothing", async () => {
    const { controller, deleteUseCase } = await buildController();
    deleteUseCase.execute.mockResolvedValue(undefined);

    await controller.delete(VALID_ID);

    expect(deleteUseCase.execute).toHaveBeenCalledWith(expect.any(JobApplicationId));
  });
});
