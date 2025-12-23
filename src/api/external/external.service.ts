import { Injectable } from "@nestjs/common";
import { LoginTMADto } from "./dto/login-TMA.dto";
import axios from "axios";
import { appConfig } from "src/config/app.config";
import { AxiosRequestDto } from "./dto/axios-request.dto";

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
					"X-API-TOKEN": appConfig.JOURNAL_SECRET,
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
				url: `https://e-journal.tashmeduni.uz/api/v1/base/department/list/for-navbat/?page=1&page_size=200`,
				headers: {
					"Content-Type": "application/json",
					"X-API-TOKEN": appConfig.JOURNAL_SECRET,
				},
			});
			return response.data;
		} catch (error) {
			// console.log(error)
			console.log(JSON.parse(JSON.stringify(error)));
		}
		return null;
	}

	public async axiosRequest(dto: AxiosRequestDto) {
		try {
			const request = await axios({
				method: dto.method,
				url: dto.url,
				data: dto.data,
				headers: dto.headers,
			});
			return request.data;
		} catch (error) {
			console.log(JSON.parse(JSON.stringify(error)));
			return null;
		}
	}
}
