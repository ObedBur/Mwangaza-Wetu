import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

/**
 * Controller dédié aux délégués — données sensibles (lien empreinte ↔ compte).
 * Accès réservé aux administrateurs uniquement.
 */
@ApiTags('Membres')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/delegues')
export class DeleguesController {
  constructor(private readonly membersService: MembersService) {}

  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Get('by-userid/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.membersService.findDelegueByUserId(userId);
  }
}
