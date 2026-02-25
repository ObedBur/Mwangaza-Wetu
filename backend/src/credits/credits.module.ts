import { Module, forwardRef } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreditsController } from './credits.controller';
import { RemboursementsModule } from '../remboursements/remboursements.module';

@Module({
  imports: [forwardRef(() => RemboursementsModule)],
  providers: [CreditsService],
  controllers: [CreditsController],
  exports: [CreditsService],
})
export class CreditsModule {}
