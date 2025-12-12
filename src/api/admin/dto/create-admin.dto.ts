import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator"
import { RolesEnum } from "src/common/database/Enums"

export class CreateAdminDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	public fullName!: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	public phoneNumber?: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	public username!: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	public password!: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsEnum(RolesEnum)
	public role?: RolesEnum;
}
