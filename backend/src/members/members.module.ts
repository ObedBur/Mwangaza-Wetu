import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { DeleguesController } from './delegues.controller';

@Module({
  providers: [MembersService],
  controllers: [MembersController, DeleguesController],
})
export class MembersModule {}
