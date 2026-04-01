import { Client } from 'pg';
import fs from 'fs';

async function run() {
  const connectionString = 'postgresql://postgres:Aztere39573%40@db.fsogymxttriasxuujlzf.supabase.co:5432/postgres';
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const sql = fs.readFileSync('supabase_schema_v2.sql', 'utf8');
    await client.connect();
    console.log('Executing JSON state schema...');
    await client.query(sql);
    console.log('Schema executed successfully!');
  } catch (err) {
    console.error('Error executing schema:', err);
  } finally {
    await client.end();
  }
}

run();
