import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, Min } from "class-validator";

export class CreateStudentDto {
	@ApiProperty()
	@IsNotEmpty()
	public hemisId!: string;

	@ApiProperty()
	@IsNotEmpty()
	public password!: string;

	@ApiProperty()
	@IsNotEmpty()
	public fullname!: string;
  
	@ApiProperty()
	@IsOptional()
	public phoneNumber?: string;
  
	@ApiProperty()
	@IsNotEmpty()
	@Min(1)
	public course!: number;
  
	@ApiProperty()
	@IsNotEmpty()
	public facultetId!: number;
}
