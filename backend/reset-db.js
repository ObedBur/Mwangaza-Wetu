/**
 * Script pour réinitialiser la base de données
 * Usage: node reset-db.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🧹 Début du nettoyage de la base de données...\n');

    // Supprimer tous les enregistrements
    const tables = [
      'delegue',
      'remboursement', 
      'hypotheque',
      'credit',
      'epargne',
      'retrait',
      'membre',
      'parametre',
      'admin',
    ];

    for (const table of tables) {
      try {
        const count = await prisma[table].deleteMany({});
        console.log(`✅ ${table}: ${count.count} enregistrement(s) supprimé(s)`);
      } catch (error) {
        // Ignorer les erreurs si la table n'existe pas
        console.log(`⏭️  ${table}: non applicable`);
      }
    }

    console.log('\n✨ Base de données réinitialisée avec succès !');
    console.log('🚀 Vous pouvez maintenant créer de nouveaux comptes.');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
