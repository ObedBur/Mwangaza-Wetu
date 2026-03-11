import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const mockAdmin = {
    id: 99,
    email: 'e2e-admin@test.com',
    motDePasse: '', // Will be hashed
    actif: true,
    role: 'superadmin',
    nom: 'E2E',
    prenom: 'Admin',
  };

  const mockMembre = {
    id: 100,
    numeroCompte: 'MB-E2E-001',
    email: 'e2e-membre@test.com',
    motDePasse: '', // Will be hashed
    statut: 'actif',
    nomComplet: 'E2E Membre',
  };

  beforeAll(async () => {
    mockAdmin.motDePasse = await bcrypt.hash('Admin@123', 10);
    mockMembre.motDePasse = await bcrypt.hash('Membre@123', 10);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        administrateur: {
          findUnique: jest.fn().mockImplementation(({ where }) => {
            if (where.email === mockAdmin.email || where.id === mockAdmin.id) {
              return Promise.resolve(mockAdmin);
            }
            return Promise.resolve(null);
          }),
        },
        membre: {
          count: jest.fn().mockResolvedValue(0),
          findMany: jest.fn().mockResolvedValue([]),
          findFirst: jest.fn().mockImplementation(({ where }) => {
            if (where.email === mockMembre.email || where.telephone === mockMembre.email) {
              return Promise.resolve(mockMembre);
            }
            return Promise.resolve(null);
          }),
          findUnique: jest.fn().mockImplementation(({ where }) => {
            if (where.numeroCompte === mockMembre.numeroCompte || where.id === mockMembre.id) {
              return Promise.resolve(mockMembre);
            }
            return Promise.resolve(null);
          }),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Login Flow', () => {
    it('/api/auth/admin/login (POST) - Success', () => {
      return request(app.getHttpServer())
        .post('/api/auth/admin/login')
        .send({ email: mockAdmin.email, password: 'Admin@123' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body.user.email).toBe(mockAdmin.email);
        });
    });

    it('/api/auth/admin/login (POST) - Invalid Password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/admin/login')
        .send({ email: mockAdmin.email, password: 'WrongPassword' })
        .expect(401);
    });
  });

  describe('Security & Protection', () => {
    let authToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/admin/login')
        .send({ email: mockAdmin.email, password: 'Admin@123' });
      authToken = res.body.token;
    });

    it('Should block access to protected routes without token', () => {
      return request(app.getHttpServer())
        .get('/api/membres')
        .expect(401);
    });

    it('Should allow access to protected routes with valid token', () => {
      // Mocking the return of members for this test
      (prisma as any).membre.findMany = jest.fn().mockResolvedValue([]);
      
      return request(app.getHttpServer())
        .get('/api/membres')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('Should reject token if user is deactivated in database', async () => {
      // We simulate a deactivation
      mockAdmin.actif = false;

      await request(app.getHttpServer())
        .get('/api/membres')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('révoqué');
        });

      // Reset for other tests
      mockAdmin.actif = true;
    });
  });
});
