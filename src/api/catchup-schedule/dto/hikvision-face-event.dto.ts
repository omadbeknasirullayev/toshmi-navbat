import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

class AccessControllerEventDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	public employeeNoString?: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	public cardNo?: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	public name?: string;

	@ApiProperty()
	@IsOptional()
	public deviceName?: string;

	@ApiProperty()
	@IsOptional()
	public majorEventType?: number;

	@ApiProperty()
	@IsOptional()
	public subEventType?: number;
}

export class HikvisionFaceEventDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	public eventType!: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	public dateTime!: string;

	@ApiProperty({ type: AccessControllerEventDto })
	@IsNotEmpty()
	@IsObject()
	public AccessControllerEvent!: AccessControllerEventDto;
}
