import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtToken } from "src/infrastructure/lib/jwt-token";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./user/AuthStrategy";
import { Admin, Student } from "src/common/database/enity";

@Module({
	imports: [
		TypeOrmModule.forFeature([Admin, Student]),
		JwtModule,
	],
	controllers: [AuthController],
	providers: [AuthService, JwtToken, JwtStrategy],
	exports:[AuthService]
})
export class AuthModule { }
