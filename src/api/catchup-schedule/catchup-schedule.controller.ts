import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from "@nestjs/common";
import { CatchupScheduleService } from "./catchup-schedule.service";
import { CreateCatchupScheduleDto } from "./dto/create-catchup-schedule.dto";
import { UpdateCatchupScheduleDto } from "./dto/update-catchup-schedule.dto";

@Controller("catchup-schedule")
export class CatchupScheduleController {
	constructor(private readonly catchupScheduleService: CatchupScheduleService) {}

	@Post()
	create(@Body() createCatchupScheduleDto: CreateCatchupScheduleDto) {
		return this.catchupScheduleService.create(createCatchupScheduleDto);
	}

	@Get()
	findAll() {
		return this.catchupScheduleService.findAll();
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
