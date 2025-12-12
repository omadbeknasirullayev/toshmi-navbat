import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "./pagination.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class FilterDto extends PaginationDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@Type(() => String)
	search!: string;
}
