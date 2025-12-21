import { PartialType } from "@nestjs/swagger";
import { CreateTwoMbDto } from "./create-two-mb.dto";

export class UpdateTwoMbDto extends PartialType(CreateTwoMbDto) {}
