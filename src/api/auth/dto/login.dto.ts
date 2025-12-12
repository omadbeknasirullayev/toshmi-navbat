import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
	@ApiProperty({
		example: "admin123",
	})
	@IsNotEmpty()
	@IsString()
	public username!: string;

	@ApiProperty({
		example: "12345",
	})
	@IsNotEmpty()
	@IsString()
	public password!: string;
}
