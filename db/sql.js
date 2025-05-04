// db/sql.js
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: false, // true if Azure, false for local
    trustServerCertificate: true, // needed for self-signed certs
  },
};

async function connectToDatabase() {
  try {
    await sql.connect(config);
    console.log('Connected to MSSQL Database ✅');
  } catch (err) {
    console.error('Database connection failed ❌:', err);
  }
}

export { sql, config, connectToDatabase };
