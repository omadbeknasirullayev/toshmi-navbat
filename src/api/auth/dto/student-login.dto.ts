import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class StudentLoginDto {
	@ApiProperty({
		example: "364211100841",
	})
	@IsNotEmpty()
	@IsString()
	public hemisId!: string;

	@ApiProperty({
		example: "aziz7777",
	})
	@IsNotEmpty()
	@IsString()
	public password!: string;
}
