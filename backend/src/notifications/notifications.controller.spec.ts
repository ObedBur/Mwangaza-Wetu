import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

const mockNotificationsService = {
  findByMembre: jest.fn(),
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

      const result = await controller.findByMembre(1);

      expect(service.findByMembre).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('countUnread', () => {
    it('should return unread count', async () => {
      service.countUnread.mockResolvedValue({ count: 5 });

      const result = await controller.countUnread(1);

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
    it('should mark as read', async () => {
      service.markAsRead.mockResolvedValue({ id: 1, isRead: true });

      const result = await controller.markAsRead(1);

      expect(service.markAsRead).toHaveBeenCalledWith(1);
      expect(result.isRead).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all as read', async () => {
      service.markAllAsRead.mockResolvedValue({ updated: 10 });

      const result = await controller.markAllAsRead(1);

      expect(service.markAllAsRead).toHaveBeenCalledWith(1);
      expect(result.updated).toBe(10);
    });
  });

  describe('Admin Routes', () => {
    it('findByAdmin should return admin notifications', async () => {
      service.findByAdmin.mockResolvedValue([{ id: 1 }]);
      const result = await controller.findByAdmin(2);
      expect(service.findByAdmin).toHaveBeenCalledWith(2);
      expect(result).toEqual([{ id: 1 }]);
    });

    it('countUnreadAdmin should return unread for admin', async () => {
      service.countUnreadAdmin.mockResolvedValue({ count: 7 });
      const result = await controller.countUnreadAdmin(2);
      expect(service.countUnreadAdmin).toHaveBeenCalledWith(2);
      expect(result).toEqual({ count: 7 });
    });

    it('markAllAsReadAdmin should mark all for admin', async () => {
      service.markAllAsReadAdmin.mockResolvedValue({ updated: 5 });
      const result = await controller.markAllAsReadAdmin(2);
      expect(service.markAllAsReadAdmin).toHaveBeenCalledWith(2);
      expect(result).toEqual({ updated: 5 });
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      service.delete.mockResolvedValue({ deleted: true });

      const result = await controller.delete(1);

      expect(service.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ deleted: true });
    });
  });
});
