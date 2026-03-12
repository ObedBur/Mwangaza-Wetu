import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Withdrawals (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let membreToken: string;

  const mockAdmin = {
    id: 11,
    email: 'withdraw-admin@mwangaza.cd',
    motDePasse: '',
    actif: true,
    role: 'admin',
    nom: 'Admin',
    prenom: 'Withdraw',
    numeroCompte: 'MW-A-WD',
  };

  const mockMembre = {
    id: 30,
    email: 'withdraw-membre@mwangaza.cd',
    telephone: '+243813000001',
    motDePasse: '',
    statut: 'actif',
    nomComplet: 'Membre Withdraw',
    numeroCompte: 'MW-PRI-WD1',
    typeCompte: 'PRINCIPAL',
    firstAcces: false,
  };

  const mockMembre2 = {
    id: 31,
    email: 'withdraw-membre2@mwangaza.cd',
    telephone: '+243813000002',
    motDePasse: '',
    statut: 'actif',
    nomComplet: 'Membre Withdraw 2',
    numeroCompte: 'MW-PRI-WD2',
    typeCompte: 'ORDINAIRE',
    firstAcces: false,
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
      create: jest.fn().mockResolvedValue({ id: 1 }),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    membre: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where?.numeroCompte === mockMembre.numeroCompte || where?.id === mockMembre.id) return Promise.resolve(mockMembre);
        if (where?.numeroCompte === mockMembre2.numeroCompte || where?.id === mockMembre2.id) return Promise.resolve(mockMembre2);
        return Promise.resolve(null);
      }),
    },
    epargne: {
      create: jest.fn().mockResolvedValue({ id: 1 }),
      aggregate: jest.fn().mockResolvedValue({ _sum: { montant: 0 } }),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    retrait: {
      create: jest.fn().mockResolvedValue({
        id: 50,
        compte: mockMembre.numeroCompte,
        montant: 10,
        devise: 'USD',
        dateOperation: new Date(),
        frais: 0.3,
        soldeAvant: 100,
        soldeApres: 89.7,
      }),
      findMany: jest.fn().mockResolvedValue([]),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    revenu: {
      create: jest.fn().mockResolvedValue({ id: 1 }),
    },
    revenuType: {
      findFirst: jest.fn().mockResolvedValue({ id: 1, nom: 'Système Retrait' }),
    },
    credit: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    parametreEpargne: {
      findUnique: jest.fn().mockResolvedValue({
        valeur: JSON.stringify({
          montant_min_retrait_usd: 1,
          montant_max_par_retrait_usd: 1000,
          solde_min_usd: 5,
          limite_retrait_jour_usd: 2000,
        }),
      }),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeAll(async () => {
    mockAdmin.motDePasse = await bcrypt.hash('Admin@123', 10);
    mockMembre.motDePasse = await bcrypt.hash('Membre@123', 10);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const adminRes = await request(app.getHttpServer())
      .post('/api/auth/admin/login')
      .send({ email: mockAdmin.email, password: 'Admin@123' });
    adminToken = adminRes.body.token;

    const membreRes = await request(app.getHttpServer())
      .post('/api/auth/membre/login')
      .send({ numeroCompte: mockMembre.numeroCompte, password: 'Membre@123' });
    membreToken = membreRes.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/withdrawals', () => {
    it('doit rejeter un membre (403)', () =>
      request(app.getHttpServer())
        .get('/api/withdrawals')
        .set('Authorization', `Bearer ${membreToken}`)
        .expect(403));

    it('doit autoriser un admin (200)', () =>
      request(app.getHttpServer())
        .get('/api/withdrawals')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200));
  });

  describe('GET /api/withdrawals/compte/:compte', () => {
    it('doit autoriser un membre à voir son propre historique', () =>
      request(app.getHttpServer())
        .get(`/api/withdrawals/compte/${mockMembre.numeroCompte}`)
        .set('Authorization', `Bearer ${membreToken}`)
        .expect(200));

    it('doit bloquer un membre sur un autre compte (IDOR - 403)', () =>
      request(app.getHttpServer())
        .get(`/api/withdrawals/compte/${mockMembre2.numeroCompte}`)
        .set('Authorization', `Bearer ${membreToken}`)
        .expect(403));
  });

  describe('POST /api/withdrawals', () => {
    const validWithdrawal = {
      compte: mockMembre.numeroCompte,
      montant: 10,
      devise: 'USD',
      dateOperation: '2026-03-12',
      description: 'E2E Test',
    };

    it('doit bloquer la création par un membre (403)', () =>
      request(app.getHttpServer())
        .post('/api/withdrawals')
        .set('Authorization', `Bearer ${membreToken}`)
        .send(validWithdrawal)
        .expect(403));

    it('doit autoriser la création par un admin (201)', () => {
      // Pour simuler un solde suffisant dans BalancesService
      // Nous avons mocké epargne.groupBy pour qu'il renvoie un solde positif par défaut
      mockPrismaService.epargne.groupBy.mockResolvedValueOnce([
        { typeOperation: 'depot', devise: 'USD', _sum: { montant: 500 } }
      ]);

      return request(app.getHttpServer())
        .post('/api/withdrawals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validWithdrawal)
        .expect(201)
        .expect((res) => {
          expect(res.body.amount).toBe(10);
          expect(res.body.frais).toBeDefined();
        });
    });

    it('doit échouer si solde insuffisant (400)', () => {
      mockPrismaService.epargne.groupBy.mockResolvedValueOnce([
          { typeOperation: 'depot', devise: 'USD', _sum: { montant: 5 } }
      ]);

      return request(app.getHttpServer())
        .post('/api/withdrawals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validWithdrawal, montant: 100 })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toMatch(/Solde insuffisant/i);
        });
    });
  });
});
