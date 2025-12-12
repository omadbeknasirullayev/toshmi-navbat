import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class CreateFacultetDto {
	@ApiProperty({ example: "Math" })
	@IsNotEmpty()
	@IsString()
	public name!: string;

	@ApiProperty({ example: 1 })
	@IsNotEmpty()
	@IsNumber()
	public buildingId!: number;
}
