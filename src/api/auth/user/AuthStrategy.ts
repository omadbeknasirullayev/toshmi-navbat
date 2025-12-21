import { HttpException, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Admin } from "src/common/database/enity";

import { RolesEnum } from "src/common/database/Enums";
import { AuthPayload } from "src/common/type";
import { appConfig } from "src/config/app.config";
import { errorPrompt } from "src/infrastructure/lib/prompts/errorPrompt";
import { Repository } from "typeorm";
import { Request } from "express";
import { Cookies } from "../enums/cookie.enum";
import { Student } from "src/common/database/enity/student.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
	constructor(
		@InjectRepository(Admin) private readonly adminRepo: Repository<Admin>,
		@InjectRepository(Student) private readonly studentRepo: Repository<Student>
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					console.log(request.cookies);
					
					// Try to extract from cookie first
					const tokenFromCookie = request?.cookies?.[Cookies.ACCESS_TOKEN];

					if (tokenFromCookie) {
						return tokenFromCookie;
					}
					// Fallback to bearer token from authorization header
					return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
				},
			]),
			secretOrKey: appConfig.TOKEN_KEY,
			passReqToCallback: true,
		});
	}

	async validate(req: Request, payload: AuthPayload) {
		let user: {
			id: number | undefined;
			role: RolesEnum | undefined;
			hemisId?: string;
		} | null = null;

		try {
			if ([RolesEnum.SUPER_ADMIN, RolesEnum.SUPERVISOR].includes(payload.role)) {
				const admin = await this.adminRepo.findOne({
					where: {
						id: payload.id,
						isActive: true,
						isDeleted: false,
					},
				});
				user = { id: admin?.id, role: admin?.role };
			} else if (payload.role === RolesEnum.STUDENT) {
				const student = await this.studentRepo.findOne({
					where: {
						id: payload.id,
						isActive: true,
						isDeleted: false,
					},
				});
				user = { id: student?.id, role: payload.role, hemisId: student?.hemisId };
			}


			if (!user) {
				throw new HttpException(errorPrompt.authorizationError, 401);
			}
		} catch (error) {
			throw error;
		}
		return user;
	}
}
