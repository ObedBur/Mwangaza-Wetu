import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MemberFinanceService } from './member-finance.service';
import { BadRequestException } from '@nestjs/common';

describe('MembersService', () => {
  let service: MembersService;
  let prisma: PrismaService;

  const mockPrisma = {
    membre: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    compteEpargne: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    revenu: {
      create: jest.fn(),
    },
    revenuType: {
      findFirst: jest.fn(),
    },
    delegue: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: NotificationsService,
          useValue: {
            notifyAllAdmins: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: MemberFinanceService,
          useValue: {
            getStats: jest.fn(),
            calculateBalances: jest.fn(),
            generateMonthlyHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if account number already exists', async () => {
      const dto: any = {
        numeroCompte: 'MW-PRI-EXIST',
        nomComplet: 'Test',
        typeCompte: 'PRINCIPAL',
        statut: 'actif',
        dateAdhesion: '2024-03-12',
        telephone: '0812345678'
      };

      mockPrisma.membre.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });
});
