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
	Query,
} from "@nestjs/common";
import { TwoMbService } from "./two-mb.service";
import { CreateTwoMbDto } from "./dto/create-two-mb.dto";
import { UpdateTwoMbDto } from "./dto/update-two-mb.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../auth/roles/RoleGuard";
import { JwtAuthGuard } from "../auth/user/AuthGuard";
import { RolesDecorator } from "../auth/roles/RolesDecorator";
import { RolesEnum } from "src/common/database/Enums";
import { AuthPayload } from "src/common/type";
import { CurrentUser } from "src/common/decorator/current-user";


@Controller("two-mb")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags("2MB (Low Performance)")
@ApiBearerAuth()
export class TwoMbController {
	constructor(private readonly twoMbService: TwoMbService) {}

	@Post()
	@RolesDecorator(RolesEnum.SUPER_ADMIN, RolesEnum.SUPERVISOR)
	@ApiOperation({ summary: "Create 2MB record - for admin" })
	create(@Body() dto: CreateTwoMbDto) {
		return this.twoMbService.create(dto);
	}

	@Get()
	@RolesDecorator(RolesEnum.SUPER_ADMIN, RolesEnum.SUPERVISOR)
	@ApiOperation({ summary: "Get all 2MB records - for admin" })
	findAll() {
		return this.twoMbService.findAll({ where: { isDeleted: false } });
	}

	@Get("my-records")
	@RolesDecorator(RolesEnum.STUDENT)
	@ApiOperation({ summary: "Get student's own 2MB records - for student" })
	async getMyRecords(
		@CurrentUser() user: AuthPayload,
		// @Query("grouped") grouped?: string,
	) {
		// if (grouped === "true") {
		// 	return this.twoMbService.findByStudentIdGroupedBySubject(user.id);
		// }
		return this.twoMbService.findByStudentId(user.id);
	}

	@Get("student/:studentId")
	@RolesDecorator(RolesEnum.SUPER_ADMIN, RolesEnum.SUPERVISOR)
	@ApiOperation({ summary: "Get 2MB records by student ID - for admin" })
	async getByStudentId(
		@Param("studentId", ParseIntPipe) studentId: number,
	) {

		return this.twoMbService.findByStudentId(studentId);
	}

	@Get(":id")
	@RolesDecorator(RolesEnum.SUPER_ADMIN, RolesEnum.SUPERVISOR)
	@ApiOperation({ summary: "Get single 2MB record - for admin" })
	findOne(@Param("id", ParseIntPipe) id: number) {
		return this.twoMbService.findOneById(id, { where: { isDeleted: false } });
	}

	@Patch(":id")
	@RolesDecorator(RolesEnum.SUPER_ADMIN, RolesEnum.SUPERVISOR)
	@ApiOperation({ summary: "Update 2MB record - for admin" })
	update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateTwoMbDto) {
		return this.twoMbService.update(id, dto);
	}

	@Delete(":id")
	@RolesDecorator(RolesEnum.SUPER_ADMIN, RolesEnum.SUPERVISOR)
	@ApiOperation({ summary: "Delete 2MB record - for admin" })
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.twoMbService.delete(id);
	}
}
