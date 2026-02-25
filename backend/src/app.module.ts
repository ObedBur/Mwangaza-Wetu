import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MembersModule } from './members/members.module';
import { SavingsModule } from './savings/savings.module';
import { CreditsModule } from './credits/credits.module';
import { AuthModule } from './auth/auth.module';
import { BalancesModule } from './balances/balances.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { ParametresModule } from './parametres/parametres.module';
import { RemboursementsModule } from './remboursements/remboursements.module';
import { AdminsModule } from './admins/admins.module';
import { ReportsModule } from './reports/reports.module';
import { ZktecoModule } from './zkteco/zkteco.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MembersModule,
    SavingsModule,
    CreditsModule,
    AuthModule,
    BalancesModule,
    WithdrawalsModule,
    ParametresModule,
    RemboursementsModule,
    AdminsModule,
    ReportsModule,
    ZktecoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
