
const { Client } = require('pg');
require('dotenv').config();

async function checkDb() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        
        console.log('--- TABLES ---');
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log(tablesRes.rows.map(r => r.table_name).join(', '));

        console.log('\n--- COLUMN TYPES FOR epargnes (montant) ---');
        console.log('\n--- UNIQUE INDEX FOR membres (telephone) ---');
        const indexRes = await client.query(`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'membres' AND indexdef LIKE '%telephone%'
        `);
        console.table(indexRes.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkDb();
