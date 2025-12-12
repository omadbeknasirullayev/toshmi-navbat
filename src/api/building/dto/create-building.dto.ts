import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Min } from "class-validator";

export class CreateBuildingDto {
	@ApiProperty()
	@IsNotEmpty()
	public name!: string;

	@ApiProperty()
	@IsNotEmpty()
	@Min(0)
	public computerCount!: number;
}
