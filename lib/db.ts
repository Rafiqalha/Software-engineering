import { Pool } from 'pg';

// Fallback logic so it doesn't crash during build or locally without DB
const connectionString = 
  process.env.DATABASE_URL || 
  'postgresql://postgres:postgres@localhost:5432/evalora';

const pool = new Pool({
  connectionString,
  // Add SSL for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

export default pool;
