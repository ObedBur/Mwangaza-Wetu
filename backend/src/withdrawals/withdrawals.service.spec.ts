import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalsService } from './withdrawals.service';
import { PrismaService } from '../prisma/prisma.service';
import { ParametresService } from '../parametres/parametres.service';
import { BalancesService } from '../balances/balances.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException } from '@nestjs/common';
import { TypeOperationEpargne, Devise } from '@prisma/client';

describe('WithdrawalsService', () => {
  let service: WithdrawalsService;
  let prisma: PrismaService;
  let balancesService: BalancesService;

  const mockPrismaService = {
    membre: { findUnique: jest.fn() },
    epargne: { create: jest.fn(), aggregate: jest.fn() },
    retrait: { create: jest.fn(), findMany: jest.fn() },
    revenu: { create: jest.fn() },
    revenuType: { findFirst: jest.fn() },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockParametresService = {
    getGeneralParameters: jest.fn().mockResolvedValue({
      montant_min_retrait_usd: 1,
      montant_max_par_retrait_usd: 1000,
      solde_min_usd: 5,
      limite_retrait_jour_usd: 2000,
    }),
  };

  const mockBalancesService = {
    getSoldeDisponibleMembre: jest.fn(),
  };

  const mockNotificationsService = {
    notifyAllAdmins: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawalsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ParametresService, useValue: mockParametresService },
        { provide: BalancesService, useValue: mockBalancesService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<WithdrawalsService>(WithdrawalsService);
    prisma = module.get<PrismaService>(PrismaService);
    balancesService = module.get<BalancesService>(BalancesService);
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  describe('calculateFees', () => {
    it('devrait calculer 3% pour un petit montant (< 50 USD)', async () => {
      // @ts-ignore (accessing private method for test)
      const fees = await service.calculateFees(10, 'USD');
      expect(fees).toBe(0.3); // 10 * 0.03
    });

    it('devrait calculer 2.5% pour un montant moyen (entre 50 et 200 USD)', async () => {
      // @ts-ignore
      const fees = await service.calculateFees(100, 'USD');
      expect(fees).toBe(2.5); // 100 * 0.025
    });
  });

  describe('verifyLimites', () => {
    it('devrait lever une erreur si le montant est inférieur au minimum', async () => {
      await expect(service.verifyLimites('MW-001', 0.5, 'USD')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('devrait lever une erreur si le solde est insuffisant', async () => {
      mockBalancesService.getSoldeDisponibleMembre.mockResolvedValue({
        usd: { soldeBrut: 10, soldeDisponible: 8 },
      });

      await expect(service.verifyLimites('MW-001', 20, 'USD')).rejects.toThrow(
        /Solde insuffisant/i,
      );
    });
  });

  describe('create', () => {
    it('devrait créer un retrait et enregistrer les frais', async () => {
      const dto = {
        compte: 'MW-001',
        montant: 10,
        devise: Devise.USD,
        dateOperation: '2026-03-12',
        description: 'Test',
      };

      mockPrismaService.membre.findUnique.mockResolvedValue({ typeCompte: 'PRINCIPAL' });
      mockBalancesService.getSoldeDisponibleMembre.mockResolvedValue({
        usd: { soldeBrut: 100, soldeDisponible: 100 },
      });
      mockPrismaService.epargne.aggregate.mockResolvedValue({ _sum: { montant: 0 } });
      mockPrismaService.revenuType.findFirst.mockResolvedValue({ id: 1 });

      await service.create(dto, 10);

      expect(mockPrismaService.epargne.create).toHaveBeenCalled();
      expect(mockPrismaService.retrait.create).toHaveBeenCalled();
      expect(mockNotificationsService.notifyAllAdmins).toHaveBeenCalled();
    });
  });
});
