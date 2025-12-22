import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExternalService } from './external.service';
import { CreateExternalDto } from './dto/create-external.dto';
import { UpdateExternalDto } from './dto/update-external.dto';
import { LoginTMADto } from './dto/login-TMA.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorator';

@Controller('external')
@ApiTags("External")
export class ExternalController {
  constructor(private readonly externalService: ExternalService) {}

  @Post('login-tma')
  @Public()
  create(@Body() dto: LoginTMADto) {
    return this.externalService.loginTMA(dto);
  }

  @Get('get-2mb-student/:hemisId')
  @Public()
  get2mbStudent(@Param('hemisId') hemisId: string) {
    return this.externalService.get2MBStudent(hemisId);
  }

  @Get('get-facultets')
  @Public()
  getFacultets() {
    return this.externalService.getFacultets();
  }

  @Get('get-departments')
  @Public()
  getDepartments() {
    return this.externalService.getFacultets();
  }

}
