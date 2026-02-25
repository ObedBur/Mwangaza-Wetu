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
