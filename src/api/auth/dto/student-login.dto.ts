import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class StudentLoginDto {
	@ApiProperty({
		example: "123456789",
	})
	@IsNotEmpty()
	@IsString()
	public hemisId!: string;

	@ApiProperty({
		example: "12345",
	})
	@IsNotEmpty()
	@IsString()
	public password!: string;
}