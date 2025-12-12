import path from "path";
import winston, { config, Logger as WinstonLogger } from "winston";
import correlator from "../correlator";
import { Operation } from "../operation";
import { appConfig } from "src/config/app.config";

export interface Logger
	extends Pick<WinstonLogger, "error" | "warn" | "info" | "verbose" | "debug" | "silly"> {
	operation(operation: Operation): unknown;
}

function createLogger(opts: any): Logger {
	const { level, getCorrelationId, noCorrelationIdValue = "NO_CORRELATION_ID" } = opts;

	const appTransport = new winston.transports.File({
		filename: appConfig.APP_LOGS_PATH,
		format: winston.format.combine(
			winston.format((info): any => {
				if (info.level !== "operation") {
					info.correlationId = getCorrelationId() || noCorrelationIdValue;
					return info;
				}
			})(),

			winston.format.timestamp(),
			winston.format.errors({ stack: true }),
			winston.format.json(),
		),
	});

	const operationTransport = new winston.transports.File({
		filename: appConfig.OPERATION_LOGS_PATH,
		level: "operation",
		format: winston.format.combine(
			winston.format((info): any => {
				if (info.level === "operation") {
					info.correlationId = getCorrelationId() || noCorrelationIdValue;
					return info;
				}
			})(),

			winston.format.timestamp(),
			winston.format.errors({ stack: true }),
			winston.format.json(),
		),
	});

	const devAppTransport = new winston.transports.File({
		filename: path.join(
			path.dirname(appConfig.APP_LOGS_PATH),
			"dev." + path.basename(appConfig.APP_LOGS_PATH),
		),
		format: winston.format.combine(
			winston.format((info): any => {
				if (info.level !== "operation") {
					info.correlationId = getCorrelationId() || noCorrelationIdValue;
					return info;
				}
			})(),

			winston.format.timestamp(),
			winston.format.errors({ stack: true }),
			winston.format.json({
				space: 4,
			}),
		),
	});

	const devOperationTransport = new winston.transports.File({
		filename: path.join(
			path.dirname(appConfig.OPERATION_LOGS_PATH),
			"dev." + path.basename(appConfig.OPERATION_LOGS_PATH),
		),
		level: "operation",
		format: winston.format.combine(
			winston.format((info): any => {
				if (info.level === "operation") {
					info.correlationId = getCorrelationId() || noCorrelationIdValue;
					return info;
				}
			})(),
			winston.format.timestamp(),
			winston.format.errors({ stack: true }),
			winston.format.json({
				space: 4,
			}),
		),
	});

	const consoleTransport = new winston.transports.Console({
		format: winston.format.combine(
			winston.format((info) => {
				info.correlationId = getCorrelationId() || noCorrelationIdValue;
				return info;
			})(),
			winston.format.timestamp(),
			winston.format.errors({ stack: true }),
			winston.format.json(),
		),
	});

	return winston.createLogger({
		levels: {
			error: 0,
			warn: 1,
			info: 2,
			verbose: 3,
			debug: 4,
			silly: 5,
			operation: 6,
		},
		level,
		transports: [
			appTransport,
			operationTransport,
			consoleTransport,
			devAppTransport,
			devOperationTransport,
		],
		exitOnError: false,
	}) as unknown as Logger;
}

const logger = createLogger({
	getCorrelationId: correlator.getId,
});

export { logger };
