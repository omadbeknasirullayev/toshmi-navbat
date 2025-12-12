import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { logger } from "../logger";
import { ErrorStackParserFunction } from "src/common/error/ErrorStackParser";
import { errorPrompt } from "../prompts/errorPrompt";

type ErrorObject = {
	status?: string;
	code?: string;
	message: any;
	[k: string]: any;
};

export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const res = ctx.getResponse<Response>();
		const req = ctx.getRequest<Request>();

		//Route yo‘qligi (Cannot GET/POST/...)
		const s = String(exception || "");
		if (
			s.includes("Cannot GET") ||
			s.includes("Cannot POST") ||
			s.includes("Cannot PUT") ||
			s.includes("Cannot PATCH") ||
			s.includes("Cannot DELETE")
		) {
			const statusCode = HttpStatus.NOT_FOUND;
			const error: ErrorObject = { ...errorPrompt.cannotDoAction }; // butun obyektni qaytaramiz

			return res.status(statusCode).json(this.wrap(statusCode, req, error));
		}

		// Stack va log
		const stack = ErrorStackParserFunction(exception);

		let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
		let error: ErrorObject = {
			status: "INTERNAL_SERVER_ERROR",
			statusCode,
			message: {
				uz: "Server xatoligi!",
				ru: "Server ошибка!",
			},
		};
		// Turlarga qarab normalizatsiya
		if (exception instanceof HttpException) {
			statusCode = exception.getStatus();
			const resp = exception.getResponse();

			// resp string | object | array bo‘lishi mumkin — to‘liq obyektga o‘tkazamiz
			if (typeof resp === "string") {
				error = {
					status: this.statusNameFromHttp(statusCode),
					message: { uz: resp, ru: resp },
				};
			} else if (Array.isArray(resp)) {
				error = {
					status: this.statusNameFromHttp(statusCode),
					message: { uz: resp[0], ru: resp[0] },
				};
			} else if (resp && typeof resp === "object") {
				error = { ...resp } as ErrorObject;
				if (error.statusCode === 403) {
					error.status = "FORBIDDEN";
					error.message = {
						uz: "Ruxsat berilmagan foydalanuvchi!",
						ru: "Запрещенный пользователь!",
					};
				} else if (typeof error.message === "string") {
					error.message = { uz: error.message, ru: error.message };
				}
				// status yo‘q bo‘lsa, qo‘shib qo‘yamiz
				if (!error.status) error.status = this.statusNameFromHttp(statusCode);
			} else {
				error = {
					status: this.statusNameFromHttp(statusCode),
					message: { uz: "Error", ru: "Ошибка" },
				};
			}
		} else {
			statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
			error = {
				status: "INTERNAL_SERVER_ERROR",
				message: {
					uz: (exception as any)?.message || "Server xatoligi!",
					ru: (exception as any)?.message || "Server ошибка!",
				},
			};
		}

		//Log
		logger.error({
			statusCode,
			error,
			stack,
		});

		// Yagona shablon
		return res.status(statusCode).json(this.wrap(statusCode, req, error));
	}

	private wrap(statusCode: number, req: Request, error: ErrorObject) {
		console.log(error);
		
		if (req.headers["accept-language"] === "ru") {
			error.message = error.message.ru ? error.message.ru : error.message[0];
		} else {
			error.message = error.message.uz ? error.message.uz : error.message[0];
		}

		return {
			status: false,
			statusCode,
			error,
			timestamp: new Date().toISOString(),
			path: req.path,
			data: null,
		};
	}

	private statusNameFromHttp(code: number): string {
		switch (code) {
			case HttpStatus.BAD_REQUEST:
				return "BAD_REQUEST";
			case HttpStatus.UNAUTHORIZED:
				return "UNAUTHORIZED";
			case HttpStatus.FORBIDDEN:
				return "FORBIDDEN";
			case HttpStatus.NOT_FOUND:
				return "NOT_FOUND";
			case HttpStatus.CONFLICT:
				return "CONFLICT";
			case HttpStatus.UNPROCESSABLE_ENTITY:
				return "UNPROCESSABLE_ENTITY";
			case HttpStatus.TOO_MANY_REQUESTS:
				return "TOO_MANY_REQUESTS";
			default:
				return "INTERNAL_SERVER_ERROR";
		}
	}
}
