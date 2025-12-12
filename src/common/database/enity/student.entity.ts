import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Facultet } from "./facultet.entity";
import { CatchupScheduleStudent } from "./catchup-schedule-student.entity";

@Entity("students")
export class Student extends BaseEntity {
	@Column({ type: "varchar", name: "hemisId" })
	public hemisId!: string;

	@Column({ type: "varchar", name: "password" })
	public password!: string;

	@Column({ type: "varchar", name: "fullname" })
	public fullname!: string;

	@Column({ type: "varchar", name: "phoneNumber" })
	public phoneNumber!: string;

	@Column({ type: "int", name: "course" })
	public course!: number;

	@Column({ type: "int", name: "facultetId" })
	public facultetId!: number;

	@ManyToOne(() => Facultet, (facultet) => facultet.students)
	public facultet!: Facultet;

	@OneToMany(() => CatchupScheduleStudent, (css) => css.student)
	public catchupSchedules?: CatchupScheduleStudent[];
}
