import { Module } from "@nestjs/common";
import { FacultetService } from "./facultet.service";
import { FacultetController } from "./facultet.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Facultet } from "src/common/database/enity/facultet.entity";
import { ExternalModule } from "../external/external.module";

@Module({
	imports: [TypeOrmModule.forFeature([Facultet]), ExternalModule],
	controllers: [FacultetController],
	providers: [FacultetService],
})
export class FacultetModule {}
