import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseIntPipe,
	UseGuards,
} from "@nestjs/common";
import { BuildingService } from "./building.service";
import { CreateBuildingDto } from "./dto/create-building.dto";
import { UpdateBuildingDto } from "./dto/update-building.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../auth/roles/RoleGuard";
import { JwtAuthGuard } from "../auth/user/AuthGuard";
import { RolesDecorator } from "../auth/roles/RolesDecorator";
import { RolesEnum } from "src/common/database/Enums";

@Controller("building")
@RolesDecorator(RolesEnum.SUPER_ADMIN, RolesEnum.SUPERVISOR)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags("Buildings")
@ApiBearerAuth()
export class BuildingController {
	constructor(private readonly buildingService: BuildingService) {}

	@Post()
	@ApiOperation({ summary: "for admin" })
	create(@Body() dto: CreateBuildingDto) {
		return this.buildingService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: "for admin" })
	findAll() {
		return this.buildingService.findAll({ where: { isDeleted: false } });
	}

	@Get(":id")
	@ApiOperation({ summary: "for admin" })
	findOne(@Param("id", ParseIntPipe) id: number) {
		return this.buildingService.findOneById(id, { where: { isDeleted: false } });
	}

	@Patch(":id")
	@ApiOperation({ summary: "for admin" })
	update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateBuildingDto) {
		return this.buildingService.update(id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "for admin" })
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.buildingService.delete(id);
	}
}
