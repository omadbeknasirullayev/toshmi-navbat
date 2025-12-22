import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Building } from "./building.entity";
import { CatchupScheduleStudent } from "./catchup-schedule-student.entity";
import { Facultet } from "./facultet.entity";

@Entity("catchup_schedules")
export class CatchupSchedule extends BaseEntity {
	@Column({ type: "varchar", name: "name" })
	public name!: string;

	@Column({ type: "date", name: "date" })
	public date!: Date;

	@Column({ type: "int", name: "course" })
	public course!: number;

	@Column({ type: "int", name: "buildingId" })
	public buildingId!: number;

	@Column({ type: "int", name: "facultyId", nullable: true })
	public facultyId?: number;

	@Column({ type: "int", name: "registrationCount", default: 0 })
	public registrationCount!: number;

	@Column({ type: "int", name: "attendeesCount", default: 0 })
	public attendeesCount!: number;

	@Column({ type: "time", name: "startTime", nullable: true })
	public startTime!: string;

	@Column({ type: "time", name: "endTime", nullable: true })
	public endTime!: string;

	@Column({ type: "json", name: "timeSlots", default: [] })
	public timeSlots!: string[];

	@ManyToOne(() => Building, (building) => building.catchupSchedules)
	public building?: Building;

	@ManyToOne(() => Facultet, (facultet) => facultet.catchupSchedules)
	public facultet?: Facultet;

	@OneToMany(() => CatchupScheduleStudent, (css) => css.catchupSchedule)
	public students?: CatchupScheduleStudent[];
}
