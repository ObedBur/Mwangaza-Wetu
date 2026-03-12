import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsService } from './withdrawals.service';
import { Role } from '../auth/enums/role.enum';
import { ForbiddenException } from '@nestjs/common';

describe('WithdrawalsController', () => {
  let controller: WithdrawalsController;
  let service: WithdrawalsService;

  const mockWithdrawalsService = {
    findAll: jest.fn().mockResolvedValue([]),
    findByCompte: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ dateOperation: new Date() }),
    verifyLimites: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WithdrawalsController],
      providers: [
        { provide: WithdrawalsService, useValue: mockWithdrawalsService },
      ],
    }).compile();

    controller = module.get<WithdrawalsController>(WithdrawalsController);
    service = module.get<WithdrawalsService>(WithdrawalsService);
  });

  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('findByCompte', () => {
    it('devrait autoriser un membre à voir son propre compte', async () => {
      const req = { user: { role: Role.MEMBRE, numeroCompte: 'MW-001' } };
      await controller.findByCompte('MW-001', req);
      expect(service.findByCompte).toHaveBeenCalledWith('MW-001');
    });

    it('devrait bloquer un membre tentant de voir un autre compte (IDOR)', async () => {
      const req = { user: { role: Role.MEMBRE, numeroCompte: 'MW-001' } };
      await expect(controller.findByCompte('MW-002', req)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('devrait autoriser un admin à voir n\'importe quel compte', async () => {
      const req = { user: { role: Role.ADMIN, id: 1 } };
      await controller.findByCompte('MW-002', req);
      expect(service.findByCompte).toHaveBeenCalledWith('MW-002');
    });
  });

  describe('create', () => {
    it('devrait appeler le service avec l\'ID de l\'admin', async () => {
      const dto = {
        compte: 'MW-001',
        montant: 50,
        devise: 'USD' as any,
        dateOperation: '2026-03-12',
      };
      const req = { user: { id: 10, role: Role.ADMIN } };
      
      await controller.create(dto, req);
      
      expect(service.create).toHaveBeenCalledWith(dto, 10);
    });
  });
});
