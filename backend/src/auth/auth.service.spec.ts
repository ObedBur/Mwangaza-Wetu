import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrismaService = {
    administrateur: {
      findUnique: jest.fn(),
    },
    membre: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loginAdmin', () => {
    it('should return a JWT token when credentials are valid', async () => {
      const password = 'Password123!';
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = {
        id: 1,
        email: 'admin@mwangaza.cd',
        numeroCompte: 'AD-001',
        motDePasse: hashedPassword,
        actif: true,
        nom: 'Admin',
        prenom: 'Super',
      };

      mockPrismaService.administrateur.findUnique.mockResolvedValue(admin);

      const result = await service.loginAdmin({
        email: 'admin@mwangaza.cd',
        password: password,
      });

      expect(result).toHaveProperty('token');
      expect(result.user).not.toHaveProperty('motDePasse');
      expect(result.user.email).toBe(admin.email);
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      const admin = {
        id: 1,
        email: 'admin@mwangaza.cd',
        motDePasse: await bcrypt.hash('correctPassword', 10),
        actif: true,
      };

      mockPrismaService.administrateur.findUnique.mockResolvedValue(admin);

      await expect(
        service.loginAdmin({
          email: 'admin@mwangaza.cd',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when admin email does not exist', async () => {
      mockPrismaService.administrateur.findUnique.mockResolvedValue(null);

      await expect(
        service.loginAdmin({
          email: 'nonexistent@mwangaza.cd',
          password: 'anyPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('loginMembre', () => {
    it('should return a token for valid membre credentials', async () => {
      const password = 'MembrePassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      const membre = {
        id: 1,
        email: 'membre@test.com',
        numeroCompte: 'MB-001',
        motDePasse: hashedPassword,
        nomComplet: 'Jean Dupont',
        typeCompte: 'PRINCIPAL',
        firstAcces: false,
      };

      mockPrismaService.membre.findFirst.mockResolvedValue(membre);

      const result = await service.loginMembre({
        email: 'membre@test.com',
        password: password,
      });

      expect(result.token).toBe('mock-token');
      expect(result.user.nom_complet).toBe(membre.nomComplet);
    });
  });
});
