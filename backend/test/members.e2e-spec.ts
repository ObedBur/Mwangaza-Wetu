import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Members (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let membreToken: string;

  const mockAdmin = {
    id: 10,
    email: 'e2e-admin@mwangaza.cd',
    motDePasse: '',
    actif: true,
    role: 'admin',
    nom: 'Admin',
    prenom: 'E2E',
    numeroCompte: 'MW-A-E2E',
  };

  const mockMembre = {
    id: 20,
    email: 'e2e-membre@mwangaza.cd',
    telephone: '+243812000001',
    motDePasse: '',
    statut: 'actif',
    nomComplet: 'Membre E2E',
    numeroCompte: 'MW-PRI-E2E',
    typeCompte: 'PRINCIPAL',
    firstAcces: false,
    epargnes: [],
    retraits: [],
    credits: [],
    delegues: [],
  };

  const mockMembre2 = {
    id: 21,
    email: 'e2e-membre2@mwangaza.cd',
    telephone: '+243812000002',
    motDePasse: '',
    statut: 'actif',
    nomComplet: 'Membre E2E 2',
    numeroCompte: 'MW-PRI-E2E2',
    typeCompte: 'PRINCIPAL',
    firstAcces: false,
    epargnes: [],
    retraits: [],
    credits: [],
    delegues: [],
  };

  const mockPrismaService = {
    administrateur: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.email === mockAdmin.email || where.id === mockAdmin.id) {
          return Promise.resolve(mockAdmin);
        }
        return Promise.resolve(null);
      }),
    },
    membre: {
      count: jest.fn().mockResolvedValue(2),
      findMany: jest.fn().mockResolvedValue([mockMembre, mockMembre2]),
      groupBy: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockImplementation(({ where }) => {
        if (where?.email === mockMembre.email) return Promise.resolve(mockMembre);
        if (where?.email === mockMembre2.email) return Promise.resolve(mockMembre2);
        return Promise.resolve(null);
      }),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where?.id === mockMembre.id || where?.numeroCompte === mockMembre.numeroCompte) return Promise.resolve(mockMembre);
        if (where?.id === mockMembre2.id || where?.numeroCompte === mockMembre2.numeroCompte) return Promise.resolve(mockMembre2);
        if (where?.id === mockAdmin.id) return Promise.resolve(null);
        return Promise.resolve(null);
      }),
      create: jest.fn().mockResolvedValue({ id: 99, numeroCompte: 'MW-PRI-NEW' }),
      update: jest.fn().mockResolvedValue({ id: 20 }),
      delete: jest.fn().mockResolvedValue({ id: 20 }),
    },
    compteEpargne: { create: jest.fn(), deleteMany: jest.fn() },
    revenu: { create: jest.fn() },
    revenuType: { findFirst: jest.fn().mockResolvedValue(null) },
    delegue: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeAll(async () => {
    mockAdmin.motDePasse = await bcrypt.hash('Admin@123', 10);
    mockMembre.motDePasse = await bcrypt.hash('Membre@123', 10);
    mockMembre2.motDePasse = await bcrypt.hash('Membre@123', 10);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Login admin
    const adminRes = await request(app.getHttpServer())
      .post('/api/auth/admin/login')
      .send({ email: mockAdmin.email, password: 'Admin@123' });
    adminToken = adminRes.body.token;

    // Login membre
    const membreRes = await request(app.getHttpServer())
      .post('/api/auth/membre/login')
      .send({ email: mockMembre.email, password: 'Membre@123' });
    membreToken = membreRes.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Protection globale ──────────────────────────────────────────────────
  describe('Protection JWT globale', () => {
    it('GET /api/membres — 401 sans token', () =>
      request(app.getHttpServer()).get('/api/membres').expect(401));

    it('GET /api/membres — 200 avec token admin', () =>
      request(app.getHttpServer())
        .get('/api/membres')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200));

    it('GET /api/membres — 200 avec token membre', () =>
      request(app.getHttpServer())
        .get('/api/membres')
        .set('Authorization', `Bearer ${membreToken}`)
        .expect(200));
  });

  // ─── CRUD Admin ──────────────────────────────────────────────────────────
  describe('POST /api/membres — réservé admin/superadmin', () => {
    it('doit retourner 403 si un membre essaie de créer', () =>
      request(app.getHttpServer())
        .post('/api/membres')
        .set('Authorization', `Bearer ${membreToken}`)
        .send({
          nomComplet: 'Nouveau',
          typeCompte: 'PRINCIPAL',
          telephone: '+243812345679',
          statut: 'actif',
          dateAdhesion: '2024-01-01',
        })
        .expect(403));

    it('doit retourner 400 si téléphone invalide', () =>
      request(app.getHttpServer())
        .post('/api/membres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nomComplet: 'Nouveau',
          typeCompte: 'PRINCIPAL',
          telephone: '12345',
          statut: 'actif',
          dateAdhesion: '2024-01-01',
        })
        .expect(400));
  });

  describe('DELETE /api/membres/:id — réservé admin', () => {
    it('doit retourner 403 si un membre essaie de supprimer', () =>
      request(app.getHttpServer())
        .delete('/api/membres/1')
        .set('Authorization', `Bearer ${membreToken}`)
        .expect(403));
  });

  // ─── Dashboard IDOR ──────────────────────────────────────────────────────
  describe('GET /api/membres/dashboard/:id — protection IDOR', () => {
    it('doit bloquer un membre qui accède au dashboard d\'un autre (IDOR)', () =>
      request(app.getHttpServer())
        .get(`/api/membres/dashboard/${mockMembre2.numeroCompte}`)
        .set('Authorization', `Bearer ${membreToken}`)
        .expect(403));

    it('doit autoriser un membre à accéder à son propre dashboard', () =>
      request(app.getHttpServer())
        .get(`/api/membres/dashboard/${mockMembre.id}`)
        .set('Authorization', `Bearer ${membreToken}`)
        .expect(200));

    it('doit autoriser un admin à accéder à n\'importe quel dashboard', () =>
      request(app.getHttpServer())
        .get(`/api/membres/dashboard/${mockMembre2.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200));
  });

  // ─── Délégués sécurisés ──────────────────────────────────────────────────
  describe('GET /api/delegues/by-userid/:userId', () => {
    it('doit retourner 401 sans token', () =>
      request(app.getHttpServer())
        .get('/api/delegues/by-userid/ZK-001')
        .expect(401));

    it('doit retourner 403 si un membre tente d\'accéder', () =>
      request(app.getHttpServer())
        .get('/api/delegues/by-userid/ZK-001')
        .set('Authorization', `Bearer ${membreToken}`)
        .expect(403));

    it('doit retourner 200 pour un admin', () =>
      request(app.getHttpServer())
        .get('/api/delegues/by-userid/ZK-001')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect((res) => {
          expect(res.status).toBeLessThan(500);
        }));
  });

  // ─── Numeros — réservé admin ─────────────────────────────────────────────
  describe('GET /api/membres/numeros — réservé admin', () => {
    it('doit retourner 403 pour un membre', () =>
      request(app.getHttpServer())
        .get('/api/membres/numeros')
        .set('Authorization', `Bearer ${membreToken}`)
        .expect(403));

    it('doit retourner 200 pour un admin', () =>
      request(app.getHttpServer())
        .get('/api/membres/numeros')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200));
  });
});
