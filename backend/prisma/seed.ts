import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


async function main() {
    console.log('🌱 Start seeding...');

    // Hacher le mot de passe pour le super admin
    const hashedSuperAdminPassword = await bcrypt.hash('Admin@2026', 10);

    // Création du Super Admin
    const superAdmin = await prisma.administrateur.upsert({
        where: { email: 'superadmin@mwangaza.cd' },
        update: {},
        create: {
            nom: 'MWANGAZA',
            prenom: 'SuperAdmin',
            email: 'superadmin@mwangaza.cd',
            telephone: '+243000000000',
            motDePasse: hashedSuperAdminPassword,
            role: 'superadmin',
            actif: true,
            userId: 'SA-001',
        },
    });
    console.log(`✅ Super Admin created: ${superAdmin.email}`);

    // Hacher le mot de passe pour un admin standard
    const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);

    // Création d'un Admin standard
    const admin = await prisma.administrateur.upsert({
        where: { email: 'admin@mwangaza.cd' },
        update: {},
        create: {
            nom: 'KASANGA',
            prenom: 'Jean',
            email: 'admin@mwangaza.cd',
            telephone: '+243999999999',
            motDePasse: hashedAdminPassword,
            role: 'admin',
            actif: true,
            userId: 'AD-001',
        },
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // --- INITIALISATION DES SECTIONS ET COMPTES SYSTÈME ---
    console.log('🔄 Initialisation des sections et comptes système...');
    const sections = [
        { nom: 'PRINCIPAL', code: 'PRI' },
        { nom: 'KELASI', code: 'KEL' },
        { nom: 'NYUMBA', code: 'NYU' },
        { nom: 'HOPITAL', code: 'HOP' },
        { nom: 'BIASHARA', code: 'BIA' },
        { nom: 'MUTOTO', code: 'MUT' },
    ];
    
    for (const sec of sections) {
        const sectionTrigram = sec.code;
        const compteCollectif = `MW-${sectionTrigram}-SECTION-0000`;
        const revenueAccount = `MW-${sectionTrigram}-REVENUS`;

        // 1. Créer/Mettre à jour la Section
        await prisma.section.upsert({
            where: { nom: sec.nom },
            update: { numeroCompte: compteCollectif },
            create: {
                nom: sec.nom,
                numeroCompte: compteCollectif,
                solde: 0,
            },
        });

        // 2. Créer le compte Membre lié au collectif
        await prisma.membre.upsert({
            where: { numeroCompte: compteCollectif },
            update: {},
            create: {
                numeroCompte: compteCollectif,
                nomComplet: `Compte Collectif ${sec.nom}`,
                typeCompte: sec.nom,
                telephone: '000000',
                dateAdhesion: new Date(),
                statut: 'actif',
            }
        });

        // 3. Créer le compte de REVENUS de la section
        await prisma.membre.upsert({
            where: { numeroCompte: revenueAccount },
            update: {},
            create: {
                numeroCompte: revenueAccount,
                nomComplet: `REVENUS ${sec.nom}`,
                typeCompte: sec.nom,
                telephone: '000000',
                dateAdhesion: new Date(),
                statut: 'actif',
            }
        });
        console.log(`✅ Section ${sec.nom} prête (Collectif: ${compteCollectif}, Revenus: ${revenueAccount})`);
    }

    // Création du compte GLOBAL CONSOLIDÉ
    await prisma.membre.upsert({
        where: { numeroCompte: 'MW-REVENUS-GLOBAL' },
        update: {},
        create: {
            numeroCompte: 'MW-REVENUS-GLOBAL',
            nomComplet: 'REVENUS GLOBAL CONSOLIDÉ',
            typeCompte: 'SYSTEME',
            telephone: '000000',
            dateAdhesion: new Date(),
            statut: 'actif'
        }
    });

    console.log('✅ Tous les comptes système sont prêts.');

    console.log('🏁 Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
