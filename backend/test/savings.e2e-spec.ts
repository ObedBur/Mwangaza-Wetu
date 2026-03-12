import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Savings (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
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
    numeroCompte: 'MW-PRI-001',
    typeCompte: 'PRINCIPAL',
    firstAcces: false,
    epargnes: [],
  };

  const mockMembre2 = {
    id: 21,
    email: 'e2e-membre2@mwangaza.cd',
    telephone: '+243812000002',
    motDePasse: '',
    statut: 'actif',
    nomComplet: 'Membre E2E 2',
    numeroCompte: 'MW-PRI-002',
    typeCompte: 'PRINCIPAL',
    firstAcces: false,
    epargnes: [],
  };

  const mockPrismaService = {
    administrateur: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where?.email === mockAdmin.email || where?.id === mockAdmin.id) return Promise.resolve(mockAdmin);
        return Promise.resolve(null);
      }),
      findMany: jest.fn().mockResolvedValue([mockAdmin]),
    },
    notification: {
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    membre: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where?.numeroCompte === mockMembre.numeroCompte || where?.email === mockMembre.email || where?.id === mockMembre.id) return Promise.resolve(mockMembre);
        if (where?.numeroCompte === mockMembre2.numeroCompte || where?.email === mockMembre2.email || where?.id === mockMembre2.id) return Promise.resolve(mockMembre2);
        return Promise.resolve(null);
      }),
      findFirst: jest.fn().mockImplementation(({ where }) => {
        if (where?.numeroCompte === mockMembre.numeroCompte || where?.email === mockMembre.email || where?.id === mockMembre.id) return Promise.resolve(mockMembre);
        if (where?.numeroCompte === mockMembre2.numeroCompte || where?.email === mockMembre2.email || where?.id === mockMembre2.id) return Promise.resolve(mockMembre2);
        return Promise.resolve(null);
      }),
    },
    epargne: {
      count: jest.fn().mockResolvedValue(1),
      findMany: jest.fn().mockResolvedValue([{ id: 1, compte: mockMembre.numeroCompte, montant: 100, devise: 'USD' }]),
      create: jest.fn().mockResolvedValue({ id: 99, compte: mockMembre.numeroCompte }),
      delete: jest.fn().mockResolvedValue({ id: 99 }),
      groupBy: jest.fn().mockImplementation(({ where }) => {
        if (where?.compte === mockMembre.numeroCompte && where?.typeOperation === 'depot') {
          return Promise.resolve([{ devise: 'USD', _sum: { montant: 150 } }]);
        }
        if (where?.typeOperation === 'depot') {
          return Promise.resolve([{ devise: 'USD', _sum: { montant: 500 } }]);
        }
        return Promise.resolve([]);
      }),
    },
    retrait: {
      groupBy: jest.fn().mockResolvedValue([]),
    },
    parametreEpargne: {
      findUnique: jest.fn().mockResolvedValue({
        valeur: JSON.stringify({ montant_min_depot_usd: 1, montant_min_depot_fc: 1000 })
      }),
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
    
    if (!adminToken || !membreToken) {
      throw new Error(`Login Admin: ${JSON.stringify(adminRes.body)} | Login Membre: ${JSON.stringify(membreRes.body)}`);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Protection globale ──────────────────────────────────────────────────
  describe('Protection JWT', () => {
    it('GET /api/epargnes — 401 sans token', () =>
      request(app.getHttpServer()).get('/api/epargnes').expect(401));

    it('GET /api/epargnes — 200 avec token admin', () =>
      request(app.getHttpServer())
        .get('/api/epargnes')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200));
  });

  // ─── RBAC & Création ──────────────────────────────────────────────────────
  describe('POST /api/epargnes — Création contrôlée', () => {
    const validDepot = { compte: 'MW-PRI-001', typeOperation: 'depot', devise: 'USD', montant: 50, dateOperation: '2026-03-12' };

    it('doit bloquer un membre qui tente de créer une transaction', () =>
      request(app.getHttpServer())
        .post('/api/epargnes')
        .set('Authorization', `Bearer ${membreToken}`)
        .send(validDepot)
        .expect(403));

    it('doit échouer si le montant ou la date manque (Validation DTO)', () =>
      request(app.getHttpServer())
        .post('/api/epargnes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validDepot, montant: undefined })
        .expect(400));

    it('doit autoriser un admin à créer un dépôt valide', () =>
      request(app.getHttpServer())
        .post('/api/epargnes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validDepot)
        .expect(201));

    it('doit bloquer un retrait si solde insuffisant', () =>
      request(app.getHttpServer())
        .post('/api/epargnes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validDepot, typeOperation: 'retrait', montant: 999999 })
        .expect(400)
        .expect(res => {
          expect(res.body.message).toMatch(/Solde insuffisant/i);
        }));
  });

  // ─── IDOR Protection ──────────────────────────────────────────────────────
  describe('GET /api/epargnes/soldes/:numero — protection IDOR', () => {
    it('doit autoriser un membre à consulter son propre solde', () =>
      request(app.getHttpServer())
        .get(`/api/epargnes/soldes/${mockMembre.numeroCompte}`)
        .set('Authorization', `Bearer ${membreToken}`)
        .expect(200));

    it('doit bloquer un membre qui consulte le solde d\'un autre (IDOR)', () =>
      request(app.getHttpServer())
        .get(`/api/epargnes/soldes/${mockMembre2.numeroCompte}`)
        .set('Authorization', `Bearer ${membreToken}`)
        .expect(403));

    it('doit autoriser un admin à consulter n\'importe quel solde', () =>
      request(app.getHttpServer())
        .get(`/api/epargnes/soldes/${mockMembre2.numeroCompte}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200));
  });

  describe('DELETE /api/epargnes/:id — Réservé Admin', () => {
    it('doit bloquer les membres', () =>
      request(app.getHttpServer())
        .delete('/api/epargnes/1')
        .set('Authorization', `Bearer ${membreToken}`)
        .expect(403));

    it('doit autoriser les admins', () =>
      request(app.getHttpServer())
        .delete('/api/epargnes/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200));
  });
});
