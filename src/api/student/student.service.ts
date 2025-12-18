import { HttpException, Injectable } from "@nestjs/common";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { BaseService } from "src/infrastructure/lib/baseService";
import { Student } from "src/common/database/enity";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { BcryptEncryption } from "src/infrastructure/lib/bcrypt";
import { errorPrompt } from "src/infrastructure/lib/prompts/errorPrompt";

@Injectable()
export class StudentService extends BaseService<CreateStudentDto, UpdateStudentDto, Student> {
	constructor(@InjectRepository(Student) private readonly repo: Repository<Student>) {
		super(repo, "Student");
	}

	async create(dto: CreateStudentDto): Promise<Student> {
		const existing = await this.repo.findOne({ where: { hemisId: dto.hemisId } });
		if (existing) {
			return existing;
		}

		dto.password = await BcryptEncryption.encrypt(dto.password);
		return await super.create(dto);
	}

	async update(id: number, dto: UpdateStudentDto): Promise<{}> {
		const existing = await this.repo.findOne({ where: { id, isDeleted: false } });

		if (!existing) {
			throw new HttpException(errorPrompt.studentNotFound, 404);
		}

		if (dto.hemisId) {
			const duplicate = await this.repo.findOne({
				where: { hemisId: dto.hemisId, id: Not(id), isDeleted: false },
			});
			if (duplicate) {
				throw new HttpException(errorPrompt.studentHemisIdAlreadyExists, 400);
			}
		}

		if (dto.password) {
			dto.password = await BcryptEncryption.encrypt(dto.password);
		}

		return await super.update(id, dto);
	}
}
