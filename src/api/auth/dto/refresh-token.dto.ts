import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenDto {
	@ApiProperty({
		description: 'User new token',
		example: "",
		type: 'string'
	})
	@IsString()
	@IsNotEmpty()
	public token!: string
}