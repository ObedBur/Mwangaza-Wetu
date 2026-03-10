import { Module, forwardRef } from '@nestjs/common';
import { RemboursementsService } from './remboursements.service';
import { RemboursementsController } from './remboursements.controller';
import { CreditsModule } from '../credits/credits.module';
import { BalancesModule } from '../balances/balances.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => CreditsModule), BalancesModule, NotificationsModule],
  providers: [RemboursementsService],
  controllers: [RemboursementsController],
  exports: [RemboursementsService],
})
export class RemboursementsModule { }
