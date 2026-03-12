import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    loginAdmin: jest.fn().mockResolvedValue({ success: true, token: 'admin-token' }),
    loginMembre: jest.fn().mockResolvedValue({ success: true, token: 'membre-token' }),
    changePasswordFirstAccess: jest.fn().mockResolvedValue({ success: true, message: 'Mot de passe configuré avec succès' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('loginAdmin', () => {
    it('should call authService.loginAdmin', async () => {
      const loginDto: LoginDto = { email: 'admin@test.com', password: 'password' };
      const result = await controller.loginAdmin(loginDto);
      expect(service.loginAdmin).toHaveBeenCalledWith(loginDto);
      expect(result).toHaveProperty('token', 'admin-token');
    });
  });

  describe('loginMembre', () => {
    it('should call authService.loginMembre', async () => {
      const loginDto: LoginDto = { email: 'membre@test.com', password: 'password' };
      const result = await controller.loginMembre(loginDto);
      expect(service.loginMembre).toHaveBeenCalledWith(loginDto);
      expect(result).toHaveProperty('token', 'membre-token');
    });
  });

  describe('changePasswordFirstAccess', () => {
    it('should call authService.changePasswordFirstAccess', async () => {
      const dto: ChangePasswordDto = { numeroCompte: 'MB-001', newPassword: 'NewPass1@strong' };
      const result = await controller.changePasswordFirstAccess(dto);
      expect(service.changePasswordFirstAccess).toHaveBeenCalledWith(dto.numeroCompte, dto.newPassword);
      expect(result.success).toBe(true);
    });
  });
});
