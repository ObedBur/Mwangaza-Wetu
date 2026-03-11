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
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { NotificationsModule } from './notifications/notifications.module';
import { AccountingModule } from './accounting/accounting.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ThrottlerModule, ThrottlerGuard, seconds } from '@nestjs/throttler';

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
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    NotificationsModule,
    AccountingModule,
    ThrottlerModule.forRoot([{
      ttl: seconds(60),
      limit: 10,
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
