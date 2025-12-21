import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsInt, IsBoolean, IsOptional, IsDateString } from "class-validator";

export class CreateTwoMbDto {
	@ApiProperty({ description: "Student ID" })
	@IsNotEmpty()
	@IsInt()
	public studentId!: number;

	@ApiProperty({ description: "Subject name" })
	@IsNotEmpty()
	@IsString()
	public subject!: string;

	@ApiProperty({ description: "Journal ID" })
	@IsNotEmpty()
	@IsInt()
	public journalId!: number;

	@ApiProperty({ description: "Journal Subject ID" })
	@IsNotEmpty()
	@IsInt()
	public journalSubjectId!: number;

	@ApiProperty({ description: "Journal Subject Name" })
	@IsNotEmpty()
	@IsString()
	public journalSubjectName!: string;

	@ApiProperty({ description: "Journal Type" })
	@IsNotEmpty()
	@IsString()
	public journalType!: string;

	@ApiProperty({ description: "Semester" })
	@IsNotEmpty()
	@IsString()
	public semester!: string;

	@ApiProperty({ description: "Education Year" })
	@IsNotEmpty()
	@IsString()
	public educationYear!: string;

	@ApiProperty({ description: "Grade Type" })
	@IsNotEmpty()
	@IsString()
	public gradeType!: string;

	@ApiProperty({ description: "Mark", required: false })
	@IsOptional()
	@IsString()
	public mark?: string;

	@ApiProperty({ description: "Mark Attendance" })
	@IsNotEmpty()
	@IsString()
	public markAttendance!: string;

	@ApiProperty({ description: "Is Absent" })
	@IsNotEmpty()
	@IsBoolean()
	public isAbsent!: boolean;

	@ApiProperty({ description: "Topic Name" })
	@IsNotEmpty()
	@IsString()
	public topicName!: string;

	@ApiProperty({ description: "Topic ID", required: false })
	@IsOptional()
	@IsInt()
	public topicId?: number;

	@ApiProperty({ description: "Date of the record" })
	@IsNotEmpty()
	@IsDateString()
	public date!: Date;

	@ApiProperty({ description: "Record created at" })
	@IsNotEmpty()
	@IsDateString()
	public recordCreatedAt!: Date;
}
