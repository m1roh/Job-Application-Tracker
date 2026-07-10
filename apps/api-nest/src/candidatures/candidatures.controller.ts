import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ChangeApplicationStatusUseCase } from "@job-tracker/core/application/use-cases/change-application-status";
import { CreateJobApplicationUseCase } from "@job-tracker/core/application/use-cases/create-job-application";
import { DeleteJobApplicationUseCase } from "@job-tracker/core/application/use-cases/delete-job-application";
import { GetJobApplicationUseCase } from "@job-tracker/core/application/use-cases/get-job-application";
import { ListJobApplicationsUseCase } from "@job-tracker/core/application/use-cases/list-job-applications";
import { PlanFollowUpUseCase } from "@job-tracker/core/application/use-cases/plan-follow-up";
import { JobApplicationId } from "@job-tracker/core/domain/value-objects/job-application-id";
import { ChangeStatusDto } from "./dto/change-status.dto";
import { CreateCandidatureDto } from "./dto/create-candidature.dto";
import { PlanFollowUpDto } from "./dto/plan-follow-up.dto";
import { toCandidatureResponse, type CandidatureResponse } from "./to-candidature-response";

const NOT_FOUND_MESSAGE_PREFIX = "No job application found";

function toHttpException(error: unknown): BadRequestException | NotFoundException {
  const message = error instanceof Error ? error.message : "Unexpected error";

  return message.startsWith(NOT_FOUND_MESSAGE_PREFIX)
    ? new NotFoundException(message)
    : new BadRequestException(message);
}

function parseId(id: string): JobApplicationId {
  try {
    return JobApplicationId.from(id);
  } catch (error) {
    throw toHttpException(error);
  }
}

@ApiTags("candidatures")
@Controller("candidatures")
export class CandidaturesController {
  constructor(
    @Inject(CreateJobApplicationUseCase) private readonly createUseCase: CreateJobApplicationUseCase,
    @Inject(GetJobApplicationUseCase) private readonly getUseCase: GetJobApplicationUseCase,
    @Inject(ListJobApplicationsUseCase) private readonly listUseCase: ListJobApplicationsUseCase,
    @Inject(ChangeApplicationStatusUseCase) private readonly changeStatusUseCase: ChangeApplicationStatusUseCase,
    @Inject(PlanFollowUpUseCase) private readonly planFollowUpUseCase: PlanFollowUpUseCase,
    @Inject(DeleteJobApplicationUseCase) private readonly deleteUseCase: DeleteJobApplicationUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Crée une candidature" })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() dto: CreateCandidatureDto): Promise<CandidatureResponse> {
    const { company, position, offerUrl, notes } = dto;
    const application = await this.createUseCase.execute({
      company,
      position,
      offerUrl: offerUrl ?? null,
      notes: notes ?? "",
    });

    return toCandidatureResponse(application);
  }

  @Get()
  @ApiOperation({ summary: "Liste les candidatures" })
  async list(): Promise<CandidatureResponse[]> {
    const applications = await this.listUseCase.execute();

    return applications.map(toCandidatureResponse);
  }

  @Get(":id")
  @ApiOperation({ summary: "Récupère une candidature par id" })
  @ApiParam({ name: "id" })
  async getById(@Param("id") id: string): Promise<CandidatureResponse> {
    const jobApplicationId = parseId(id);
    const application = await this.getUseCase.execute(jobApplicationId);

    if (!application) {
      throw new NotFoundException(`${NOT_FOUND_MESSAGE_PREFIX} for id: ${id}`);
    }

    return toCandidatureResponse(application);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Change le statut d'une candidature" })
  @ApiParam({ name: "id" })
  async changeStatus(@Param("id") id: string, @Body() dto: ChangeStatusDto): Promise<CandidatureResponse> {
    const jobApplicationId = parseId(id);

    try {
      const application = await this.changeStatusUseCase.execute(jobApplicationId, dto.status);

      return toCandidatureResponse(application);
    } catch (error) {
      throw toHttpException(error);
    }
  }

  @Patch(":id/follow-up")
  @ApiOperation({ summary: "Planifie une relance" })
  @ApiParam({ name: "id" })
  async planFollowUp(@Param("id") id: string, @Body() dto: PlanFollowUpDto): Promise<CandidatureResponse> {
    const jobApplicationId = parseId(id);

    try {
      const application = await this.planFollowUpUseCase.execute(jobApplicationId, new Date(dto.date));

      return toCandidatureResponse(application);
    } catch (error) {
      throw toHttpException(error);
    }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Supprime une candidature" })
  @ApiParam({ name: "id" })
  async delete(@Param("id") id: string): Promise<void> {
    const jobApplicationId = parseId(id);

    await this.deleteUseCase.execute(jobApplicationId);
  }
}
