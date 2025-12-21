import { Injectable } from "@nestjs/common";
import { CreateTwoMbDto } from "./dto/create-two-mb.dto";
import { UpdateTwoMbDto } from "./dto/update-two-mb.dto";
import { BaseService } from "src/infrastructure/lib/baseService";
import { StudentLowPerformance } from "src/common/database/enity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class TwoMbService extends BaseService<
	CreateTwoMbDto,
	UpdateTwoMbDto,
	StudentLowPerformance
> {
	constructor(
		@InjectRepository(StudentLowPerformance)
		private readonly repo: Repository<StudentLowPerformance>,
	) {
		super(repo, "StudentLowPerformance");
	}

	/**
	 * Get all 2MB records for a specific student
	 */
	async findByStudentId(studentId: number) {
		return this.repo.find({
			where: { studentId, isDeleted: false },
			order: { date: "DESC" },
		});
	}


}
