import { BadRequestException, HttpStatus, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as express from "express";
import morgan from "morgan";
import { join } from "path";
import { appConfig } from "src/config/app.config";
import { AllExceptionsFilter } from "../infrastructure/lib/filter/all.exception.filter";
import { logger } from "../infrastructure/lib/logger";
import { AppModule } from "./app.module";
import { TransformInterceptor } from "../common/interceptor/transform.interceptor";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from 'cookie-parser';

export default class Application {
	public static async main(): Promise<void> {


		let app = await NestFactory.create(AppModule);
		app.useGlobalFilters(new AllExceptionsFilter());
		app.enableCors({
			origin: "*",
		});
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transformOptions: { enableImplicitConversion: false }, // MUHIM!
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		);

		app.use(cookieParser());

		app.useGlobalInterceptors(new TransformInterceptor());

		app.setGlobalPrefix("api");
		// app.use("/api/uploads", express.static(join(__dirname, "../../../uploads")));
		app.use(
			morgan(function (tokens, req, res): any {
				logger.info({
					correlationId: req.headers["x-correlation-id"],
					method: tokens.method(req, res),
					url: tokens.url(req, res),
					status: tokens.status(req, res),
					contentLength: tokens.res(req, res, "content-length"),
					responseTime: tokens["response-time"](req, res),
					remoteAddr: tokens["remote-addr"](req, res),
					userAgent: tokens["user-agent"](req, res),
					httpVersion: tokens["http-version"](req, res),
					totalTime: tokens["total-time"](req, res),
				});
			}),
		);

		const swaggerConfig = new DocumentBuilder()
			.setTitle("Toshmi navbat API")
			.setDescription("Toshmi navbat system API for managing schedules and appointments")
			.setVersion("1.0.0")
			.addGlobalParameters({
				name: "accept-language",
				in: "header",
			})
			// .addBearerAuth()
			.build();
		const document = SwaggerModule.createDocument(app, swaggerConfig);
		SwaggerModule.setup("docs", app, document);

		await app.listen(appConfig.PORT, () => {
			logger.info(`Server running on  ${appConfig.PORT} port`);
		});
	}
}
