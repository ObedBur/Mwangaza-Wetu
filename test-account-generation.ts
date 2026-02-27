/**
 * Script de test pour vérifier l'incrémentation des numéros de compte
 * Usage: npx ts-node test-account-generation.ts
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const ACCOUNT_TYPES = [
  { value: 'PRINCIPAL', label: 'Épargne', prefix: 'P' },
  { value: 'KELASI', label: 'Scolaire', prefix: 'K' },
  { value: 'NYUMBA', label: 'Logement', prefix: 'N' },
  { value: 'HOPITAL', label: 'Santé', prefix: 'H' },
  { value: 'MUTOTO', label: 'Junior', prefix: 'M' },
  { value: 'BIASHARA', label: 'Affaires', prefix: 'B' },
];

interface MemberRecord {
  id: number;
  numeroCompte: string;
  nomComplet: string;
  typeCompte?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

async function testAccountGeneration() {
  console.log('🧪 Démarrage des tests d\'incrémentation des numéros de compte...\n');

  try {
    // 1. Récupérer tous les membres
    console.log('📥 Étape 1: Récupération de tous les membres...');
    const membersResponse = await axios.get<PaginatedResponse<MemberRecord>>(
      `${API_BASE_URL}/membres?pageSize=1000`
    );
    
    const members = membersResponse.data.data || [];
    console.log(`✅ ${members.length} membres trouvés\n`);

    if (members.length === 0) {
      console.log('⚠️  Aucun membre dans la base de données. Impossible de tester.');
      return;
    }

    // 2. Analyser les comptes par type
    console.log('📊 Étape 2: Analyse des comptes existants par type:\n');
    
    const accountsByType: Record<string, MemberRecord[]> = {};
    ACCOUNT_TYPES.forEach(type => {
      accountsByType[type.prefix] = [];
    });

    members.forEach(member => {
      console.log(`  - ${member.numeroCompte}: ${member.nomComplet}`);
      const prefix = member.numeroCompte?.split('-')[1];
      if (prefix && accountsByType[prefix]) {
        accountsByType[prefix].push(member);
      }
    });

    console.log('\n📈 Résumé par type de compte:');
    ACCOUNT_TYPES.forEach(type => {
      const count = accountsByType[type.prefix].length;
      console.log(`  ${type.prefix} (${type.label}): ${count} compte(s)`);
      if (accountsByType[type.prefix].length > 0) {
        const lastNumbers = accountsByType[type.prefix]
          .map(m => {
            const match = m.numeroCompte?.match(/-(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .sort((a, b) => b - a);
        console.log(`     → Numéros: ${lastNumbers.join(', ')}`);
      }
    });

    // 3. Tester la génération pour chaque type
    console.log('\n🔧 Étape 3: Test de génération pour chaque type:\n');

    const today = new Date().toISOString().split('T')[0];

    for (const type of ACCOUNT_TYPES) {
      try {
        const genResponse = await axios.get(
          `${API_BASE_URL}/membres/generate-numero`,
          {
            params: {
              section: type.value,
              year: new Date().getFullYear()
            }
          }
        );

        const generated = genResponse.data.numero;
        console.log(`  ✅ ${type.prefix} (${type.label}): ${generated}`);

        // Vérifier le format
        if (!generated.includes(`COOP-${type.prefix}-`)) {
          console.log(`     ⚠️  Format attendu: COOP-${type.prefix}-YYYY-NNNN`);
          console.log(`     📌 Format reçu: ${generated}`);
        }
      } catch (error: any) {
        console.log(`  ❌ ${type.prefix} (${type.label}): Erreur`);
        console.log(`     ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n✨ Tests terminés!');

  } catch (error: any) {
    console.error('❌ Erreur lors des tests:');
    if (error.response?.data) {
      console.error('  Backend:', error.response.data);
    } else {
      console.error('  ', error.message);
    }
    process.exit(1);
  }
}

// Exécuter les tests
testAccountGeneration();
