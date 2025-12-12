import { Injectable, Logger } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import { Employee } from "src/common/database/enity";

@Injectable()
export class HikvisionService {
	private readonly logger = new Logger(HikvisionService.name);
	private readonly client: AxiosInstance;
	private readonly baseUrls: string[];
	private readonly username: string;
	private readonly password: string;

	constructor() {
		this.baseUrls = process.env.HIKVISION_BASE_URLS?.split(",") || ["http://192.168.14.14"];
		this.username = process.env.HIKVISION_USERNAME || "admin";
		this.password = process.env.HIKVISION_PASSWORD || "kengash153";

		this.client = axios.create({
			auth: {
				username: this.username,
				password: this.password,
			},
			headers: {
				"Content-Type": "application/json",
			},
			timeout: 10000,
		});
	}

	async addUserToHikvision(employee: Employee): Promise<void> {
		try {
			// Step 1: Create user
			const userBody = {
				UserInfo: {
					employeeNo: String(employee.id),
					name: employee.fullname,
					userType: "normal",
					Valid: {
						enable: true,
						beginTime: "2025-01-01T00:00:00",
						endTime: "2035-12-31T23:59:59",
					},
				},
			};

			for (const baseUrl of this.baseUrls) {
				try {
					const response = await this.client.post(
						`${baseUrl}/ISAPI/AccessControl/UserInfo/Record?format=json`,
						userBody,
					);

					if (response.status === 200 || response.status === 201) {
						this.logger.log(`User created successfully on ${baseUrl} for employee: ${employee.fullname}`);
					} else {
						this.logger.warn(
							`User creation failed on ${baseUrl}: ${response.status} | ${JSON.stringify(response.data)}`,
						);
					}
				} catch (error: any) {
					this.logger.error(`User creation error on ${baseUrl}: ${error.message}`);
				}
			}

			// Step 2: Upload face image if available
			if (employee.image) {
				// await this.uploadFaceImage(employee);
			}
		} catch (error: any) {
			this.logger.error(`General Hikvision error for ${employee.fullname}: ${error.message}`);
		}
	}

	private async uploadFaceImage(employee: Employee): Promise<void> {
		try {
			const imageUrl = `${process.env.APP_BASE_URL}/uploads/${employee.image}`;

			const faceBody = {
				faceURL: imageUrl,
				faceLibType: "blackFD",
				FPID: String(employee.id),
				FDID: "1",
				featurePointType: "face",
			};

			for (const baseUrl of this.baseUrls) {
				try {
					const response = await this.client.post(
						`${baseUrl}/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json`,
						faceBody,
					);

					if (response.status === 200 || response.status === 201) {
						this.logger.log(`Face uploaded successfully on ${baseUrl} for employee: ${employee.fullname}`);
					} else {
						this.logger.warn(
							`Face upload failed on ${baseUrl}: ${response.status} | ${JSON.stringify(response.data)}`,
						);
					}
				} catch (error: any) {
					this.logger.error(`Face upload error on ${baseUrl}: ${error.message}`);
				}
			}
		} catch (error: any) {
			this.logger.error(`Face URL preparation error: ${error.message}`);
		}
	}

	async deleteUserFromHikvision(employee: Employee): Promise<void> {
		try {
			const deleteBody = {
				UserInfoDelCond: {
					EmployeeNoList: [{ employeeNo: String(employee.id) }],
				},
			};

			for (const baseUrl of this.baseUrls) {
				try {
					const response = await this.client.put(
						`${baseUrl}/ISAPI/AccessControl/UserInfo/Delete?format=json`,
						deleteBody,
					);

					if (response.status === 200 || response.status === 201) {
						this.logger.log(`User deleted successfully on ${baseUrl} for employee: ${employee.fullname}`);
					} else {
						this.logger.warn(
							`User deletion failed on ${baseUrl}: ${response.status} | ${JSON.stringify(response.data)}`,
						);
					}
				} catch (error: any) {
					this.logger.error(`User deletion error on ${baseUrl}: ${error.message}`);
				}
			}

			this.logger.log(`Hikvision: ${employee.fullname} deleted`);
		} catch (error: any) {
			this.logger.error(`Hikvision delete general error: ${error.message}`);
		}
	}
}
