import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CatchupScheduleService } from './catchup-schedule.service';
import { CreateCatchupScheduleDto } from './dto/create-catchup-schedule.dto';
import { UpdateCatchupScheduleDto } from './dto/update-catchup-schedule.dto';

@Controller('catchup-schedule')
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catchupScheduleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCatchupScheduleDto: UpdateCatchupScheduleDto) {
    return this.catchupScheduleService.update(+id, updateCatchupScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catchupScheduleService.remove(+id);
  }
}
