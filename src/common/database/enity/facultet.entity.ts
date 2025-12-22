import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Building } from "./building.entity";
import { Student } from "./student.entity";
import { CatchupScheduleFacultet } from "./catchup-schedule-facultet.entity";

@Entity('facultets')
export class Facultet extends BaseEntity {
  @Column({ type: "varchar", name: "name" })
  public name!: string;

  @Column({ type: "int", name: "journalFacultyId", nullable: true })
  public journalFacultyId?: number;

  @Column({ type: "int", name: "buildingId", nullable: true })
  public buildingId?: number;

  @ManyToOne(() => Building, (building) => building.facultets)
  public building!: Building;

  @OneToMany(() => Student, (student) => student.facultet)
  public students!: Student[];

  @OneToMany(() => CatchupScheduleFacultet, (csf) => csf.facultet)
  public catchupSchedules!: CatchupScheduleFacultet[];
}
