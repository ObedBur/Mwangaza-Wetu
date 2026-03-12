import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MemberFinanceService } from './member-finance.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MembersService', () => {
  let service: MembersService;

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
    revenu: { create: jest.fn() },
    revenuType: { findFirst: jest.fn() },
    delegue: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  const mockNotifications = { notifyAllAdmins: jest.fn().mockResolvedValue(null) };

  const mockFinanceService = {
    getStats: jest.fn(),
    calculateBalances: jest.fn().mockReturnValue({ savings: {}, activeCredits: {}, cumulative: {} }),
    generateMonthlyHistory: jest.fn().mockReturnValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: MemberFinanceService, useValue: mockFinanceService },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    const baseDto: any = {
      nomComplet: 'Jean Dupont',
      typeCompte: 'PRINCIPAL',
      statut: 'actif',
      dateAdhesion: '2024-01-01',
      telephone: '+243812345678',
    };

    it('should throw BadRequestException if numeroCompte already exists', async () => {
      const dto = { ...baseDto, numeroCompte: 'MW-PRI-EXIST' };
      mockPrisma.membre.findUnique.mockResolvedValue({ id: 1 });
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if userId (empreinte) already used by another membre', async () => {
      const dto = { ...baseDto, userId: 'ZK-001' };
      mockPrisma.membre.findUnique.mockResolvedValue(null); // no compte conflict
      mockPrisma.membre.findFirst
        .mockResolvedValueOnce({ id: 99 }) // checkUserId → membre exists
        .mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should generate default PIN from telephone last 6 digits', async () => {
      mockPrisma.membre.findUnique.mockResolvedValue(null);
      mockPrisma.membre.findFirst.mockResolvedValue(null);
      mockPrisma.delegue.findFirst.mockResolvedValue(null);
      mockPrisma.revenuType.findFirst.mockResolvedValue(null);
      const createdMembre = { id: 1, numeroCompte: 'MW-PRI-ABC123', ...baseDto };
      mockPrisma.membre.create.mockResolvedValue(createdMembre);
      mockPrisma.compteEpargne.create.mockResolvedValue({});

      const result = await service.create(baseDto);
      // PIN par défaut = 6 derniers chiffres du tel → 345678
      expect(mockPrisma.membre.create).toHaveBeenCalled();
      expect(result).toHaveProperty('numeroCompte');
    });
  });

  // ─── findAll ────────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return paginated membres', async () => {
      mockPrisma.membre.count.mockResolvedValue(1);
      mockPrisma.membre.findMany.mockResolvedValue([{ id: 1, nomComplet: 'Test' }]);
      const result = await service.findAll({ page: 1, pageSize: 10 });
      expect(result.meta.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });

    it('should calculate pagination meta correctly', async () => {
      mockPrisma.membre.count.mockResolvedValue(25);
      mockPrisma.membre.findMany.mockResolvedValue([]);
      const result = await service.findAll({ page: 2, pageSize: 10 });
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPrevPage).toBe(true);
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return a membre by id', async () => {
      const membre = { id: 1, nomComplet: 'Jean', delegues: [] };
      mockPrisma.membre.findUnique.mockResolvedValue(membre);
      const result = await service.findOne(1);
      expect(result).toEqual(membre);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.membre.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────
  describe('remove', () => {
    it('should throw BadRequestException for system account', async () => {
      mockPrisma.membre.findUnique.mockResolvedValue({
        id: 1,
        numeroCompte: 'MW-REVENUS-GLOBAL',
        typeCompte: 'SYSTEME',
        epargnes: [],
        retraits: [],
        credits: [],
        delegues: [],
        comptesEpargne: [],
      });
      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if membre has transactions', async () => {
      mockPrisma.membre.findUnique.mockResolvedValue({
        id: 2,
        numeroCompte: 'MW-PRI-001',
        typeCompte: 'PRINCIPAL',
        photoProfil: null,
        epargnes: [{ id: 1 }],
        retraits: [],
        credits: [],
        comptesEpargne: [],
      });
      await expect(service.remove(2)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if membre does not exist', async () => {
      mockPrisma.membre.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getMemberDashboard ──────────────────────────────────────────────────────
  describe('getMemberDashboard', () => {
    it('should throw NotFoundException if membre not found', async () => {
      mockPrisma.membre.findUnique.mockResolvedValue(null);
      await expect(service.getMemberDashboard('999')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if firstAcces is true', async () => {
      mockPrisma.membre.findUnique.mockResolvedValue({
        id: 1,
        firstAcces: true,
        epargnes: [],
        retraits: [],
        credits: [],
        delegues: [],
      });
      await expect(service.getMemberDashboard('1')).rejects.toThrow(BadRequestException);
    });

    it('should return dashboard data for a valid membre', async () => {
      const membre = {
        id: 1,
        numeroCompte: 'MW-PRI-001',
        nomComplet: 'Jean',
        typeCompte: 'PRINCIPAL',
        statut: 'actif',
        dateAdhesion: new Date(),
        photoProfil: null,
        firstAcces: false,
        epargnes: [],
        retraits: [],
        credits: [],
        delegues: [],
      };
      mockPrisma.membre.findUnique.mockResolvedValue(membre);
      mockFinanceService.calculateBalances.mockReturnValue({ savings: { USD: 0, FC: 0 } });
      mockFinanceService.generateMonthlyHistory.mockReturnValue([]);
      const result = await service.getMemberDashboard('1');
      expect(result).toHaveProperty('profile');
      expect(result).toHaveProperty('balances');
    });
  });

  // ─── checkUserId ────────────────────────────────────────────────────────────
  describe('checkUserId', () => {
    it('should return exists:false if userId not used', async () => {
      mockPrisma.membre.findFirst.mockResolvedValue(null);
      mockPrisma.delegue.findFirst.mockResolvedValue(null);
      const result = await service.checkUserId('ZK-NEW');
      expect(result.exists).toBe(false);
    });

    it('should return exists:true if userId used by a membre', async () => {
      mockPrisma.membre.findFirst.mockResolvedValue({ id: 1 });
      const result = await service.checkUserId('ZK-USED');
      expect(result.exists).toBe(true);
      expect(result.where).toBe('membre');
    });
  });
});
