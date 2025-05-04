// routes/loginRoutes.js
import express from 'express';
import { sql } from '../db/sql.js';
import mssql from 'mssql';
import * as bcrypt from 'bcrypt';

const router = express.Router();

export default router;

// POST /api/login
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await sql.query`
      SELECT * FROM tbl_users
      WHERE email = ${email} AND password = ${password}
    `;

    if (result.recordset.length > 0) {
      req.session.user = {
        email: email,
        name: result.recordset[0].Name || result.recordset[0].FullName,
        role: result.recordset[0].role || 'User',
        fullName: result.recordset[0].FullName
      };
      
      // Debug logging
      console.log('Login Session Set:', req.session.user);
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

// POST /api/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      res.status(500).send('Logout failed');
    } else {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out' });
    }
  });
});

