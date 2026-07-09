import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCandidatureDto {
  @ApiProperty({ example: "Solstice Labs" })
  @IsString()
  @IsNotEmpty()
  company!: string;

  @ApiProperty({ example: "Ingénieur Backend" })
  @IsString()
  @IsNotEmpty()
  position!: string;

  @ApiPropertyOptional({ example: "https://example.com/offer" })
  @IsOptional()
  @IsString()
  offerUrl?: string;

  @ApiPropertyOptional({ example: "Contact via Camille" })
  @IsOptional()
  @IsString()
  notes?: string;
}
