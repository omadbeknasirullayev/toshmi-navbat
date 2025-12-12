import { HttpException, Injectable } from "@nestjs/common";
import { CreateCatchupScheduleDto } from "./dto/create-catchup-schedule.dto";
import { UpdateCatchupScheduleDto } from "./dto/update-catchup-schedule.dto";
import { BaseService } from "src/infrastructure/lib/baseService";
import { CatchupSchedule } from "src/common/database/enity/catchup-schedule.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";

@Injectable()
export class CatchupScheduleService extends BaseService<
	CreateCatchupScheduleDto,
	UpdateCatchupScheduleDto,
	CatchupSchedule
> {
	constructor(
		@InjectRepository(CatchupSchedule)
		private readonly repo: Repository<CatchupSchedule>,
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
				throw new HttpException("Catchup schedule already exists for this building and date", 400);
			}
		}

		await this.repo.update(id, dto);
		return await this.findOneBy({ where: { id, isDeleted: false, isActive: true } });
	}

	async remove(id: number) {
		await this.repo.delete(id);
		return { message: "Catchup schedule deleted successfully" };
	}
}
