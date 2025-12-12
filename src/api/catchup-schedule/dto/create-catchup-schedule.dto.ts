import { ApiProperty } from "@nestjs/swagger";
import { Column } from "typeorm";
import { IsNotEmpty, Min } from "class-validator";

export class CreateCatchupScheduleDto {
  @ApiProperty()
  @IsNotEmpty()
  public name!: string;

  @ApiProperty()
  @IsNotEmpty()
  public date!: Date;

  @ApiProperty()
  @IsNotEmpty()
  @Min(1)
  public course!: number;

  @ApiProperty()
  @IsNotEmpty()
  @Min(1)
  public buildingId!: number;
}
