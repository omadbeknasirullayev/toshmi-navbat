import { Module } from "@nestjs/common";
import { CatchupScheduleService } from "./catchup-schedule.service";
import { CatchupScheduleController } from "./catchup-schedule.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CatchupSchedule } from "src/common/database/enity/catchup-schedule.entity";
import { Student } from "src/common/database/enity";
import { CatchupScheduleStudent } from "src/common/database/enity/catchup-schedule-student.entity";

@Module({
	imports: [TypeOrmModule.forFeature([CatchupSchedule, Student, CatchupScheduleStudent])],
	controllers: [CatchupScheduleController],
	providers: [CatchupScheduleService],
	exports: [CatchupScheduleService],
})
export class CatchupScheduleModule {}
