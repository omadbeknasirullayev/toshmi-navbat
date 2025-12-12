import { HttpException, Injectable } from "@nestjs/common";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { BaseService } from "src/infrastructure/lib/baseService";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Admin } from "src/common/database/enity";
import { errorPrompt } from "src/infrastructure/lib/prompts/errorPrompt";
import { BcryptEncryption } from "src/infrastructure/lib/bcrypt";

@Injectable()
export class AdminService extends BaseService<CreateAdminDto, UpdateAdminDto, Admin> {
	constructor(
		@InjectRepository(Admin)
		private readonly repo: Repository<Admin>,
	) {
		super(repo, "Admin");
	}

	public async create(dto: CreateAdminDto) {
		const admin = await this.repo.findOne({
			where: { username: dto.username, isDeleted: false },
		});
		if (admin) {
			throw new HttpException(errorPrompt.usernameAlreadyExists, 409);
		}

		dto.password = await BcryptEncryption.encrypt(dto.password);
		return super.create(dto);
	}


	public async update(id: number, dto: UpdateAdminDto) {
		const admin = await this.findOneBy({ where: { id, isDeleted: false } });

		if (dto.username) {
			const checkusername = await this.repo.findOne({
				where: { username: dto.username, isDeleted: false },
			});

			if (checkusername && checkusername.id !== admin.id) {
				throw new HttpException(errorPrompt.usernameAlreadyExists, 409);
			}
		}

		if (dto.password) {
			dto.password = await BcryptEncryption.encrypt(dto.password);
		}

		return super.update(id, dto);
	}

}
