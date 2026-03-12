import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ForbiddenException } from '@nestjs/common';

describe('MembersController', () => {
  let controller: MembersController;
  let service: MembersService;

  const mockMembersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
    getMemberDashboard: jest.fn(),
    findByZkId: jest.fn(),
    findByNumero: jest.fn(),
    generateNumero: jest.fn(),
    checkUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        { provide: MembersService, useValue: mockMembersService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .overrideGuard(ThrottlerGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MembersController>(MembersController);
    service = module.get<MembersService>(MembersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── findAll ───────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should call service.findAll with default pagination', async () => {
      mockMembersService.findAll.mockResolvedValue({ data: [], meta: {} });
      await controller.findAll(1, 10);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, pageSize: 10, userId: undefined });
    });

    it('should pass userId filter when provided', async () => {
      mockMembersService.findAll.mockResolvedValue({ data: [], meta: {} });
      await controller.findAll(1, 10, 'ZK-001');
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, pageSize: 10, userId: 'ZK-001' });
    });
  });

  // ─── getStats ──────────────────────────────────────────────────────────────
  describe('getStats', () => {
    it('should return stats from service', async () => {
      const stats = { total: 10, actifs: 8, inactifs: 2 };
      mockMembersService.getStats.mockResolvedValue(stats);
      const result = await controller.getStats();
      expect(result).toEqual(stats);
    });
  });

  // ─── getMemberDashboard — protection IDOR ──────────────────────────────────
  describe('getMemberDashboard (IDOR protection)', () => {
    it('should allow a member to access their own dashboard by id', async () => {
      const req = { user: { id: 42, role: 'membre', numeroCompte: 'MW-PRI-001' } };
      mockMembersService.getMemberDashboard.mockResolvedValue({ profile: {} });
      await expect(controller.getMemberDashboard('42', req)).resolves.toBeDefined();
    });

    it('should allow a member to access their own dashboard by numeroCompte', async () => {
      const req = { user: { id: 42, role: 'membre', numeroCompte: 'MW-PRI-001' } };
      mockMembersService.getMemberDashboard.mockResolvedValue({ profile: {} });
      await expect(controller.getMemberDashboard('MW-PRI-001', req)).resolves.toBeDefined();
    });

    it('should BLOCK a member from accessing another member dashboard (IDOR)', async () => {
      const req = { user: { id: 42, role: 'membre', numeroCompte: 'MW-PRI-001' } };
      await expect(
        controller.getMemberDashboard('MW-PRI-002', req),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow an admin to access any member dashboard', async () => {
      const req = { user: { id: 1, role: 'admin' } };
      mockMembersService.getMemberDashboard.mockResolvedValue({ profile: {} });
      await expect(controller.getMemberDashboard('MW-PRI-002', req)).resolves.toBeDefined();
    });
  });

  // ─── create / update / delete ──────────────────────────────────────────────
  describe('create', () => {
    it('should call service.create', async () => {
      const dto: any = { nomComplet: 'Test', typeCompte: 'PRINCIPAL', telephone: '+243812345678', statut: 'actif', dateAdhesion: '2024-01-01' };
      mockMembersService.create.mockResolvedValue({ id: 1, ...dto });
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('update', () => {
    it('should call service.update with id and dto', async () => {
      mockMembersService.update.mockResolvedValue({ id: 1 });
      await controller.update(1, { nomComplet: 'Nouveau Nom' });
      expect(service.update).toHaveBeenCalledWith(1, { nomComplet: 'Nouveau Nom' });
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      mockMembersService.remove.mockResolvedValue({ success: true });
      const result = await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ success: true });
    });
  });
});
