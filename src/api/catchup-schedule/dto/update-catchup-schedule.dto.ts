import { PartialType } from '@nestjs/swagger';
import { CreateCatchupScheduleDto } from './create-catchup-schedule.dto';

export class UpdateCatchupScheduleDto extends PartialType(CreateCatchupScheduleDto) {}
