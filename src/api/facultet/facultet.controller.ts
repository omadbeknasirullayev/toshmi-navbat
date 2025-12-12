import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	ParseIntPipe,
} from "@nestjs/common";
import { FacultetService } from "./facultet.service";
import { CreateFacultetDto } from "./dto/create-facultet.dto";
import { UpdateFacultetDto } from "./dto/update-facultet.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/user/AuthGuard";
import { RolesGuard } from "../auth/roles/RoleGuard";
import { RolesDecorator } from "../auth/roles/RolesDecorator";
import { RolesEnum } from "src/common/database/Enums";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("facultet")
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesDecorator(RolesEnum.SUPER_ADMIN, RolesEnum.SUPERVISOR)
@ApiTags("Facultets")
@ApiBearerAuth()
export class FacultetController {
	constructor(private readonly facultetService: FacultetService) {}

	@Post()
	@ApiOperation({ summary: "for admin" })
	create(@Body() dto: CreateFacultetDto) {
		return this.facultetService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: "for admin" })
	findAll() {
		return this.facultetService.findAll();
	}

	@Get(":id")
	@ApiOperation({ summary: "for admin" })
	findOne(@Param("id", ParseIntPipe) id: number) {
		return this.facultetService.findOneById(id);
	}

	@Patch(":id")
	@ApiOperation({ summary: "for admin" })
	update(@Param("id", ParseIntPipe) id: number, @Body() updateFacultetDto: UpdateFacultetDto) {
		return this.facultetService.update(id, updateFacultetDto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "for admin" })
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.facultetService.delete(id);
	}
}
