import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseIntPipe,
	Query,
	UseGuards,
} from "@nestjs/common";
import { StudentService } from "./student.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { FilterDto } from "src/common/dto/filter.dto";
import { ILike } from "typeorm";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/user/AuthGuard";
import { RolesGuard } from "../auth/roles/RoleGuard";
import { RolesDecorator } from "../auth/roles/RolesDecorator";
import { RolesEnum } from "src/common/database/Enums";
import { CurrentUser } from "src/common/decorator/current-user";
import { AuthPayload } from "src/common/type";

@Controller("student")
@UseGuards(JwtAuthGuard, RolesGuard)
@RolesDecorator(RolesEnum.SUPER_ADMIN, RolesEnum.SUPERVISOR)
@ApiTags("student")
@ApiBearerAuth()
export class StudentController {
	constructor(private readonly studentService: StudentService) {}

	@Post()
	@ApiOperation({ summary: "for admin" })
	create(@Body() dto: CreateStudentDto) {
		return this.studentService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: "for admin" })
	findAll(@Query() query: FilterDto) {
		return this.studentService.findAllWithPagination({
			skip: query.page,
			take: query.page_size,
			where: { hemisId: ILike(`%${query.search || ""}%`) },
			relations: { facultet: true },
		});
	}

	@Get("self")
	@ApiOperation({ summary: "for student" })
	@RolesDecorator(RolesEnum.STUDENT)
	findSelf(@CurrentUser() user: AuthPayload) {
		return this.studentService.findOneBy({
			where: { id: user.id, isDeleted: false },
			relations: { facultet: true },
		});
	}

	@Get(":id")
	@ApiOperation({ summary: "for admin" })
	findOne(@Param("id", ParseIntPipe) id: number) {
		return this.studentService.findOneById(id);
	}

	@Patch(":id")
	@ApiOperation({ summary: "for admin" })
	update(@Param("id", ParseIntPipe) id: number, @Body() updateStudentDto: UpdateStudentDto) {
		return this.studentService.update(id, updateStudentDto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "for admin" })
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.studentService.delete(id);
	}
}
