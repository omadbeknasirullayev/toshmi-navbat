import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber, Min } from "class-validator";

export class MarkArrivedDto {
	@ApiProperty({ description: "Student HEMIS ID" })
	@IsNotEmpty()
	@IsString()
	public hemisId!: string;

	@ApiProperty({ description: "Catchup Schedule ID" })
	@IsNotEmpty()
	@IsNumber()
	@Min(1)
	public catchupScheduleId!: number;
}
