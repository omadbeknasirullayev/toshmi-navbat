import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Building } from "./building.entity";
import { Student } from "./student.entity";
import { CatchupSchedule } from "./catchup-schedule.entity";

@Entity('facultets')
export class Facultet extends BaseEntity {
  @Column({ type: "varchar", name: "name" })
  public name!: string;

  @Column({ type: "int", name: "hemisFacultyId", nullable: true })
  public hemisFacultyId?: number;

  @Column({ type: "int", name: "buildingId", nullable: true })
  public buildingId?: number;

  @ManyToOne(() => Building, (building) => building.facultets)
  public building!: Building;

  @OneToMany(() => Student, (student) => student.facultet)
  public students!: Student[];

  @OneToMany(() => CatchupSchedule, (schedule) => schedule.facultet)
  public catchupSchedules!: CatchupSchedule[];
}
