import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";
import { RolesEnum } from "../database/Enums";

export class ObjDto {
	@IsNotEmpty()
	@IsUUID()
	id!: string;
}

export interface IResponse<T> {
	status_code: number;
	data: T;
	message: string;
}

export interface AuthPayload {
	id: number;
	role: RolesEnum;
	phoneNumber: string;
}

export class response_data<T> {
	status_code!: number;
	message!: string;
	data!: T;
}
