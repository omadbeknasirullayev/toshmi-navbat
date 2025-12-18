import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class WriteQueueDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	public catchupScheduleId!: number;

	@ApiProperty({ example: "14:00-14:30", description: "Tanlangan vaqt oralig'i" })
	@IsNotEmpty()
	@IsString()
	public selectedTimeSlot!: string;
}
