import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ForbiddenException } from '@nestjs/common';

const mockNotificationsService = {
  findByMembre: jest.fn(),
  findById: jest.fn(),
  countUnread: jest.fn(),
  create: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  findByAdmin: jest.fn(),
  countUnreadAdmin: jest.fn(),
  markAllAsReadAdmin: jest.fn(),
  delete: jest.fn(),
};

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: typeof mockNotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByMembre', () => {
    it('should return member notifications', async () => {
      const mockResult = [{ id: 1, titre: 'Test' }];
      service.findByMembre.mockResolvedValue(mockResult);
      const mockReq = { user: { id: 1, role: 'membre' } };

      const result = await controller.findByMembre(1, mockReq);

      expect(service.findByMembre).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });

    it('should throw ForbiddenException if member tries to access another member notifications', async () => {
      const mockReq = { user: { id: 2, role: 'membre' } };
      await expect(controller.findByMembre(1, mockReq)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('countUnread', () => {
    it('should return unread count', async () => {
      service.countUnread.mockResolvedValue({ count: 5 });
      const mockReq = { user: { id: 1, role: 'membre' } };

      const result = await controller.countUnread(1, mockReq);

      expect(service.countUnread).toHaveBeenCalledWith(1);
      expect(result).toEqual({ count: 5 });
    });
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const dto = { membreId: 1, titre: 'T', message: 'M' };
      service.create.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark as read if owned by member', async () => {
      const mockNotif = { id: 1, membreId: 1, adminId: null };
      service.findById.mockResolvedValue(mockNotif);
      service.markAsRead.mockResolvedValue({ id: 1, isRead: true });
      const mockReq = { user: { id: 1, role: 'membre' } };

      const result = await controller.markAsRead(1, mockReq);

      expect(service.markAsRead).toHaveBeenCalledWith(1);
      expect(result.isRead).toBe(true);
    });

    it('should throw ForbiddenException if not owned', async () => {
      const mockNotif = { id: 1, membreId: 2, adminId: null };
      service.findById.mockResolvedValue(mockNotif);
      const mockReq = { user: { id: 1, role: 'membre' } };

      await expect(controller.markAsRead(1, mockReq)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all as read', async () => {
      service.markAllAsRead.mockResolvedValue({ updated: 10 });
      const mockReq = { user: { id: 1, role: 'membre' } };

      const result = await controller.markAllAsRead(1, mockReq);

      expect(service.markAllAsRead).toHaveBeenCalledWith(1);
      expect(result.updated).toBe(10);
    });
  });

  describe('Admin Routes', () => {
    it('findByAdmin should return admin notifications', async () => {
      service.findByAdmin.mockResolvedValue([{ id: 1 }]);
      const mockReq = { user: { id: 2, role: 'admin' } };
      const result = await controller.findByAdmin(2, mockReq);
      expect(service.findByAdmin).toHaveBeenCalledWith(2);
      expect(result).toEqual([{ id: 1 }]);
    });

    it('countUnreadAdmin should return unread for admin', async () => {
      service.countUnreadAdmin.mockResolvedValue({ count: 7 });
      const mockReq = { user: { id: 2, role: 'admin' } };
      const result = await controller.countUnreadAdmin(2, mockReq);
      expect(service.countUnreadAdmin).toHaveBeenCalledWith(2);
      expect(result).toEqual({ count: 7 });
    });

    it('markAllAsReadAdmin should mark all for admin', async () => {
      service.markAllAsReadAdmin.mockResolvedValue({ updated: 5 });
      const mockReq = { user: { id: 2, role: 'admin' } };
      const result = await controller.markAllAsReadAdmin(2, mockReq);
      expect(service.markAllAsReadAdmin).toHaveBeenCalledWith(2);
      expect(result).toEqual({ updated: 5 });
    });
  });

  describe('delete', () => {
    it('should delete a notification if owned', async () => {
      const mockNotif = { id: 1, membreId: 1, adminId: null };
      service.findById.mockResolvedValue(mockNotif);
      service.delete.mockResolvedValue({ deleted: true });
      const mockReq = { user: { id: 1, role: 'membre' } };

      const result = await controller.delete(1, mockReq);

      expect(service.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ deleted: true });
    });
  });
});
