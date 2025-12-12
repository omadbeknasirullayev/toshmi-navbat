import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, Max, Min } from "class-validator";

export class PaginationDto {
	@ApiPropertyOptional({
		default: 1,
	})
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Type(() => Number)
	public page: number = 1;

	@ApiPropertyOptional({
		default: 10,
	})
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(100)
	@Type(() => Number)
	public page_size: number = 10;
}
