import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  notification: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    delete: jest.fn(),
  },
  administrateur: {
    findMany: jest.fn()
  }
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByMembre', () => {
    it('should return member notifications sorted by date', async () => {
      const mockNotifs = [
        { id: 1, titre: 'T1', createdAt: new Date() },
        { id: 2, titre: 'T2', createdAt: new Date() },
      ];
      prisma.notification.findMany.mockResolvedValue(mockNotifs);

      const result = await service.findByMembre(1);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { membreId: 1 },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockNotifs);
    });
  });

  describe('countUnread', () => {
    it('should return unread count', async () => {
      prisma.notification.count.mockResolvedValue(5);

      const result = await service.countUnread(1);

      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { membreId: 1, isRead: false },
      });
      expect(result).toEqual({ count: 5 });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const mockNotif = { id: 1, isRead: false };
      prisma.notification.findUnique.mockResolvedValue(mockNotif);
      prisma.notification.update.mockResolvedValue({ ...mockNotif, isRead: true });

      const result = await service.markAsRead(1);

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isRead: true },
      });
      expect(result.isRead).toBe(true);
    });

    it('should throw NotFoundException if notification does not exist', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all member notifications as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead(1);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { membreId: 1, isRead: false },
        data: { isRead: true },
      });
      expect(result).toEqual({ updated: 3 });
    });
  });

  describe('create', () => {
    it('should create a new notification for member', async () => {
      const dto = { membreId: 1, titre: 'Test', message: 'Hello', type: 'info' as const };
      prisma.notification.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          membreId: 1,
          adminId: undefined,
          titre: 'Test',
          message: 'Hello',
          type: 'info',
        },
      });
      expect(result.id).toBe(1);
    });

    it('should create a new notification for admin', async () => {
      const dto = { adminId: 2, titre: 'Admin', message: 'Msg', type: 'warning' as const };
      prisma.notification.create.mockResolvedValue({ id: 2, ...dto });

      const result = await service.create(dto);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          membreId: undefined,
          adminId: 2,
          titre: 'Admin',
          message: 'Msg',
          type: 'warning',
        },
      });
      expect(result.id).toBe(2);
    });

    it('should throw an error if no adminId or membreId is provided', async () => {
      const dto = { titre: 'Err', message: 'Err', type: 'info' as const };
      await expect(service.create(dto)).rejects.toThrow("Une notification doit cibler un membre (membreId) ou un admin (adminId).");
    });
  });

  describe('Admin Methods', () => {
    it('findByAdmin - should return admin notifications sorted by date', async () => {
      const mockNotifs = [
        { id: 1, adminId: 2, titre: 'T1' }
      ];
      prisma.notification.findMany.mockResolvedValue(mockNotifs);

      const result = await service.findByAdmin(2);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { adminId: 2 },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockNotifs);
    });

    it('countUnreadAdmin - should return unread count for admin', async () => {
      prisma.notification.count.mockResolvedValue(3);

      const result = await service.countUnreadAdmin(2);

      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { adminId: 2, isRead: false },
      });
      expect(result).toEqual({ count: 3 });
    });

    it('markAllAsReadAdmin - should mark all admin notifications as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 4 });

      const result = await service.markAllAsReadAdmin(2);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { adminId: 2, isRead: false },
        data: { isRead: true },
      });
      expect(result).toEqual({ updated: 4 });
    });

    it('notifyAllAdmins - should notify all active admins', async () => {
      const mockAdmins = [{ id: 1 }, { id: 2 }];
      prisma.administrateur.findMany.mockResolvedValue(mockAdmins);
      prisma.notification.createMany.mockResolvedValue({ count: 2 });

      const result = await service.notifyAllAdmins('Global', 'Message', 'info');

      expect(prisma.administrateur.findMany).toHaveBeenCalledWith({
        where: { actif: true },
        select: { id: true }
      });
      expect(prisma.notification.createMany).toHaveBeenCalledWith({
        data: [
          { adminId: 1, titre: 'Global', message: 'Message', type: 'info' },
          { adminId: 2, titre: 'Global', message: 'Message', type: 'info' }
        ]
      });
      expect(result).toEqual({ notified: 2 });
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      prisma.notification.delete.mockResolvedValue({ id: 1 });

      const result = await service.delete(1);

      expect(prisma.notification.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({ deleted: true });
    });
  });
});
