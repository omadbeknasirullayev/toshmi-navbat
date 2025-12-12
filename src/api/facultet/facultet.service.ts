import { Injectable } from "@nestjs/common";
import { CreateFacultetDto } from "./dto/create-facultet.dto";
import { UpdateFacultetDto } from "./dto/update-facultet.dto";
import { BaseService } from "src/infrastructure/lib/baseService";
import { Facultet } from "src/common/database/enity/facultet.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class FacultetService extends BaseService<CreateFacultetDto, UpdateFacultetDto, Facultet> {
	constructor(@InjectRepository(Facultet) private readonly repo: Repository<Facultet>) {
		super(repo, "Facultets");
	}
}
