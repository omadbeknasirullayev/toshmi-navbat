import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Facultet } from "./facultet.entity";
import { CatchupSchedule } from "./catchup-schedule.entity";

@Entity("buildings")
export class Building extends BaseEntity {
	@Column({
		name: "name",
		type: "varchar",
	})
	public name!: string;

	@Column({
		name: "computerCount",
		type: "smallint",
	})
	public computerCount!: number;

	@OneToMany(() => Facultet, (facultet) => facultet.building)
	public facultets!: Facultet[];

	@OneToMany(() => CatchupSchedule, (schedule) => schedule.building)
	public catchupSchedules!: CatchupSchedule[];
}
