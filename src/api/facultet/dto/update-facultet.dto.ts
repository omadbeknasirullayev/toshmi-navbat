import { PartialType } from "@nestjs/swagger";
import { CreateFacultetDto } from "./create-facultet.dto";

export class UpdateFacultetDto extends PartialType(CreateFacultetDto) {}
