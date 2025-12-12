import { Injectable } from "@nestjs/common";
import { CreateBuildingDto } from "./dto/create-building.dto";
import { UpdateBuildingDto } from "./dto/update-building.dto";
import { BaseService } from "src/infrastructure/lib/baseService";
import { Building } from "src/common/database/enity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class BuildingService extends BaseService<CreateBuildingDto, UpdateBuildingDto, Building> {
	constructor(
		@InjectRepository(Building)
		private readonly repo: Repository<Building>,
	) {
		super(repo, "Building");
	}
}
