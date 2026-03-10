import { Module } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { SavingsController } from './savings.controller';
import { ParametresModule } from '../parametres/parametres.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ParametresModule, NotificationsModule, PrismaModule],
  providers: [SavingsService],
  controllers: [SavingsController],
})
export class SavingsModule {}
