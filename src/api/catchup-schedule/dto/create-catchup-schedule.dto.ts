import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Min, Matches, IsOptional, IsArray, ArrayMinSize, IsDateString } from "class-validator";

export class CreateCatchupScheduleDto {
  @ApiProperty()
  @IsNotEmpty()
  public name!: string;

  @ApiProperty()
  @IsNotEmpty()
  public date!: Date;

  @ApiProperty({
    type: [Number],
    description: "Kurs raqamlari (masalan: [1, 2, 3])",
    example: [1, 2]
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  public courses!: number[];

  @ApiProperty()
  @IsNotEmpty()
  @Min(1)
  public buildingId!: number;

  @ApiProperty({
    required: false,
    type: [Number],
    description: "Fakultet ID lari. Agar berilmasa, binoning barcha fakultetlari uchun yaratiladi"
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  public facultetIds?: number[];

  @ApiProperty({ example: "14:00", description: "Boshlanish vaqti (HH:mm formatda)" })
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "startTime must be in HH:mm format (e.g., 14:00)"
  })
  public startTime!: string;

  @ApiProperty({ example: "16:00", description: "Tugash vaqti (HH:mm formatda)" })
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "endTime must be in HH:mm format (e.g., 16:00)"
  })
  public endTime!: string;

  @ApiProperty({
    example: "2025-12-25T10:00:00Z",
    description: "Navbat olish boshlanish vaqti (ISO 8601 formatda)",
    required: false
  })
  @IsOptional()
  @IsDateString()
  public registrationStartTime?: Date;

  @ApiProperty({
    example: "2025-12-27T20:00:00Z",
    description: "Navbat olish tugash vaqti (ISO 8601 formatda)",
    required: false
  })
  @IsOptional()
  @IsDateString()
  public registrationEndTime?: Date;
}
