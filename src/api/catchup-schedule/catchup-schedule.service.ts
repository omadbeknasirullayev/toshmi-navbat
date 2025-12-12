import { HttpException, Injectable } from "@nestjs/common";
import { CreateCatchupScheduleDto } from "./dto/create-catchup-schedule.dto";
import { UpdateCatchupScheduleDto } from "./dto/update-catchup-schedule.dto";
import { BaseService } from "src/infrastructure/lib/baseService";
import { CatchupSchedule } from "src/common/database/enity/catchup-schedule.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThanOrEqual, Not, Repository } from "typeorm";
import { Student } from "src/common/database/enity";
import { CatchupScheduleStudent } from "src/common/database/enity/catchup-schedule-student.entity";

@Injectable()
export class CatchupScheduleService extends BaseService<
	CreateCatchupScheduleDto,
	UpdateCatchupScheduleDto,
	CatchupSchedule
> {
	constructor(
		@InjectRepository(CatchupSchedule)
		private readonly repo: Repository<CatchupSchedule>,

		@InjectRepository(CatchupScheduleStudent)
		private readonly catchupScheduleStudentRepo: Repository<CatchupScheduleStudent>,

		@InjectRepository(Student)
		private readonly studentRepo: Repository<Student>,
	) {
		super(repo, "Catchup Schedule");
	}

	async create(dto: CreateCatchupScheduleDto) {
		const existingBuilding = await this.repo.findOne({
			where: { buildingId: dto.buildingId, date: dto.date },
		});

		if (existingBuilding) {
			throw new HttpException(
				"Catchup schedule already exists for this building and date",
				400,
			);
		}

		const catchupSchedule = this.repo.create(dto);
		return await this.repo.save(catchupSchedule);
	}

	async update(id: number, dto: UpdateCatchupScheduleDto) {
		await this.findOneBy({ where: { id, isDeleted: false, isActive: true } });

		if (dto.buildingId && dto.date) {
			const existing = await this.repo.findOne({
				where: { id: Not(id), buildingId: dto.buildingId, date: dto.date },
			});
			if (existing) {
				throw new HttpException(
					"Catchup schedule already exists for this building and date",
					400,
				);
			}
		}

		await this.repo.update(id, dto);
		return await this.findOneBy({ where: { id, isDeleted: false, isActive: true } });
	}

	async findByStudentId(studentId: number) {
		const student = await this.studentRepo.findOne({
			where: { id: studentId },
			relations: { facultet: true },
		});

		if (!student) {
			throw new HttpException("Student not found", 404);
		}

		return await this.repo.find({
			where: {
				course: student.course,
				date: MoreThanOrEqual(new Date()),
				buildingId: student.facultet.buildingId,
				isDeleted: false,
				isActive: true,
			},
			relations: { building: true },
		});
	}

	async remove(id: number) {
		await this.repo.delete(id);
		return { message: "Catchup schedule deleted successfully" };
	}

	async writeQueueStudent(studentId: number, catchupScheduleId: number) {
		const student = await this.studentRepo.findOne({
			where: { id: studentId },
			relations: { facultet: true },
		});

		if (!student) {
			throw new HttpException("Student not found", 404);
		}

		const catchup = await this.findOneBy({
			where: {
				id: catchupScheduleId,
				buildingId: student?.facultet?.buildingId,
				isDeleted: false,
				isActive: true,
				date: MoreThanOrEqual(new Date()),
			},
			relations: { building: true },
		});

		if (!catchup || !catchup.building) {
			throw new HttpException("Catchup schedule not found", 404);
		}

		if (catchup?.building?.computerCount <= catchup.registrationCount) {
			throw new HttpException("No available computers for registration", 400);
		}

		const existingStudent = await this.catchupScheduleStudentRepo.findOne({
			where: { catchupScheduleId, studentId: studentId },
		});

		if (existingStudent) {
			throw new HttpException("Student already registered for this catchup", 400);
		}

		catchup.registrationCount += 1;

		const catchupScheduleStudent = await this.catchupScheduleStudentRepo.save(
			this.catchupScheduleStudentRepo.create({
				studentId,
				catchupScheduleId,
			}),
		);

		await this.repo.save(catchup);

		return catchupScheduleStudent;
	}
}
