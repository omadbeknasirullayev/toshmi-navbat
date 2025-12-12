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
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/user/AuthGuard";
import { RolesGuard } from "../auth/roles/RoleGuard";
import { RolesDecorator } from "../auth/roles/RolesDecorator";
import { RolesEnum } from "src/common/database/Enums";
import { WriteQueueDto } from "./dto/write-queue.dto";
import { Public } from "../auth/decorator";

@Controller("catchup-schedule")
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesDecorator(RolesEnum.SUPER_ADMIN, RolesEnum.SUPERVISOR)
@ApiTags("Catchup Schedule")
export class CatchupScheduleController {
	constructor(private readonly catchupScheduleService: CatchupScheduleService) {}

	@Post()
	@ApiOperation({
		summary: "for admin",
		description: "Adminlar catchup schedule ya'ni otrabotka jadvallarini yaratish uchun",
	})
	create(@Body() createCatchupScheduleDto: CreateCatchupScheduleDto) {
		return this.catchupScheduleService.create(createCatchupScheduleDto);
	}

	@Post("register-queue")
	@RolesDecorator(RolesEnum.STUDENT)
	@ApiOperation({
		summary: "for student",
		description: "Studentlar catchup schedulega yani otrabotka jadvaliga navbat olishi uchun",
	})
	writeQueueStudent(@Body() body: WriteQueueDto, @CurrentUser() user: AuthPayload) {
		return this.catchupScheduleService.writeQueueStudent(user.id, body.catchupScheduleId);
	}

	@Get()
	@ApiOperation({
		summary: "for admin",
		description: "Adminlar catchup schedule ya'ni otrabotka jadvallarini ko'rish uchun",
	})
	findAll() {
		return this.catchupScheduleService.findAll({
			where: { isDeleted: false },
			relations: { building: true },
		});
	}

	@Get("by-student")
	@ApiOperation({
		summary: "for student",
		description: "Studentlar catchup schedulega yani otrabotka jadvallarini ko'rish uchun",
	})
	@RolesDecorator(RolesEnum.STUDENT)
	findByStudent(@CurrentUser() user: AuthPayload) {
		return this.catchupScheduleService.findByStudentId(user.id);
	}

	@Get("queue-student")
	@RolesDecorator(RolesEnum.STUDENT)
	@ApiOperation({
		summary: "for student",
		description:
			"Studentlar catchup schedulega yani otrabotka jadvaliga olingan o'rnini ko'rish uchun",
	})
	getQueueStudent(@CurrentUser() user: AuthPayload) {
		return this.catchupScheduleService.getQueueStudent(user.id);
	}

	@Get("pending-students/:catchupScheduleId")
	@ApiOperation({
		summary: "for all",
		description: "Umumiy monitorda shu jadval uchun hali kelmagan studentlarni ko'rish uchun",
	})
	@Public()
	pendingStudents(@Param("catchupScheduleId", ParseIntPipe) catchupScheduleId: number) {
		return this.catchupScheduleService.pendingStudents(catchupScheduleId);
	}

	@Get("pending-students-admin/:catchupScheduleId")
	@ApiOperation({
		summary: "for admin",
		description:
			"adminlar uchun catchup schedule yani otrabotka ga yozilgan studentlarni ko'rish uchun",
	})
	pendingStudentsAdmin(@Param("catchupScheduleId", ParseIntPipe) catchupScheduleId: number) {
		return this.catchupScheduleService.pendingStudents(catchupScheduleId);
	}

	@Get(":id")
	@ApiOperation({ summary: "for admin" })
	findOne(@Param("id", ParseIntPipe) id: number) {
		return this.catchupScheduleService.findOneBy({
			where: { id, isDeleted: false, isActive: true },
		});
	}

	@Patch("toArrived-student/:catchupScheduleStudentId")
	@ApiOperation({
		summary: "for admin",
		description:
			"Adminlar catchup schedule studentlar dagi id ni yuboradi. Student olgan navbat  keldiga o'zgatirish uchun",
	})
	toArrivedStudent(
		@Param("catchupScheduleStudentId", ParseIntPipe) catchupScheduleStudentId: number,
	) {
		return this.catchupScheduleService.toArrivedStudent(catchupScheduleStudentId);
	}

	@Patch(":id")
	@ApiOperation({ summary: "for admin" })
	update(
		@Param("id", ParseIntPipe) id: number,
		@Body() updateCatchupScheduleDto: UpdateCatchupScheduleDto,
	) {
		return this.catchupScheduleService.update(id, updateCatchupScheduleDto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "for admin" })
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.catchupScheduleService.remove(+id);
	}
}
