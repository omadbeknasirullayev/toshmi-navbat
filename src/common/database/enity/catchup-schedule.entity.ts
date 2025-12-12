import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Building } from "./building.entity";
import { CatchupScheduleStudent } from "./catchup-schedule-student.entity";

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

	@Column({ type: "int", name: "registrationCount", default: 0 })
	public registrationCount!: number;

	@Column({ type: "int", name: "attendeesCount", default: 0 })
	public attendeesCount!: number;

	@ManyToOne(() => Building, (building) => building.catchupSchedules)
	public building?: Building;
  
	@OneToMany(() => CatchupScheduleStudent, (css) => css.catchupSchedule)
	public students?: CatchupScheduleStudent[];
}
