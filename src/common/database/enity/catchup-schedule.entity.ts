import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Building } from "./building.entity";
import { CatchupScheduleStudent } from "./catchup-schedule-student.entity";
import { CatchupScheduleFacultet } from "./catchup-schedule-facultet.entity";

@Entity("catchup_schedules")
export class CatchupSchedule extends BaseEntity {
	@Column({ type: "varchar", name: "name" })
	public name!: string;

	@Column({ type: "date", name: "date" })
	public date!: Date;

	@Column({ type: "json", name: "courses", default: [] })
	public courses!: number[];

	@Column({ type: "int", name: "buildingId" })
	public buildingId!: number;

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

	@Column({ type: "timestamp", name: "registrationStartTime", nullable: true })
	public registrationStartTime!: Date;

	@Column({ type: "timestamp", name: "registrationEndTime", nullable: true })
	public registrationEndTime!: Date;

	@ManyToOne(() => Building, (building) => building.catchupSchedules)
	public building?: Building;

	@OneToMany(() => CatchupScheduleFacultet, (csf) => csf.catchupSchedule)
	public facultets?: CatchupScheduleFacultet[];

	@OneToMany(() => CatchupScheduleStudent, (css) => css.catchupSchedule)
	public students?: CatchupScheduleStudent[];
}
