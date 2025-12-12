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
import { CatchupScheduleService } from "./catchup-schedule.service";
import { CreateCatchupScheduleDto } from "./dto/create-catchup-schedule.dto";
import { UpdateCatchupScheduleDto } from "./dto/update-catchup-schedule.dto";
import { CurrentUser } from "src/common/decorator/current-user";
import { AuthPayload } from "src/common/type";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/user/AuthGuard";
import { RolesGuard } from "../auth/roles/RoleGuard";
import { RolesDecorator } from "../auth/roles/RolesDecorator";
import { RolesEnum } from "src/common/database/Enums";
import { WriteQueueDto } from "./dto/write-queue.dto";

@Controller("catchup-schedule")
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesDecorator(RolesEnum.SUPER_ADMIN, RolesEnum.SUPERVISOR)
@ApiTags("Catchup Schedule")
export class CatchupScheduleController {
	constructor(private readonly catchupScheduleService: CatchupScheduleService) {}

	@Post()
	create(@Body() createCatchupScheduleDto: CreateCatchupScheduleDto) {
		return this.catchupScheduleService.create(createCatchupScheduleDto);
	}

	@Post("register-queue")
	@RolesDecorator(RolesEnum.STUDENT)
	writeQueueStudent(
		@Body() body: WriteQueueDto,
		@CurrentUser() user: AuthPayload,
	) {
		return this.catchupScheduleService.writeQueueStudent(user.id, body.catchupScheduleId);
	}

	@Get()
	findAll() {
		return this.catchupScheduleService.findAll({
			where: { isDeleted: false },
			relations: { building: true },
		});
	}

	@Get("by-student")
	@RolesDecorator(RolesEnum.STUDENT)
	findByStudent(@CurrentUser() user: AuthPayload) {
		return this.catchupScheduleService.findByStudentId(user.id);
	}

	@Get("queue-student")
	@RolesDecorator(RolesEnum.STUDENT)
	getQueueStudent(@CurrentUser() user: AuthPayload) {
		return this.catchupScheduleService.getQueueStudent(user.id);
	}

	@Get(":id")
	findOne(@Param("id", ParseIntPipe) id: number) {
		return this.catchupScheduleService.findOneBy({
			where: { id, isDeleted: false, isActive: true },
		});
	}

	@Patch(":id")
	update(
		@Param("id", ParseIntPipe) id: number,
		@Body() updateCatchupScheduleDto: UpdateCatchupScheduleDto,
	) {
		return this.catchupScheduleService.update(id, updateCatchupScheduleDto);
	}

	@Delete(":id")
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.catchupScheduleService.remove(+id);
	}
}
