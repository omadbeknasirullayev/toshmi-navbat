import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtToken } from "src/infrastructure/lib/jwt-token";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./user/AuthStrategy";
import { Admin, Student, StudentLowPerformance, Facultet } from "src/common/database/enity";
import { ExternalModule } from "../external/external.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Admin, Student, StudentLowPerformance, Facultet]),
		JwtModule,
		ExternalModule,
	],
	controllers: [AuthController],
	providers: [AuthService, JwtToken, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}
