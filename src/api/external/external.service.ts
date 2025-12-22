import { Injectable } from "@nestjs/common";
import { LoginTMADto } from "./dto/login-TMA.dto";
import axios from "axios";

@Injectable()
export class ExternalService {
	constructor() {}

	public async loginTMA(dto: LoginTMADto) {
		console.log(dto);

		try {
			const response = await axios({
				method: "post",
				url: "https://mobile.tma.uz/api/v1/account/auth/login/",
				data: dto,
				headers: {
					"Content-Type": "application/json",
				},
			});
			return response.data;
		} catch (error) {
			console.log(error);
		}
		return null;
	}

	public async get2MBStudent(hemisId: string) {
		try {
			const response = await axios({
				method: "get",
				url: `https://e-journal.tashmeduni.uz/api/v1/journal/student/${hemisId}/low-performance`,
				headers: {
					"Content-Type": "application/json",
					"X-API-TOKEN": "LP_API_9f3c7e1aB42D8KxQmR5YpZV0WnL6H",
				},
			});
			return response.data;
		} catch (error) {
			console.log(JSON.parse(JSON.stringify(error)));
		}
		return null;
	}

	public async getFacultets() {
		try {
			const response = await axios({
				method: "get",
				url: `https://e-journal.tashmeduni.uz/api/v1/base/department/list/for-navbat/`,
				headers: {
					"Content-Type": "application/json",
					"X-API-TOKEN": "LP_API_9f3c7e1aB42D8KxQmR5YpZV0WnL6H",
				},
			});
			return response.data;
		} catch (error) {
			// console.log(error)
			console.log(JSON.parse(JSON.stringify(error)));
		}
		return null;
	}
}
