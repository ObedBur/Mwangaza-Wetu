import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto, ConfirmAdminDto } from './dto/create-admin.dto';

@Controller('api/admin')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('last-number')
  async getLastAdminNumber() {
    return this.adminsService.getLastAdminNumber();
  }

  @Get()
  async findAll() {
    return this.adminsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }

  @Post('confirm')
  async confirm(@Body() dto: ConfirmAdminDto) {
    return this.adminsService.confirm(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateAdminDto>,
  ) {
    return this.adminsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminsService.remove(id);
  }
}
