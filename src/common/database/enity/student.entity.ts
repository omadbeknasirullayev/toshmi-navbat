import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Facultet } from "./facultet.entity";
import { CatchupScheduleStudent } from "./catchup-schedule-student.entity";
import { StudentLowPerformance } from "./student-low-performance.entity";

@Entity("students")
export class Student extends BaseEntity {
	@Column({ type: "varchar", name: "hemisId", unique: true })
	public hemisId!: string;

	@Column({ type: "varchar", name: "password" })
	public password!: string;

	@Column({ type: "varchar", name: "fullname" })
	public fullname!: string;

	@Column({ type: "varchar", name: "shortName", nullable: true })
	public shortName?: string;

	@Column({ type: "varchar", name: "phoneNumber", nullable: true })
	public phoneNumber?: string;

	@Column({ type: "varchar", name: "email", nullable: true })
	public email?: string;

	@Column({ type: "varchar", name: "image", nullable: true })
	public image?: string;

	@Column({ type: "date", name: "birthDate", nullable: true })
	public birthDate?: Date;

	@Column({ type: "varchar", name: "address", nullable: true })
	public address?: string;

	@Column({ type: "decimal", precision: 3, scale: 2, name: "avgGpa", nullable: true })
	public avgGpa?: number;

	@Column({ type: "int", name: "course" })
	public course!: number;

	@Column({ type: "int", name: "facultetId" })
	public facultetId!: number;

	@Column({ type: "bigint", name: "specialty", nullable: true })
	public specialty?: number;

	@Column({ type: "int", name: "groupId", nullable: true })
	public groupId?: number;

	@Column({ type: "int", name: "department", nullable: true })
	public department?: number;

	@Column({ type: "int", name: "level", nullable: true })
	public level?: number;

	// @Column({ type: "int", name: "semester", nullable: true })
	// public semester?: number;

	// @Column({ type: "int", name: "educationForm", nullable: true })
	// public educationForm?: number;

	// @Column({ type: "int", name: "educationType", nullable: true })
	// public educationType?: number;

	// @Column({ type: "int", name: "paymentForm", nullable: true })
	// public paymentForm?: number;

	// @Column({ type: "int", name: "educationLang", nullable: true })
	// public educationLang?: number;

	// @Column({ type: "int", name: "yearOfEnter", nullable: true })
	// public yearOfEnter?: number;

	// @Column({ type: "int", name: "educationYear", nullable: true })
	// public educationYear?: number;

	// @Column({ type: "int", name: "gender", nullable: true })
	// public gender?: number;

	@Column({ type: "int", name: "studentStatus", nullable: true })
	public studentStatus?: number;

	// @Column({ type: "int", name: "citizenship", nullable: true })
	// public citizenship?: number;

	// @Column({ type: "int", name: "currentProvince", nullable: true })
	// public currentProvince?: number;

	// @Column({ type: "int", name: "currentDistrict", nullable: true })
	// public currentDistrict?: number;

	@Column({ type: "int", name: "tmaUserId", nullable: true })
	public tmaUserId?: number;

	@ManyToOne(() => Facultet, (facultet) => facultet.students)
	public facultet!: Facultet;

	@OneToMany(() => CatchupScheduleStudent, (css) => css.student)
	public catchupSchedules?: CatchupScheduleStudent[];

	@OneToMany(() => StudentLowPerformance, (slp) => slp.student)
	public lowPerformances?: StudentLowPerformance[];
}
