import { ApiProperty } from "@nestjs/swagger";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@job-tracker/core/domain/job-application";
import { IsIn } from "class-validator";

export class ChangeStatusDto {
  @ApiProperty({ enum: APPLICATION_STATUSES, example: "application_sent" })
  @IsIn(APPLICATION_STATUSES)
  status!: ApplicationStatus;
}
