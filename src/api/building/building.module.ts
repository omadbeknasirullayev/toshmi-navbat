import { Module } from "@nestjs/common";
import { BuildingService } from "./building.service";
import { BuildingController } from "./building.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Building } from "src/common/database/enity";

@Module({
	imports: [TypeOrmModule.forFeature([Building])],
	controllers: [BuildingController],
	providers: [BuildingService],
})
export class BuildingModule {}
