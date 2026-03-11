import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { MemberFinanceService } from './member-finance.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [MembersController],
  providers: [MembersService, MemberFinanceService],
  exports: [MembersService, MemberFinanceService],
})
export class MembersModule {}
