import { Test, TestingModule } from '@nestjs/testing';
import { SavingsService } from './savings.service';
import { PrismaService } from '../prisma/prisma.service';
import { ParametresService } from '../parametres/parametres.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException } from '@nestjs/common';
import { TypeOperation, Devise } from './dto/create-savings.dto';

describe('SavingsService', () => {
  let service: SavingsService;

  const mockPrisma = {
    epargne: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    retrait: {
      groupBy: jest.fn(),
    },
    membre: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockParametresService = {
    getGeneralParameters: jest.fn().mockResolvedValue({
      montant_min_depot_fc: 1000,
      montant_min_depot_usd: 1,
    }),
  };

  const mockNotificationsService = {
    notifyAllAdmins: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ParametresService, useValue: mockParametresService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<SavingsService>(SavingsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('devrait retourner les données paginées et exclure les comptes système', async () => {
      mockPrisma.epargne.count.mockResolvedValue(1);
      mockPrisma.epargne.findMany.mockResolvedValue([{ id: 1, compte: 'MW-001' }]);

      const result = await service.findAll({ page: 1, pageSize: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);

      // Vérifie que les comptes systèmes sont bien exclus
      const findManyCall = mockPrisma.epargne.findMany.mock.calls[0][0];
      expect(findManyCall.where.NOT).toBeDefined();
      expect(findManyCall.where.NOT[0].compte.contains).toBe('REVENUS');
    });
  });

  describe('getSoldes', () => {
    it('devrait retourner 0 si le membre n\'existe pas', async () => {
      mockPrisma.membre.findUnique.mockResolvedValue(null);
      const result = await service.getSoldes('MW-NO');
      expect(result).toEqual({ soldeFC: 0, soldeUSD: 0 });
    });

    it('devrait calculer le solde (Dépôts - Retraits - Frais)', async () => {
      mockPrisma.membre.findUnique.mockResolvedValue({ id: 1 });
      
      // Mocks groupBy returns
      mockPrisma.epargne.groupBy
        .mockResolvedValueOnce([{ devise: 'USD', _sum: { montant: 100 } }]) // Depots
        .mockResolvedValueOnce([{ devise: 'USD', _sum: { montant: 20 } }]); // Retraits
      mockPrisma.retrait.groupBy.mockResolvedValue([{ devise: 'USD', _sum: { frais: 5 } }]); // Frais

      const result = await service.getSoldes('MW-001');

      // 100 - 20 - 5 = 75
      expect(result.soldeUSD).toBe(75);
      expect(result.soldeFC).toBe(0); // Pas de transactions FC donc 0
    });
  });

  describe('create (Dépôt & Retrait)', () => {
    it('devrait rejeter un dépôt inférieur au minimum autorisé', async () => {
      const dto = { compte: 'MW-001', typeOperation: TypeOperation.depot, devise: Devise.USD, montant: 0.5, dateOperation: '2026-01-01' };
      // min_depot_usd = 1 (voir mockParametresService)
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(mockPrisma.epargne.create).not.toHaveBeenCalled();
    });

    it('devrait accepter un dépôt valide', async () => {
      const dto = { compte: 'MW-001', typeOperation: TypeOperation.depot, devise: Devise.USD, montant: 10, dateOperation: '2026-01-01' };
      mockPrisma.epargne.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);
      expect(result).toHaveProperty('id');
      expect(mockNotificationsService.notifyAllAdmins).toHaveBeenCalledWith(
        expect.stringContaining('Nouveau Dépôt'),
        expect.any(String),
        'epargne'
      );
    });

    it('devrait rejeter un retrait si le solde est insuffisant', async () => {
      const dto = { compte: 'MW-001', typeOperation: TypeOperation.retrait, devise: Devise.USD, montant: 100, dateOperation: '2026-01-01' };
      
      // Simule un solde actuel de 50 USD
      jest.spyOn(service, 'getSoldes').mockResolvedValue({ soldeFC: 0, soldeUSD: 50 });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(/Solde insuffisant/);
    });

    it('devrait accepter un retrait si le solde est suffisant', async () => {
      const dto = { compte: 'MW-001', typeOperation: TypeOperation.retrait, devise: Devise.USD, montant: 30, dateOperation: '2026-01-01' };
      
      // Simule un solde actuel de 50 USD
      jest.spyOn(service, 'getSoldes').mockResolvedValue({ soldeFC: 0, soldeUSD: 50 });
      mockPrisma.epargne.create.mockResolvedValue({ id: 2, ...dto });

      const result = await service.create(dto);
      expect(result).toHaveProperty('id');
      expect(mockNotificationsService.notifyAllAdmins).toHaveBeenCalledWith(
        expect.stringContaining('Nouveau Retrait'),
        expect.any(String),
        'epargne'
      );
    });
  });

  describe('remove', () => {
    it('devrait appeler prisma.delete', async () => {
      mockPrisma.epargne.delete.mockResolvedValue({ id: 1 });
      await service.remove(1);
      expect(mockPrisma.epargne.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
