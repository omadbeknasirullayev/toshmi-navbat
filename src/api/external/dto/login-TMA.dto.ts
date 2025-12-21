import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginTMADto {
	@ApiProperty({ example: "364211100841" })
	@IsNotEmpty()
	@IsString()
	public username!: string;

	@ApiProperty({ example: "aziz7777" })
	@IsNotEmpty()
	@IsString()
	public password!: string;
}
