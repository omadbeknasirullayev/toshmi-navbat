import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class BaseEntity {
	@PrimaryGeneratedColumn("increment")
	id!: number;

	@Column({
		name: "isActive",
		type: "boolean",
		default: true,
	})
	isActive!: boolean;

	@Column({
		name: "isDeleted",
		type: "boolean",
		default: false,
	})
	isDeleted!: boolean;

	@Column({
		name: "createdAt",
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP",
	})
	createdAt!: Date;

	@Column({
		name: "updatedAt",
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP",
	})
	updatedAt!: Date;

	@Column({ name: "deletedAt", type: "timestamp", nullable: true })
	deletedAt!: Date;
}
