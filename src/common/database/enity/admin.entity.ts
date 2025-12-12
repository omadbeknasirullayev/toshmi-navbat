import { Column, Entity } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { RolesEnum } from "../Enums";

@Entity('admins')
export class Admin extends BaseEntity {
	@Column({
		name: "fullName",
		type: "varchar",
	})
	public fullName!: string;

	@Column({
		name: "phoneNumber",
		type: "varchar",
		nullable: true,
	})
	public phoneNumber!: string;

	@Column({
		name: "username",
		type: "varchar",
	})
	public username!: string;

	@Column({
		name: "password",
		type: "varchar",
	})
	public password!: string;

	@Column({
		name: "role",
		enum: RolesEnum,
	})
	public role!: RolesEnum;
}
