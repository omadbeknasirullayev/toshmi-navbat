import { Module } from "@nestjs/common";
import { TwoMbService } from "./two-mb.service";
import { TwoMbController } from "./two-mb.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StudentLowPerformance } from "src/common/database/enity";

@Module({
	imports: [TypeOrmModule.forFeature([StudentLowPerformance])],
	controllers: [TwoMbController],
	providers: [TwoMbService],
	exports: [TwoMbService],
})
export class TwoMbModule {}
