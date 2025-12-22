import { Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { CatchupSchedule } from "./catchup-schedule.entity";
import { Facultet } from "./facultet.entity";

@Entity("catchup_schedule_facultets")
export class CatchupScheduleFacultet {
	@PrimaryColumn({ type: "int", name: "catchupScheduleId" })
	public catchupScheduleId!: number;

	@PrimaryColumn({ type: "int", name: "facultetId" })
	public facultetId!: number;

	@ManyToOne(() => CatchupSchedule, (schedule) => schedule.facultets, { onDelete: "CASCADE" })
	public catchupSchedule!: CatchupSchedule;

	@ManyToOne(() => Facultet, (facultet) => facultet.catchupSchedules, { onDelete: "CASCADE" })
	public facultet!: Facultet;
}
