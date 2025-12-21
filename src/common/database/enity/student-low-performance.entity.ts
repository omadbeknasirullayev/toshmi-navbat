import { Column, Entity, ManyToOne, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Student } from "./student.entity";

@Entity("student_low_performances")
export class StudentLowPerformance extends BaseEntity {
	@Column({ type: "int", name: "studentId", nullable: true })
	public studentId?: number;

	@Column({ type: "varchar", name: "subject", nullable: true })
	public subject?: string;

	@Column({ type: "int", name: "journalId", nullable: true })
	public journalId?: number;

	@Column({ type: "int", name: "journalSubjectId", nullable: true })
	public journalSubjectId!: number;

	@Column({ type: "varchar", name: "journalSubjectName", nullable: false })
	public journalSubjectName!: string;

	@Column({ type: "varchar", name: "journalType", nullable: true })
	public journalType!: string;

	@Column({ type: "varchar", name: "semester", nullable: true })
	public semester!: string;

	@Column({ type: "varchar", name: "educationYear", nullable: true })
	public educationYear!: string;

	@Column({ type: "varchar", name: "gradeType", nullable: true })
	public gradeType?: string;

	@Column({ type: "varchar", name: "mark", nullable: true })
	public mark?: string;

	@Column({ type: "varchar", name: "markAttendance", nullable: true })
	public markAttendance?: string;

	@Column({ type: "boolean", name: "isAbsent", nullable: true })
	public isAbsent!: boolean;

	@Column({ type: "varchar", name: "topicName", nullable: true })
	public topicName!: string;

	@Column({ type: "varchar", name: "topicId", nullable: true })
	public topicId?: string;

	@Column({ type: "timestamp", name: "date", nullable: true })
	public date?: Date;

	@Column({ type: "timestamp", name: "recordCreatedAt", nullable: true })
	public recordCreatedAt!: Date;

	@ManyToOne(() => Student, (student) => student.lowPerformances)
	@JoinColumn({ name: "studentId" })
	public student!: Student;
}
