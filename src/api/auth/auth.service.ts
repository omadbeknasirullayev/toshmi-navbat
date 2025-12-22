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
import { Admin, Facultet, Student, StudentLowPerformance } from "src/common/database/enity";
import { StudentLoginDto } from "./dto/student-login.dto";
import { ExternalService } from "../external/external.service";

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(Admin)
		private readonly adminRepo: Repository<Admin>,
		@InjectRepository(Student)
		private readonly studentRepo: Repository<Student>,
		@InjectRepository(StudentLowPerformance)
		private readonly studentLowPerformanceRepo: Repository<StudentLowPerformance>,
		@InjectRepository(Facultet)
		private readonly facultetRepo: Repository<Facultet>,
		private readonly externalService: ExternalService,
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
		let student = await this.studentRepo.findOneBy({
			hemisId: dto.hemisId,
			isDeleted: false,
		});

		if (!student) {
			const tmaStudent = await this.externalService.loginTMA({
				username: dto.hemisId,
				password: dto.password,
			});
			if (!tmaStudent) {
				throw new HttpException(errorPrompt.usernameOrPasswordIncorrect, 400);
			}

			const hashedPassword = await BcryptEncryption.encrypt(dto.password);
			const faculctet = await this.facultetRepo.findOneBy({
				hemisFacultyId: tmaStudent.user.department,
			});

			const newStudent = this.studentRepo.create({
				hemisId: tmaStudent.user.student_id_number,
				password: hashedPassword,
				fullname: tmaStudent.user.full_name,
				shortName: tmaStudent.user.short_name,
				phoneNumber: tmaStudent.user.phone,
				email: tmaStudent.user.email,
				image: tmaStudent.user.image,
				birthDate: tmaStudent.user.birth_date,
				address: tmaStudent.user.address,
				avgGpa: tmaStudent.user.avg_gpa,
				specialty: tmaStudent.user.specialty,
				groupId: tmaStudent.user.group,
				department: tmaStudent.user.department,
				level: tmaStudent.user.level,
				semester: tmaStudent.user.semester,
				educationForm: tmaStudent.user.education_form,
				educationType: tmaStudent.user.educationType,
				paymentForm: tmaStudent.user.paymentForm,
				educationLang: tmaStudent.user.education_lang,
				yearOfEnter: tmaStudent.user.year_of_enter,
				educationYear: tmaStudent.user.educationYear,
				gender: tmaStudent.user.gender,
				studentStatus: tmaStudent.user.student_status,
				citizenship: tmaStudent.user.citizenship,
				currentProvince: tmaStudent.user.currentProvince,
				currentDistrict: tmaStudent.user.currentDistrict,
				tmaUserId: tmaStudent.user.id,
				course: 1,
				facultetId: faculctet?.id,
			});

			student = await this.studentRepo.save(newStudent);

			await this.syncStudentLowPerformanceData(student.hemisId, student.id);

			return {
				...student,
				token: await this.jwtToken.generateToken(student, RolesEnum.STUDENT),
			};
		}

		const isMatch = await BcryptEncryption.compare(dto.password, student.password);
		if (!isMatch) {
			throw new HttpException(errorPrompt.usernameOrPasswordIncorrect, 400);
		}

		await this.syncStudentLowPerformanceData(student.hemisId, student.id);

		return { ...student, token: await this.jwtToken.generateToken(student, RolesEnum.STUDENT) };
	}

	private async syncStudentLowPerformanceData(hemisId: string, studentId: number): Promise<void> {
		const lowPerformanceData = await this.externalService.get2MBStudent(hemisId);

		if (
			!lowPerformanceData ||
			!lowPerformanceData.data ||
			lowPerformanceData.data.length === 0
		) {
			return;
		}

		await this.studentLowPerformanceRepo.delete({ studentId });

		const lowPerformanceRecords = lowPerformanceData.data.map((record: any) => {
			return this.studentLowPerformanceRepo.create({
				studentId,
				subject: record.subject,
				journalId: record.journal_id,
				journalSubjectId: record.journal_subject.id,
				journalSubjectName: record.journal_subject.name,
				journalType: record.journal_type,
				semester: record.journal_subject.semester,
				educationYear: record.journal_subject.education_year,
				gradeType: record.grade_type,
				mark: record.mark,
				markAttendance: record.mark_attendance,
				isAbsent: record.is_absent,
				topicName: record.topic_name,
				topicId: record.topic_id,
				date: new Date(record.date),
				recordCreatedAt: new Date(record.created_at),
			});
		});

		await this.studentLowPerformanceRepo.save(lowPerformanceRecords);
	}
}

export function generateVerificationCode(): string {
	return Math.floor(1000 + Math.random() * 9000).toString();
}

export function AddMinutesToDate(date: Date, minutes: number) {
	return new Date(date.getTime() + minutes * 60000).getTime();
}
