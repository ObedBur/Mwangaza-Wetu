require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const Database = require('better-sqlite3');
const path = require('path');

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});
const sqlitePath = 'D:\\Mwangaza\\Mwangaza-wetu\\Backend\\database.db';
const db = new Database(sqlitePath);

async function migrate() {
    console.log('--- Démarrage de la migration des données (JS) ---');

    try {
        // 1. Migration des Administrateurs
        const admins = db.prepare('SELECT * FROM administrateurs').all();
        console.log(`Migration de ${admins.length} administrateurs...`);
        for (const admin of admins) {
            await prisma.administrateur.upsert({
                where: { email: admin.email },
                update: {},
                create: {
                    nom: admin.nom,
                    prenom: admin.prenom,
                    email: admin.email,
                    telephone: admin.telephone,
                    motDePasse: admin.mot_de_passe,
                    role: admin.role,
                    actif: Boolean(admin.actif),
                    numeroCompte: admin.numero_compte,
                    userId: admin.userId,
                    dateCreation: new Date(admin.date_creation || admin.created_at || Date.now()),
                }
            });
        }

        // 2. Migration des Sections
        const sections = db.prepare('SELECT * FROM sections').all();
        console.log(`Migration de ${sections.length} sections...`);
        for (const section of sections) {
            await prisma.section.upsert({
                where: { nom: section.nom },
                update: {},
                create: {
                    nom: section.nom,
                    numeroCompte: section.numero_compte,
                    solde: section.solde || 0,
                }
            });
        }

        // 3. Migration des Membres
        const membres = db.prepare('SELECT * FROM membres').all();
        console.log(`Migration de ${membres.length} membres...`);
        for (const membre of membres) {
            await prisma.membre.upsert({
                where: { numeroCompte: membre.numero_compte },
                update: {},
                create: {
                    numeroCompte: membre.numero_compte,
                    nomComplet: membre.nom_complet,
                    dateAdhesion: new Date(membre.date_adhesion),
                    telephone: membre.telephone,
                    email: membre.email,
                    adresse: membre.adresse,
                    sexe: membre.sexe === 'M' || membre.sexe === 'F' ? membre.sexe : null,
                    typeCompte: membre.type_compte,
                    statut: membre.statut === 'actif' ? 'actif' : 'inactif',
                    photoProfil: membre.photo_profil,
                    userId: membre.userId,
                    motDePasse: membre.mot_de_passe,
                    dateNaissance: membre.date_naissance ? new Date(membre.date_naissance) : null,
                    idNationale: membre.id_nationale,
                }
            });
        }

        // 4. Migration des Épargnes
        const epargnes = db.prepare('SELECT * FROM epargnes').all();
        console.log(`Migration de ${epargnes.length} opérations d'épargne...`);
        for (const ep of epargnes) {
            await prisma.epargne.create({
                data: {
                    compte: ep.compte,
                    typeOperation: ep.type_operation === 'depot' ? 'depot' : 'retrait',
                    devise: ep.devise === 'FC' ? 'FC' : 'USD',
                    montant: ep.montant,
                    dateOperation: new Date(ep.date_operation),
                    description: ep.description,
                }
            });
        }

        console.log('--- Migration terminée avec succès ! ---');
    } catch (error) {
        console.error('Erreur lors de la migration:', error);
    } finally {
        await prisma.$disconnect();
        db.close();
    }
}

migrate();
