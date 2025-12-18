import * as dotenv from "dotenv";
import { Logger } from "@nestjs/common";

dotenv.config();

export type AppConfigType = {
	PORT: number;
	DB_URL: string;
	NODE_ENV: string;
	APP_LOGS_PATH: string;
	OPERATION_LOGS_PATH: string;
	FILE_SIZE: number;
	PATH_FOR_FILE_UPLOAD: string;
	TOKEN_KEY: string;
	TOKEN_EXPIRE: number;
	CATCHUP_SCHEDULE_INTERVAL: number;
};

const requiredVariables = [
	"PORT",
	"DEV_DB_URL",
	"PROD_DB_URL",
	"NODE_ENV",
	"APP_LOGS_PATH",
	"OPERATION_LOGS_PATH",
	"FILE_SIZE",
	"PATH_FOR_FILE_UPLOAD",
	"TOKEN_KEY",
	"TOKEN_EXPIRE",
	"CATCHUP_SCHEDULE_INTERVAL",
];

const missingVariables = requiredVariables.filter((variable) => {
	const value = process.env[variable];
	return !value || value.trim() === "";
});

if (missingVariables.length > 0) {
	Logger.error(`Missing or empty required environment variables: ${missingVariables.join(", ")}`);
	process.exit(1);
}

export const appConfig: AppConfigType = {
	PORT: parseInt(process.env.PORT as string, 10),
	DB_URL:
		process.env.NODE_ENV === "development"
			? (process.env.DEV_DB_URL as string)
			: (process.env.PROD_DB_URL as string),
	NODE_ENV: process.env.NODE_ENV as string,
	APP_LOGS_PATH: process.env.APP_LOGS_PATH as string,
	OPERATION_LOGS_PATH: process.env.OPERATION_LOGS_PATH as string,
	FILE_SIZE: parseInt(process.env.FILE_SIZE as string, 10),
	PATH_FOR_FILE_UPLOAD: process.env.PATH_FOR_FILE_UPLOAD as string,
	TOKEN_KEY: process.env.TOKEN_KEY as string,
	TOKEN_EXPIRE: parseInt(process.env.TOKEN_EXPIRE as string, 10),
	CATCHUP_SCHEDULE_INTERVAL: parseInt(process.env.CATCHUP_SCHEDULE_INTERVAL as string, 10),
};
