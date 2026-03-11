import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '../src/auth/enums/role.enum';
import { JwtService } from '@nestjs/jwt';

describe('Members (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let adminToken: string;
  let memberToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        administrateur: {
          findUnique: jest.fn().mockImplementation(({ where }) => {
            if (where.id === 1) {
              return Promise.resolve({ id: 1, email: 'admin@mwangaza.cd', role: Role.ADMIN, actif: true });
            }
            return Promise.resolve(null);
          }),
        },
        membre: {
          findUnique: jest.fn().mockImplementation(({ where }) => {
            if (where.numeroCompte === 'MW-EPA-5QA7VQ' || where.id === 23) {
              return Promise.resolve({ id: 23, email: 'jp.kabangu@example.com', numeroCompte: 'MW-EPA-5QA7VQ', role: 'membre', statut: 'actif' });
            }
            return Promise.resolve(null);
          }),
          count: jest.fn().mockResolvedValue(10),
          findMany: jest.fn().mockResolvedValue([]),
          groupBy: jest.fn().mockResolvedValue([]),
        },
        revenuType: {
          findFirst: jest.fn().mockResolvedValue({ id: 1, nom: 'Système Membre' }),
        }
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    // Mock an admin token
    adminToken = jwtService.sign({
      id: 1,
      email: 'admin@mwangaza.cd',
      role: Role.ADMIN,
    });

    // Mock a member token
    memberToken = jwtService.sign({
      id: 23,
      email: 'jp.kabangu@example.com',
      numero_compte: 'MW-EPA-5QA7VQ',
      role: 'membre',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/membres', () => {
    it('should block access without token', () => {
      return request(app.getHttpServer())
        .get('/api/membres')
        .expect(401);
    });

    it('should allow access with admin token', async () => {
      // Mock prisma response
      jest.spyOn(prisma.membre, 'count').mockResolvedValue(1);
      jest.spyOn(prisma.membre, 'findMany').mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/api/membres')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });
  });

  describe('POST /api/membres', () => {
    it('should reject non-admin users', () => {
      return request(app.getHttpServer())
        .post('/api/membres')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          nomComplet: 'Unauthorized Test',
          typeCompte: 'PRINCIPAL',
          telephone: '0812345678',
          dateAdhesion: new Date().toISOString()
        })
        .expect(403);
    });

    it('should validate DTO fields', () => {
      return request(app.getHttpServer())
        .post('/api/membres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nomComplet: '', // Invalid
          typeCompte: 'PRINCIPAL'
        })
        .expect(400);
    });
  });

  describe('GET /api/membres/stats', () => {
    it('should return member statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/membres/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('actifs');
    });
  });
});
