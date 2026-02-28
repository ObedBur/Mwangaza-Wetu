import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function initParams() {
    console.log('🌱 Initialisation des paramètres généraux...');
    
    const defaultParams = {
        solde_min_fc: 10000,
        solde_min_usd: 5,
        montant_min_retrait_fc: 5000,
        montant_min_retrait_usd: 5,
        limite_retrait_jour_fc: 50000000,
        limite_retrait_jour_usd: 5000000,
        max_retraits_par_jour: 5,
        montant_max_par_retrait_fc: 500000,
        montant_max_par_retrait_usd: 500,
        taux_usd_cdf: 2217.2680,
        heures_autorisees: { debut: '08:00', fin: '22:00' },
        motif_obligatoire: true,
        retraits: {
          frais_retrait: {
            FC: [
              { max: 50000, taux: 0.03 },
              { max: 500000, taux: 0.025 },
              { max: 999999999, taux: 0.02 },
            ],
            USD: [
              { max: 50, taux: 0.03 },
              { max: 500, taux: 0.025 },
              { max: 999999, taux: 0.02 },
            ],
          },
        },
    };

    await prisma.parametreEpargne.upsert({
        where: { nomParametre: 'parametres_generaux' },
        update: {},
        create: {
            nomParametre: 'parametres_generaux',
            valeur: JSON.stringify(defaultParams),
            description: 'Paramètres généraux de gestion de la coopérative'
        },
    });

    console.log('✅ Paramètres généraux initialisés !');
}

initParams()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
