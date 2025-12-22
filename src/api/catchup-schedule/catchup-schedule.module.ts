import { Module } from "@nestjs/common";
import { CatchupScheduleService } from "./catchup-schedule.service";
import { CatchupScheduleController } from "./catchup-schedule.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CatchupSchedule } from "src/common/database/enity/catchup-schedule.entity";
import { Student } from "src/common/database/enity";
import { CatchupScheduleStudent } from "src/common/database/enity/catchup-schedule-student.entity";
import { Facultet } from "src/common/database/enity/facultet.entity";
import { StudentLowPerformance } from "src/common/database/enity/student-low-performance.entity";
import { CatchupScheduleFacultet } from "src/common/database/enity/catchup-schedule-facultet.entity";

@Module({
	imports: [TypeOrmModule.forFeature([CatchupSchedule, Student, CatchupScheduleStudent, Facultet, StudentLowPerformance, CatchupScheduleFacultet])],
	controllers: [CatchupScheduleController],
	providers: [CatchupScheduleService],
	exports: [CatchupScheduleService],
})
export class CatchupScheduleModule {}
