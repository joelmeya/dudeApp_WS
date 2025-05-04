// routes/projectRoutes.js
import express from 'express';
import { sql as dbSql } from '../db/sql.js';
import mssql from 'mssql';

const router = express.Router();

export { router as default };

// POST /api/login
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await sql.query`
      SELECT * FROM tbl_users
      WHERE email = ${email} AND password = ${password}
    `;

    if (result.recordset.length > 0) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

