import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ParametresService } from './parametres.service';
import { UpdateParametreDto } from './dto/update-parametre.dto';

@Controller('api/parametres')
export class ParametresController {
  constructor(private readonly parametresService: ParametresService) {}

  @Get()
  async findAll() {
    return this.parametresService.findAll();
  }

  @Get(':nom')
  async findOne(@Param('nom') nom: string) {
    return this.parametresService.findByName(nom);
  }

  @Patch(':nom')
  async update(@Param('nom') nom: string, @Body() dto: UpdateParametreDto) {
    return this.parametresService.update(nom, dto);
  }
}
