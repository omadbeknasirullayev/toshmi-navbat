import { HttpException, Injectable } from "@nestjs/common";
import { CreateCatchupScheduleDto } from "./dto/create-catchup-schedule.dto";
import { UpdateCatchupScheduleDto } from "./dto/update-catchup-schedule.dto";
import { BaseService } from "src/infrastructure/lib/baseService";
import { CatchupSchedule } from "src/common/database/enity/catchup-schedule.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { In, MoreThanOrEqual, Not, Repository } from "typeorm";
import { Student } from "src/common/database/enity";
import { CatchupScheduleStudent } from "src/common/database/enity/catchup-schedule-student.entity";
import { CatchupScheduleStudentStatus } from "src/common/database/Enums";
import { appConfig } from "src/config/app.config";
import * as QRCode from "qrcode";
import { errorPrompt } from "src/infrastructure/lib/prompts/errorPrompt";
import { Facultet } from "src/common/database/enity/facultet.entity";
import { StudentLowPerformance } from "src/common/database/enity/student-low-performance.entity";

@Injectable()
export class CatchupScheduleService extends BaseService<
	CreateCatchupScheduleDto,
	UpdateCatchupScheduleDto,
	CatchupSchedule
> {
	constructor(
		@InjectRepository(CatchupSchedule)
		private readonly repo: Repository<CatchupSchedule>,

		@InjectRepository(CatchupScheduleStudent)
		private readonly catchupScheduleStudentRepo: Repository<CatchupScheduleStudent>,

		@InjectRepository(Student)
		private readonly studentRepo: Repository<Student>,

		@InjectRepository(Facultet)
		private readonly facultetRepo: Repository<Facultet>,

		@InjectRepository(StudentLowPerformance)
		private readonly studentLowPerformanceRepo: Repository<StudentLowPerformance>,
	) {
		super(repo, "Catchup Schedule");
	}

	/**
	 * Vaqt oralig'ini time slot'larga bo'ladi
	 * @param startTime - Boshlanish vaqti (HH:mm format)
	 * @param endTime - Tugash vaqti (HH:mm format)
	 * @param intervalMinutes - Interval minutlarda (default: config dan)
	 * @returns
	 */
	private generateTimeSlots(
		startTime: string,
		endTime: string,
		intervalMinutes: number = appConfig.CATCHUP_SCHEDULE_INTERVAL,
	): string[] {
		const timeSlots: string[] = [];

		// HH:mm formatni Date obyektiga o'girish
		const parseTime = (time: string): Date => {
			const [hours, minutes] = time.split(":").map(Number);
			const date = new Date();
			date.setHours(hours, minutes, 0, 0);
			return date;
		};

		// Date obyektini HH:mm formatga qaytarish
		const formatTime = (date: Date): string => {
			const hours = date.getHours().toString().padStart(2, "0");
			const minutes = date.getMinutes().toString().padStart(2, "0");
			return `${hours}:${minutes}`;
		};

		const start = parseTime(startTime);
		const end = parseTime(endTime);

		if (start >= end) {
			throw new HttpException(errorPrompt.startTimeBeforeEndTime, 400);
		}

		let currentTime = new Date(start);

		while (currentTime < end) {
			const slotStart = formatTime(currentTime);

			// Keyingi slot uchun vaqtni hisoblash
			currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);

			// Agar keyingi slot tugash vaqtidan oshib ketsa, tugash vaqtini olish
			const slotEnd = currentTime <= end ? formatTime(currentTime) : formatTime(end);

			timeSlots.push(`${slotStart}-${slotEnd}`);

			// Agar aniq tugash vaqtiga yetgan bo'lsak, to'xtatish
			if (currentTime >= end) {
				break;
			}
		}

		return timeSlots;
	}

	async create(dto: CreateCatchupScheduleDto) {
		let hemisFacultiesToCreate: number[] = [];

		// Agar hemisFacultyIds berilgan bo'lsa, ularni tekshirish
		if (dto.hemisFacultyIds && dto.hemisFacultyIds.length > 0) {
			const faculties = await this.facultetRepo.find({
				where: { journalFacultyId: In(dto.hemisFacultyIds), isDeleted: false },
				relations: { building: true },
			});

			if (faculties.length !== dto.hemisFacultyIds.length) {
				throw new HttpException(errorPrompt.facultyNotFound, 404);
			}

			// Barcha fakultetlar shu binoga tegishli ekanligini tekshirish
			const invalidFaculties = faculties.filter((f) => f.buildingId !== dto.buildingId);
			if (invalidFaculties.length > 0) {
				throw new HttpException(errorPrompt.facultyNotBelongToBuilding, 400);
			}

			hemisFacultiesToCreate = dto.hemisFacultyIds;
		} else {
			// Agar hemisFacultyIds berilmagan bo'lsa, binoning barcha fakultetlarini olish
			const allFaculties = await this.facultetRepo.find({
				where: { buildingId: dto.buildingId, isDeleted: false },
			});

			if (allFaculties.length === 0) {
				throw new HttpException(
					{
						status: "BAD_REQUEST",
						message: {
							uz: "Bu binoda hech qanday fakultet topilmadi!",
							ru: "В этом здании не найдено ни одного факультета!",
						},
					},
					400,
				);
			}

			// Faqat hemisFacultyId bo'lgan fakultetlarni olish
			hemisFacultiesToCreate = allFaculties
				.filter((f) => f.journalFacultyId !== null && f.journalFacultyId !== undefined)
				.map((f) => f.journalFacultyId!);

			// Agar hech qanday fakultetda hemisFacultyId bo'lmasa
			if (hemisFacultiesToCreate.length === 0) {
				throw new HttpException(
					{
						status: "BAD_REQUEST",
						message: {
							uz: "Bu binodagi fakultetlar uchun HEMIS ID'lari belgilanmagan!",
							ru: "HEMIS ID не установлены для факультетов этого здания!",
						},
					},
					400,
				);
			}
		}

		// Bir xil bino va sana uchun barcha jadvallarni olish
		const existingSchedules = await this.repo.find({
			where: {
				buildingId: dto.buildingId,
				date: dto.date,
				isDeleted: false,
			},
		});

		// Agar mavjud jadvallar bo'lsa, vaqt kesishishini tekshirish
		if (existingSchedules.length > 0) {
			const newStartTime = this.parseTimeToMinutes(dto.startTime);
			const newEndTime = this.parseTimeToMinutes(dto.endTime);

			for (const schedule of existingSchedules) {
				const existingStartTime = this.parseTimeToMinutes(schedule.startTime);
				const existingEndTime = this.parseTimeToMinutes(schedule.endTime);

				// Vaqt kesishishini tekshirish
				const hasOverlap =
					(newStartTime >= existingStartTime && newStartTime < existingEndTime) || // Yangi boshlanish mavjud oraliqda
					(newEndTime > existingStartTime && newEndTime <= existingEndTime) || // Yangi tugash mavjud oraliqda
					(newStartTime <= existingStartTime && newEndTime >= existingEndTime); // Yangi oraliq mavjud oraliqni qamrab oladi

				if (hasOverlap) {
					throw new HttpException(errorPrompt.catchupScheduleTimeOverlap, 400);
				}
			}
		}

		// Time slot'larni generatsiya qilish
		const timeSlots = this.generateTimeSlots(dto.startTime, dto.endTime);

		if (timeSlots.length === 0) {
			throw new HttpException(errorPrompt.noTimeSlotsGenerated, 400);
		}

		// Har bir fakultet uchun jadval yaratish
		const createdSchedules: CatchupSchedule[] = [];

		for (const hemisFacultyId of hemisFacultiesToCreate) {
			const catchupSchedule = this.repo.create({
				...dto,
				hemisFacultyId,
				timeSlots,
			});

			const saved = await this.repo.save(catchupSchedule);
			createdSchedules.push(saved);
		}

		// Agar bitta otrabotka yaratilgan bo'lsa, to'g'ridan-to'g'ri qaytarish
		if (createdSchedules.length === 1) {
			return createdSchedules[0];
		}

		// Agar ko'p otrabotka yaratilgan bo'lsa, summary response qaytarish
		// Circular reference muammosini oldini olish uchun
		const response = {
			success: true,
			message: `${createdSchedules.length} ta fakultet uchun otrabotka muvaffaqiyatli yaratildi`,
			totalCreated: createdSchedules.length,
			schedules: createdSchedules.map(s => ({
				id: s.id,
				name: s.name,
				hemisFacultyId: s.hemisFacultyId,
				buildingId: s.buildingId,
				course: s.course,
				date: s.date,
				startTime: s.startTime,
				endTime: s.endTime,
				timeSlots: s.timeSlots,
			})),
		};

		// BaseService compatibility uchun birinchi schedule'ni qaytarish kerak
		// lekin biz response obyektini qaytaramiz
		return response as any;
	}

	/**
	 * Vaqtni minutlarga o'girish (HH:mm -> total minutes)
	 * @param time - Vaqt (HH:mm format)
	 * @returns
	 */
	private parseTimeToMinutes(time: string): number {
		const [hours, minutes] = time.split(":").map(Number);
		return hours * 60 + minutes;
	}

	async update(id: number, dto: UpdateCatchupScheduleDto) {
		await this.findOneBy({ where: { id, isDeleted: false, isActive: true } });

		if (dto.buildingId && dto.date) {
			const existing = await this.repo.findOne({
				where: { id: Not(id), buildingId: dto.buildingId, date: dto.date },
			});
			if (existing) {
				throw new HttpException(errorPrompt.catchupScheduleAlreadyExists, 400);
			}
		}

		await this.repo.update(id, dto);
		return await this.findOneBy({ where: { id, isDeleted: false, isActive: true } });
	}

	async findByStudentId(studentId: number) {
		const student = await this.studentRepo.findOne({
			where: { id: studentId },
			relations: { facultet: true },
		});

		console.log("Student faculty:", student?.facultet);
		

		if (!student) {
			throw new HttpException(errorPrompt.studentNotFound, 404);
		}

		// Studentning 2mb yozuvlarini tekshirish
		const has2mbRecords = await this.studentLowPerformanceRepo.exists({
			where: { studentId },
		});

		if (!has2mbRecords) {
			throw new HttpException(errorPrompt.studentHasNo2mbRecords, 400);
		}

		// Bugungi sanani olish (faqat sana, vaqtsiz)
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Studentga tegishli otrabotkalarni topish:
		// 1. Student kursi mos kelishi kerak
		// 2. Student fakulteti buildingida bo'lishi kerak
		// 3. hemisFacultyId student department'iga teng YOKI null bo'lishi kerak (barcha fakultetlar uchun)
		const schedules = await this.repo
			.createQueryBuilder("schedule")
			.where("schedule.course = :course", { course: student.course })
			.andWhere("schedule.date >= :today", { today })
			.andWhere("schedule.buildingId = :buildingId", {
				buildingId: student.facultet.buildingId,
			})
			.andWhere("(schedule.journalFacultyId = :journalFacultyId OR schedule.journalFacultyId IS NULL)", {
				journalFacultyId: student.facultet.journalFacultyId,
			})
			.andWhere("schedule.isDeleted = :isDeleted", { isDeleted: false })
			.andWhere("schedule.isActive = :isActive", { isActive: true })
			.leftJoinAndSelect("schedule.building", "building")
			.leftJoinAndSelect("schedule.facultet", "facultet")
			.getMany();

		// Hozirgi vaqtni olish
		const now = new Date();
		const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
		const currentMinutes = this.parseTimeToMinutes(currentTime);

		// Jadvallarni filter qilish: bugun bo'lsa va endTime o'tgan bo'lsa ko'rsatmaslik
		const filteredSchedules = schedules.filter((schedule) => {
			const scheduleDate = new Date(schedule.date);
			scheduleDate.setHours(0, 0, 0, 0);

			const isToday = scheduleDate.getTime() === today.getTime();

			// Agar bugun bo'lsa, endTime o'tmaganligini tekshirish
			if (isToday) {
				const endMinutes = this.parseTimeToMinutes(schedule.endTime);
				// endTime o'tib ketgan bo'lsa false qaytarish (ko'rsatmaslik)
				if (currentMinutes >= endMinutes) {
					return false;
				}
			}

			// Boshqa hollarda ko'rsatish
			return true;
		});

		// Har bir schedule uchun time slot statistikasini qo'shish
		const schedulesWithStats = await Promise.all(
			filteredSchedules.map(async (schedule) => {
				const timeSlotStats = await this.getTimeSlotStatistics(schedule.id);
				return {
					...schedule,
					timeSlotStatistics: timeSlotStats,
				};
			}),
		);

		return schedulesWithStats;
	}

	/**
	 * Har bir time slot uchun statistika olish
	 * @param catchupScheduleId
	 * @returns
	 */
	async getTimeSlotStatistics(catchupScheduleId: number) {
		const catchup = await this.repo.findOne({
			where: { id: catchupScheduleId, isDeleted: false },
			relations: { building: true },
		});

		if (!catchup || !catchup.building) {
			throw new HttpException(errorPrompt.catchupScheduleNotFound, 404);
		}

		// Har bir time slot uchun registratsiya sonini hisoblash
		const statistics = await Promise.all(
			catchup.timeSlots.map(async (timeSlot) => {
				const registeredCount = await this.catchupScheduleStudentRepo.count({
					where: {
						catchupScheduleId,
						selectedTimeSlot: timeSlot,
					},
				});

				const availableSeats = catchup.building!.computerCount - registeredCount;

				return {
					timeSlot,
					registeredCount,
					totalSeats: catchup.building!.computerCount,
					availableSeats,
					isFullyBooked: availableSeats <= 0,
				};
			}),
		);

		return statistics;
	}

	async remove(id: number) {
		await this.repo.delete(id);
		return { message: "Catchup schedule deleted successfully" };
	}

	async writeQueueStudent(
		studentId: number,
		catchupScheduleId: number,
		selectedTimeSlot: string,
	) {
		const student = await this.studentRepo.findOne({
			where: { id: studentId },
			relations: { facultet: true },
		});

		if (!student) {
			throw new HttpException(errorPrompt.studentNotFound, 404);
		}

		// Studentning 2mb yozuvlarini tekshirish
		const has2mbRecords = await this.studentLowPerformanceRepo.exists({
			where: { studentId },
		});

		if (!has2mbRecords) {
			throw new HttpException(errorPrompt.studentHasNo2mbRecords, 400);
		}

		const catchup = await this.findOneBy({
			where: {
				id: catchupScheduleId,
				buildingId: student?.facultet?.buildingId,
				isDeleted: false,
				isActive: true,
				date: MoreThanOrEqual(new Date()),
			},
			relations: { building: true, facultet: true },
		});

		if (!catchup || !catchup.building) {
			throw new HttpException(errorPrompt.catchupScheduleNotFound, 404);
		}

		// Student fakulteti catchup schedule fakultetiga mos kelishini tekshirish
		// hemisFacultyId null bo'lsa, barcha fakultetlar uchun, aks holda student department mos kelishi kerak
		if (catchup.hemisFacultyId !== null && catchup.hemisFacultyId !== student.department) {
			throw new HttpException(errorPrompt.studentFacultyNotMatchSchedule, 400);
		}

		// Tanlangan vaqt slot mavjudligini tekshirish
		if (!catchup.timeSlots || !catchup.timeSlots.includes(selectedTimeSlot)) {
			throw new HttpException(errorPrompt.timeSlotNotAvailable, 400);
		}

		// Student allaqachon bu catchup schedule'ga yozilganligini tekshirish
		const existingStudent = await this.catchupScheduleStudentRepo.findOne({
			where: {
				catchupScheduleId,
				studentId: studentId,
				status: In([
					CatchupScheduleStudentStatus.PENDING,
					CatchupScheduleStudentStatus.ARRIVED,
				]),
			},
		});

		if (existingStudent) {
			throw new HttpException(errorPrompt.studentAlreadyRegistered, 400);
		}

		// Tanlangan vaqt slot uchun joy borligini tekshirish
		const slotRegistrationCount = await this.catchupScheduleStudentRepo.count({
			where: {
				catchupScheduleId,
				selectedTimeSlot,
				status: In([
					CatchupScheduleStudentStatus.PENDING,
					CatchupScheduleStudentStatus.ARRIVED,
				]),
			},
		});

		// MUHIM: Har bir time slot uchun computerCount dan oshmasligi kerak
		if (slotRegistrationCount >= catchup.building.computerCount) {
			throw new HttpException(errorPrompt.timeSlotFullyBooked, 400);
		}

		// Navbat raqamini hisoblash (shu time slot uchun keyingi raqam)
		const queueNumber = slotRegistrationCount + 1;

		// QR code uchun unique data yaratish
		const qrData = JSON.stringify({
			catchupScheduleStudentId: null, // ID hali mavjud emas, keyinroq update qilamiz
			studentId,
			catchupScheduleId,
			selectedTimeSlot,
			queueNumber,
			timestamp: new Date().toISOString(),
		});

		// QR code generatsiya qilish (base64 format)
		const qrCode = await QRCode.toDataURL(qrData);

		catchup.registrationCount += 1;

		const catchupScheduleStudent = await this.catchupScheduleStudentRepo.save(
			this.catchupScheduleStudentRepo.create({
				studentId,
				catchupScheduleId,
				selectedTimeSlot,
				queueNumber,
				qrCode,
			}),
		);

		// QR code'ni ID bilan yangilash
		const updatedQrData = JSON.stringify({
			catchupScheduleStudentId: catchupScheduleStudent.id,
			studentId,
			catchupScheduleId,
			selectedTimeSlot,
			queueNumber,
			timestamp: new Date().toISOString(),
		});

		const updatedQrCode = await QRCode.toDataURL(updatedQrData);
		catchupScheduleStudent.qrCode = updatedQrCode;
		await this.catchupScheduleStudentRepo.save(catchupScheduleStudent);

		await this.repo.save(catchup);

		return catchupScheduleStudent;
	}

	async getQueueStudent(studentId: number) {
		return await this.catchupScheduleStudentRepo.find({
			where: {
				studentId,
				status: "pending",
			},
			relations: { student: { facultet: true }, catchupSchedule: true },
			order: { selectedTimeSlot: "ASC" },
		});
	}

	async pendingStudents(catchupScheduleId: number) {
		const catchup = await this.repo.find({
			where: {
				id: catchupScheduleId,
				isActive: true,
				isDeleted: false,
				students: { status: CatchupScheduleStudentStatus.PENDING },
			},
			relations: { building: true, students: { student: true } },
		});

		return catchup;
	}

	async toArrivedStudent(catchupScheduleStudentId: number) {
		const catchupScheduleStudent = await this.catchupScheduleStudentRepo.findOne({
			where: { id: catchupScheduleStudentId },
		});

		if (!catchupScheduleStudent) {
			throw new HttpException(errorPrompt.catchupScheduleStudentNotFound, 404);
		}

		catchupScheduleStudent.status = CatchupScheduleStudentStatus.ARRIVED;
		await this.catchupScheduleStudentRepo.save(catchupScheduleStudent);

		return catchupScheduleStudent;
	}

	/**
	 * QR code scan qilib student arrived statusga o'tkazish
	 * @param qrData - QR code ichidagi JSON data
	 */
	async scanQrCode(qrData: string) {
		let parsedData: any;

		try {
			parsedData = JSON.parse(qrData);
		} catch (error) {
			throw new HttpException(errorPrompt.invalidQrCodeFormat, 400);
		}

		const { catchupScheduleStudentId } = parsedData;

		if (!catchupScheduleStudentId) {
			throw new HttpException(errorPrompt.invalidQrCodeData, 400);
		}

		const catchupScheduleStudent = await this.catchupScheduleStudentRepo.findOne({
			where: { id: catchupScheduleStudentId },
			relations: { student: true, catchupSchedule: { building: true } },
		});

		if (!catchupScheduleStudent) {
			throw new HttpException(errorPrompt.studentRegistrationNotFound, 404);
		}

		// Agar allaqachon arrived bo'lsa
		if (catchupScheduleStudent.status === CatchupScheduleStudentStatus.ARRIVED) {
			throw new HttpException(errorPrompt.studentAlreadyArrived, 400);
		}

		const catchup = catchupScheduleStudent.catchupSchedule;

		if (!catchup || !catchup.building) {
			throw new HttpException(errorPrompt.catchupScheduleNotFound, 404);
		}

		// Hozirgi vaqtni olish
		const now = new Date();
		const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
		const currentMinutes = this.parseTimeToMinutes(currentTime);

		// Student kelgan vaqt qaysi slotga to'g'ri kelishini aniqlash
		let currentSlot: string | null = null;

		for (const slot of catchup.timeSlots) {
			const [slotStart, slotEnd] = slot.split("-");
			const slotStartMinutes = this.parseTimeToMinutes(slotStart);
			const slotEndMinutes = this.parseTimeToMinutes(slotEnd);

			// Agar hozirgi vaqt shu slot ichida bo'lsa
			if (currentMinutes >= slotStartMinutes && currentMinutes < slotEndMinutes) {
				currentSlot = slot;
				break;
			}
		}

		// Agar hozirgi vaqt hech bir slotga to'g'ri kelmasa
		if (!currentSlot) {
			throw new HttpException(errorPrompt.cannotCheckInOutsideTimeSlots, 400);
		}

		// Agar student o'zi yozilgan slotda kelgan bo'lsa - muammosiz kiradi
		if (currentSlot === catchupScheduleStudent.selectedTimeSlot) {
			catchupScheduleStudent.status = CatchupScheduleStudentStatus.ARRIVED;
			catchup.attendeesCount += 1;

			await this.catchupScheduleStudentRepo.save(catchupScheduleStudent);
			await this.repo.save(catchup);

			return {
				message: "Student successfully marked as arrived",
				student: catchupScheduleStudent.student,
				queueNumber: catchupScheduleStudent.queueNumber,
				selectedTimeSlot: catchupScheduleStudent.selectedTimeSlot,
				actualArrivalSlot: currentSlot,
				note: "Arrived on scheduled time slot",
			};
		}

		// Agar boshqa slotda kelgan bo'lsa - joy borligini tekshirish
		const currentSlotRegistrations = await this.catchupScheduleStudentRepo.count({
			where: {
				catchupScheduleId: catchup.id,
				selectedTimeSlot: currentSlot,
				status: In([
					CatchupScheduleStudentStatus.PENDING,
					CatchupScheduleStudentStatus.ARRIVED,
				]),
			},
		});

		// Agar joriy slotda joy bo'lmasa
		if (currentSlotRegistrations >= catchup.building.computerCount) {
			throw new HttpException(errorPrompt.cannotCheckInSlotFullyBooked, 400);
		}

		// Agar joy bo'lsa - slotni o'zgartirish va arrived qilish
		const oldSlot = catchupScheduleStudent.selectedTimeSlot;
		catchupScheduleStudent.selectedTimeSlot = currentSlot;
		catchupScheduleStudent.status = CatchupScheduleStudentStatus.ARRIVED;

		// Yangi slotdagi navbat raqamini hisoblash
		const newQueueNumber = currentSlotRegistrations + 1;
		catchupScheduleStudent.queueNumber = newQueueNumber;

		catchup.attendeesCount += 1;

		await this.catchupScheduleStudentRepo.save(catchupScheduleStudent);
		await this.repo.save(catchup);

		return {
			message: "Student successfully marked as arrived (time slot adjusted)",
			student: catchupScheduleStudent.student,
			queueNumber: newQueueNumber,
			selectedTimeSlot: currentSlot,
			originalTimeSlot: oldSlot,
			actualArrivalSlot: currentSlot,
			note: `Student was scheduled for ${oldSlot} but arrived during ${currentSlot}. Time slot was automatically adjusted.`,
		};
	}
}
