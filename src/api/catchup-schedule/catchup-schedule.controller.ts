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
import { ScanQrDto } from "./dto/scan-qr.dto";
import { HikvisionFaceEventDto } from "./dto/hikvision-face-event.dto";
import { MarkArrivedDto } from "./dto/mark-arrived.dto";

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
		description:
			"Studentlar catchup schedulega yani otrabotka jadvaliga navbat olishi uchun. selectedTimeSlot tanlanadi va bir marta tanlab bo'lgach boshqa tanlay olmaydi",
	})
	writeQueueStudent(@Body() body: WriteQueueDto, @CurrentUser() user: AuthPayload) {
		return this.catchupScheduleService.writeQueueStudent(
			user.id,
			body.catchupScheduleId,
			body.selectedTimeSlot,
		);
	}

	@Get()
	@ApiOperation({
		summary: "for admin",
		description: "Adminlar catchup schedule ya'ni otrabotka jadvallarini ko'rish uchun",
	})
	findAll() {
		return this.catchupScheduleService.findAll({
			where: { isDeleted: false },
			relations: { building: true, facultets: { facultet: true } },
		});
	}

	@Get("by-student")
	@ApiOperation({
		summary: "for student",
		description:
			"Studentlar catchup schedulega yani otrabotka jadvallarini ko'rish uchun. Har bir vaqt uchun nechta student yozilganini ham ko'rsatadi",
	})
	@RolesDecorator(RolesEnum.STUDENT)
	findByStudent(@CurrentUser() user: AuthPayload) {
		return this.catchupScheduleService.findByStudentId(user.id);
	}

	@Get("time-slot-statistics/:catchupScheduleId")
	@ApiOperation({
		summary: "for all",
		description:
			"Har bir time slot uchun qancha student yozilganini ko'rish. Qaysi vaqtda bo'sh joy borligini aniqlash uchun",
	})
	@Public()
	getTimeSlotStatistics(@Param("catchupScheduleId", ParseIntPipe) catchupScheduleId: number) {
		return this.catchupScheduleService.getTimeSlotStatistics(catchupScheduleId);
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
	async findOne(@Param("id", ParseIntPipe) id: number) {
		const [catchupSchedule, timeSlotStatistics] = await Promise.all([
			this.catchupScheduleService.findOneBy({
				where: { id, isDeleted: false, isActive: true },
			}),
			this.catchupScheduleService.getTimeSlotStatistics(id),
		]);

		return { ...catchupSchedule, timeSlotStatistics };
	}

	@Patch("toArrived-student/:catchupScheduleStudentId")
	@ApiOperation({
		summary: "for admin",
		description:
			"Admin tomonidan qo'lda studentni keldi statusiga o'tkazish. catchupScheduleStudentId (student navbat ID) ni yuborish kerak. Attendees count avtomatik oshiriladi.",
	})
	toArrivedStudent(
		@Param("catchupScheduleStudentId", ParseIntPipe) catchupScheduleStudentId: number,
	) {
		return this.catchupScheduleService.toArrivedStudent(catchupScheduleStudentId);
	}

	@Post("mark-arrived")
	@ApiOperation({
		summary: "for admin",
		description:
			"Student hemisId va catchupSchedule ID orqali keldi qilish. Admin va studentlar uchun qulay - catchupScheduleStudentId bilish shart emas. Faqat student hemisId va jadval ID yetarli.",
	})
	markArrived(@Body() dto: MarkArrivedDto) {
		return this.catchupScheduleService.markStudentArrived(dto);
	}

	@Post("scan-qr")
	@ApiOperation({
		summary: "for admin/scanner",
		description:
			"QR code scan qilib student keldini belgilash. QR code ichidagi JSON datani yuborish kerak",
	})
	scanQrCode(@Body() body: ScanQrDto) {
		return this.catchupScheduleService.scanQrCode(body.qrData);
	}

	@Post("hikvision-face-event")
	@Public()
	@ApiOperation({
		summary: "for Hikvision device",
		description:
			"Hikvision face ID devicedan kelgan eventni qabul qilish. Student avtomatik keldi statusiga o'tkaziladi.",
	})
	handleHikvisionEvent(@Body() body: HikvisionFaceEventDto) {
		return this.catchupScheduleService.handleHikvisionFaceEvent(body);
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
