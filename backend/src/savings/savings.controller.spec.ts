import { Test, TestingModule } from '@nestjs/testing';
import { SavingsController } from './savings.controller';
import { SavingsService } from './savings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ForbiddenException } from '@nestjs/common';
import { TypeOperation, Devise } from './dto/create-savings.dto';

describe('SavingsController', () => {
  let controller: SavingsController;
  let service: SavingsService;

  const mockSavingsService = {
    findAll: jest.fn(),
    findByCompte: jest.fn(),
    getSoldes: jest.fn(),
    getTotalsAll: jest.fn(),
    getSoldeByTypeCompte: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavingsController],
      providers: [
        { provide: SavingsService, useValue: mockSavingsService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(ThrottlerGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SavingsController>(SavingsController);
    service = module.get<SavingsService>(SavingsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll / depots / retraits', () => {
    it('findAll should call service.findAll with correct pagination', async () => {
      mockSavingsService.findAll.mockResolvedValue({ data: [], meta: {} });
      await controller.findAll(1, 10);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, pageSize: 10, type: undefined });
    });

    it('getDepots should default to TypeOperation.depot', async () => {
      mockSavingsService.findAll.mockResolvedValue({ data: [], meta: {} });
      await controller.getDepots(1, 10);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, pageSize: 10, type: TypeOperation.depot });
    });

    it('getRetraits should default to TypeOperation.retrait', async () => {
      mockSavingsService.findAll.mockResolvedValue({ data: [], meta: {} });
      await controller.getRetraits(1, 10);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, pageSize: 10, type: TypeOperation.retrait });
    });
  });

  describe('findByCompte (IDOR protection)', () => {
    it('devrait autoriser un membre à voir ses propres transactions', async () => {
      const req = { user: { role: 'membre', numeroCompte: 'MW-001' } };
      mockSavingsService.findByCompte.mockResolvedValue([]);
      await expect(controller.findByCompte('MW-001', req)).resolves.toEqual([]);
      expect(service.findByCompte).toHaveBeenCalledWith('MW-001');
    });

    it('devrait interdire à un membre de voir les transactions d\'un autre', async () => {
      const req = { user: { role: 'membre', numeroCompte: 'MW-001' } };
      await expect(controller.findByCompte('MW-HACK', req)).rejects.toThrow(ForbiddenException);
      expect(service.findByCompte).not.toHaveBeenCalled();
    });

    it('devrait autoriser un admin à voir n\'importe quelles transactions', async () => {
      const req = { user: { role: 'admin' } };
      mockSavingsService.findByCompte.mockResolvedValue([]);
      await expect(controller.findByCompte('MW-002', req)).resolves.toEqual([]);
      expect(service.findByCompte).toHaveBeenCalledWith('MW-002');
    });
  });

  describe('getSoldes (IDOR protection)', () => {
    it('devrait bloquer l\'accès au solde d\'un autre membre', async () => {
      const req = { user: { role: 'membre', numeroCompte: 'MW-001' } };
      await expect(controller.getSoldes('MW-002', req)).rejects.toThrow(ForbiddenException);
    });

    it('devrait autoriser un admin ou le propriétaire', async () => {
      const req = { user: { role: 'membre', numeroCompte: 'MW-001' } };
      mockSavingsService.getSoldes.mockResolvedValue({ soldeFC: 100, soldeUSD: 10 });
      const result = await controller.getSoldes('MW-001', req);
      expect(result).toEqual({ soldeFC: 100, soldeUSD: 10 });
    });
  });

  describe('Admin only routes (getTotalsAll, getByType, create, remove)', () => {
    it('should call getTotalsAll', async () => {
      mockSavingsService.getTotalsAll.mockResolvedValue({ totalFC: 0, totalUSD: 0 });
      await controller.getTotalsAll();
      expect(service.getTotalsAll).toHaveBeenCalled();
    });

    it('should call create', async () => {
      const dto = { compte: 'M-1', typeOperation: TypeOperation.depot, devise: Devise.USD, montant: 10, dateOperation: '2026-01-01' };
      mockSavingsService.create.mockResolvedValue(dto);
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should call remove', async () => {
      mockSavingsService.remove.mockResolvedValue({ id: 1 });
      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
