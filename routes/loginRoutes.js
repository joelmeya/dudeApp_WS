// routes/loginRoutes.js
import express from 'express';
import { sql } from '../db/sql.js';
import mssql from 'mssql';
import * as bcrypt from 'bcrypt';

const router = express.Router();

export { router as default };

// POST /api/login
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // First check if user exists
    const result = await sql.query`
      SELECT * FROM tbl_users
      WHERE email = ${email}
    `;

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      
      // Check if password is hashed (bcrypt hash starts with '$2b$')
      let isValidPassword = false;
      if (user.password.startsWith('$2b$')) {
        // For hashed passwords, use bcrypt
        isValidPassword = await bcrypt.compare(password, user.password);
      } else {
        // For unhashed passwords, direct comparison
        isValidPassword = password === user.password;
      }
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Update last login time
      await sql.query`
        UPDATE tbl_users
        SET last_login = GETDATE()
        WHERE email = ${email}
      `;
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
    // Log detailed error for debugging in Vercel
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      state: err.state
    });
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

