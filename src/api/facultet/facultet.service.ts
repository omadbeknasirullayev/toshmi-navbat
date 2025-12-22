import { Injectable } from "@nestjs/common";
import { CreateFacultetDto } from "./dto/create-facultet.dto";
import { UpdateFacultetDto } from "./dto/update-facultet.dto";
import { BaseService } from "src/infrastructure/lib/baseService";
import { Facultet } from "src/common/database/enity/facultet.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ExternalService } from "../external/external.service";

@Injectable()
export class FacultetService extends BaseService<CreateFacultetDto, UpdateFacultetDto, Facultet> {
	constructor(
		@InjectRepository(Facultet) private readonly repo: Repository<Facultet>,
		private readonly externalService: ExternalService,
	) {
		super(repo, "Facultets");
	}

	async syncFacultiesFromExternal() {
		// External API'dan fakultetlarni olish
		const externalData = await this.externalService.getFacultets();

		if (!externalData || !externalData.results) {
			return {
				success: false,
				message: "External API'dan ma'lumot olinmadi",
			};
		}

		const faculties = externalData.results;
		let createdCount = 0;
		let updatedCount = 0;
		const errors: any[] = [];

		for (const externalFaculty of faculties) {
			try {
				// Mavjud fakultetni tekshirish (hemisFacultyId bo'yicha)
				const existingFaculty = await this.repo.findOne({
					where: { journalFacultyId: externalFaculty.id },
				});

				if (existingFaculty) {
					// Agar mavjud bo'lsa, yangilash
					existingFaculty.name = externalFaculty.name;
					await this.repo.save(existingFaculty);
					updatedCount++;
				} else {
					// Agar mavjud bo'lmasa, yangi yaratish
					const newFaculty = this.repo.create({
						name: externalFaculty.name,
						journalFacultyId: externalFaculty.id,
						buildingId: null as any, // Keyinchalik admin tomonidan belgilanadi
					});
					await this.repo.save(newFaculty);
					createdCount++;
				}
			} catch (error: any) {
				errors.push({
					journalFacultyId: externalFaculty.id,
					name: externalFaculty.name,
					error: error?.message || 'Unknown error',
				});
			}
		}

		return {
			success: true,
			message: "Fakultetlar muvaffaqiyatli sinxronlashtirildi",
			total: faculties.length,
			created: createdCount,
			updated: updatedCount,
			errors: errors.length > 0 ? errors : undefined,
		};
	}
}
