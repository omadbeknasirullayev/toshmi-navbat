import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	ParseIntPipe,
	UseGuards,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { FilterDto } from "src/common/dto/filter.dto";
import { ILike } from "typeorm";
import { JwtAuthGuard } from "../auth/user/AuthGuard";
import { RolesGuard } from "../auth/roles/RoleGuard";
import { Public } from "../auth/decorator";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesDecorator } from "../auth/roles/RolesDecorator";
import { RolesEnum } from "src/common/database/Enums";
import { CurrentUser } from "src/common/decorator/current-user";
import { AuthPayload } from "src/common/type";

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller("admin")
@ApiTags("Admin")
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Post()
	// @Public()
	@RolesDecorator(RolesEnum.SUPER_ADMIN)
	create(@Body() dto: CreateAdminDto) {
		return this.adminService.create(dto);
	}

	@Get()
	@RolesDecorator(RolesEnum.SUPER_ADMIN)
	findAll(@Query() query: FilterDto) {
		return this.adminService.findAllWithPagination({
			skip: query.page,
			take: query.page_size,
			where: {
				username: ILike(`%${query.search || ""}%`),
			},
			order: {
				createdAt: "DESC",
			},
		});
	}

	@Get(":id")
	@RolesDecorator(RolesEnum.SUPER_ADMIN, RolesEnum.SUPERVISOR)
	findOne(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: AuthPayload) {
		id = user.role == RolesEnum.SUPER_ADMIN ? id : user.id;
		return this.adminService.findOneBy({ where: { id } });
	}

	@Patch(":id")
	@RolesDecorator(RolesEnum.SUPER_ADMIN, RolesEnum.SUPERVISOR)
	update(
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: UpdateAdminDto,
		@CurrentUser() user: AuthPayload,
	) {
		id = user.role == RolesEnum.SUPER_ADMIN ? id : user.id;
		return this.adminService.update(id, dto);
	}

	@Delete(":id")
	@RolesDecorator(RolesEnum.SUPER_ADMIN)
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.adminService.delete(id);
	}
}
