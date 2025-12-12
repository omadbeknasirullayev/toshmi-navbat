import { Module } from '@nestjs/common';
import { CatchupScheduleService } from './catchup-schedule.service';
import { CatchupScheduleController } from './catchup-schedule.controller';

@Module({
  controllers: [CatchupScheduleController],
  providers: [CatchupScheduleService],
})
export class CatchupScheduleModule {}
