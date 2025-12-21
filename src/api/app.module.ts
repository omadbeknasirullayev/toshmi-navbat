import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ScheduleModule as NestScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { appConfig } from "src/config/app.config";
import { CorrelatorMiddleware } from "../infrastructure/middleware/correlator";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";

import { AdminModule } from './admin/admin.module';
import { StudentModule } from './student/student.module';
import { FacultetModule } from './facultet/facultet.module';
import { BuildingModule } from './building/building.module';
import { CatchupScheduleModule } from './catchup-schedule/catchup-schedule.module';
import { ExternalModule } from './external/external.module';
import { TwoMbModule } from './two-mb/two-mb.module';


@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot({
			type: "postgres",
			url: appConfig.DB_URL,
			entities: [__dirname + "/../common/database/enity/*.entity{.ts,.js}"],
			synchronize: true,
		}),
		NestScheduleModule.forRoot(),
		AuthModule,
		AdminModule,
		StudentModule,
		FacultetModule,
		BuildingModule,
		CatchupScheduleModule,
		ExternalModule,
		TwoMbModule,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(CorrelatorMiddleware).forRoutes("*");
	}
}
