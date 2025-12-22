import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsEnum, Min } from "class-validator";
import { CatchupScheduleStudentStatus } from "src/common/database/Enums";

export class GetCatchupStudentsDto {
	@ApiProperty({ description: "Catchup Schedule ID" })
	@IsNotEmpty()
	@Min(1)
	public catchupScheduleId!: number;

	@ApiPropertyOptional({
		description: "Tanlangan vaqt slot (masalan: 14:00-14:30)",
		example: "14:00-14:30",
	})
	@IsOptional()
	@IsString()
	public selectedTimeSlot!: string;

	@ApiPropertyOptional({
		description: "Student HEMIS ID (filter uchun)",
		required: false,
	})
	@IsOptional()
	@IsString()
	public hemisId?: string;

	@ApiPropertyOptional({
		description: "Student status (filter uchun)",
		enum: CatchupScheduleStudentStatus,
		required: false,
	})
	@IsOptional()
	@IsEnum(CatchupScheduleStudentStatus)
	public status?: CatchupScheduleStudentStatus;
}
