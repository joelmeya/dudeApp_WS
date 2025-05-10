// db/sql.js
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 300000, // 5 minutes
    connectionTimeout: 60000, // 1 minute
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 300000, // 5 minutes
      acquireTimeoutMillis: 60000 // 1 minute
    },
    maxRetriesOnTransientErrors: 5,
    retryIntervalInMilliseconds: 5000
  },
  stream: false, // Disable streaming for better stability
  parseJSON: true
};

async function connectToDatabase() {
  try {
    if (sql.connected) {
      console.log('Already connected to MSSQL Database');
      return;
    }
    await sql.connect(config);
    console.log('Connected to MSSQL Database ✅');
  } catch (err) {
    console.error('Database connection failed ❌:', err);
    throw err; // Rethrow to handle it in the server
  }
}

export { sql, config, connectToDatabase };
