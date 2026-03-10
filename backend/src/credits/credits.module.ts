import { Module } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreditsController } from './credits.controller';
import { BalancesModule } from '../balances/balances.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [BalancesModule, NotificationsModule, PrismaModule],
  controllers: [CreditsController],
  providers: [CreditsService],
})
export class CreditsModule {}
