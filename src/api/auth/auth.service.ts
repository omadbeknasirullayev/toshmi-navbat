import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { JwtToken } from "src/infrastructure/lib/jwt-token";

import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from "typeorm";
import axios from "axios";

import { errorPrompt } from "src/infrastructure/lib/prompts/errorPrompt";
import { RolesEnum } from "src/common/database/Enums";
import { LoginDto } from "./dto/login.dto";
import { BcryptEncryption } from "src/infrastructure/lib/bcrypt";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Admin, Student } from "src/common/database/enity";
import { StudentLoginDto } from "./dto/student-login.dto";

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(Admin)
		private readonly adminRepo: Repository<Admin>,
		@InjectRepository(Student)
		private readonly studentRepo: Repository<Student>,
		private readonly jwtToken: JwtToken,
	) {}
	/** admin login */
	async adminLogin(dto: LoginDto) {
		const admin = await this.adminRepo.findOneBy({
			username: dto.username,
			isActive: true,
			isDeleted: false,
		});
		if (!admin) {
			throw new HttpException(errorPrompt.usernameOrPasswordIncorrect, 400);
		}
		const isMatch = await BcryptEncryption.compare(dto.password, admin.password);
		if (!isMatch) {
			throw new HttpException(errorPrompt.usernameOrPasswordIncorrect, 400);
		}

		return { ...admin, token: await this.jwtToken.generateToken(admin, admin.role) };
	}

	async studentLogin(dto: StudentLoginDto) {
		const student = await this.studentRepo.findOneBy({
			hemisId: dto.hemisId,
			isDeleted: false,
		});
		if (!student) {
			throw new HttpException(errorPrompt.usernameOrPasswordIncorrect, 400);
		}
		const isMatch = await BcryptEncryption.compare(dto.password, student.password);
		if (!isMatch) {
			throw new HttpException(errorPrompt.usernameOrPasswordIncorrect, 400);
		}

		return { ...student, token: await this.jwtToken.generateToken(student, RolesEnum.STUDENT) };
	}
}

export function generateVerificationCode(): string {
	return Math.floor(1000 + Math.random() * 9000).toString();
}

export function AddMinutesToDate(date: Date, minutes: number) {
	return new Date(date.getTime() + minutes * 60000).getTime();
}
