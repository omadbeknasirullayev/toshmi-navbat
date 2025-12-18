import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { CatchupSchedule } from "./catchup-schedule.entity";
import { Student } from "./student.entity";

@Entity("catchup_schedule_students")
export class CatchupScheduleStudent extends BaseEntity {
  @Column({ type: "int", name: "catchupScheduleId" })
  public catchupScheduleId!: number;
  
	@Column({ type: "int", name: "studentId" })
	public studentId!: number;

	@Column({ type: "varchar", name: "status", default: "pending" })
	public status!: string;

	@Column({ type: "varchar", name: "selectedTimeSlot", nullable: true })
	public selectedTimeSlot!: string;

	@Column({ type: "int", name: "queueNumber", nullable: true })
	public queueNumber!: number;

	@Column({ type: "text", name: "qrCode", nullable: true })
	public qrCode!: string;

	@ManyToOne(() => CatchupSchedule, (catchupSchedule) => catchupSchedule.students)
	public catchupSchedule!: CatchupSchedule;

	@ManyToOne(() => Student, (student) => student.catchupSchedules)
	public student!: Student;
}