import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export function query(text, params) {
  return pool.query(text, params);
}

export default pool;
