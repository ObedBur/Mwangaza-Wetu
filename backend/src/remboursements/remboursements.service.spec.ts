import { Test, TestingModule } from '@nestjs/testing';
import { RemboursementsService } from './remboursements.service';
import { PrismaService } from '../prisma/prisma.service';
import { BalancesService } from '../balances/balances.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('RemboursementsService', () => {
  let service: RemboursementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemboursementsService,
        {
          provide: PrismaService,
          useValue: {
            remboursement: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() },
            $transaction: jest.fn(),
          },
        },
        {
          provide: BalancesService,
          useValue: {
            rafraichirGarantie: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            notifyAllAdmins: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RemboursementsService>(RemboursementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
