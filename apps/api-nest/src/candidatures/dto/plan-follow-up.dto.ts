import { ApiProperty } from "@nestjs/swagger";
import { IsDateString } from "class-validator";

export class PlanFollowUpDto {
  @ApiProperty({ example: "2026-07-24" })
  @IsDateString()
  date!: string;
}
