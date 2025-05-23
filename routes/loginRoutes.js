// routes/loginRoutes.js
import express from 'express';
import { sql, config } from '../db/sql.js';
import mssql from 'mssql';
import * as bcrypt from 'bcrypt';

const router = express.Router();

export { router as default };

// POST /api/login
router.post('/', async (req, res) => {
  console.log('Login attempt received:', { email: req.body.email });
  
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Login failed: Missing credentials');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Ensure database connection
    if (!sql.connected) {
      console.log('Reconnecting to database...');
      await sql.connect(config);
    }

    // First check if user exists
    console.log('Querying database for user...');
    const result = await sql.query`
      SELECT * FROM tbl_users
      WHERE email = ${email}
    `;

    if (result.recordset.length === 0) {
      console.log('Login failed: User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.recordset[0];
    console.log('User found, verifying password...');

    // Check if password is hashed (bcrypt hash starts with '$2b$')
    let isValidPassword = false;
    try {
      if (user.password.startsWith('$2b$')) {
        // For hashed passwords, use bcrypt
        isValidPassword = await bcrypt.compare(password, user.password);
      } else {
        // For unhashed passwords, direct comparison
        isValidPassword = password === user.password;
      }
    } catch (hashError) {
      console.error('Password verification error:', hashError);
      return res.status(500).json({ message: 'Error verifying password' });
    }

    if (!isValidPassword) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login time
    console.log('Password verified, updating last login time...');
    try {
      await sql.query`
        UPDATE tbl_users
        SET last_login = GETDATE()
        WHERE email = ${email}
      `;
    } catch (updateError) {
      console.error('Error updating last login time:', updateError);
      // Continue with login even if update fails
    }

    // Set session
    console.log('Setting up user session...');
    console.log('User data from database:', user);
    req.session.user = {
      email: email,
      name: user.Name || user.FullName,
      role: user.role || 'User',
      fullName: user.FullName
    };
    console.log('Session user created with role:', req.session.user.role);

    // Save session explicitly
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          reject(err);
          return;
        }
        resolve();
      });
    });

    // Debug logging
    console.log('Login Session Set:', req.session.user);
    console.log('Session ID:', req.session.id);

    // Determine redirect URL based on user role
    console.log('User role for redirect:', user.role);
    // Determine redirect URL based on role (case insensitive)
    const userRoleLower = user.role ? user.role.toLowerCase() : '';
    let redirectUrl = '/dashboard';
    
    if (userRoleLower === 'accreditor') {
      redirectUrl = '/accreditor';
    } else if (userRoleLower === 'admin_assistant') {
      redirectUrl = '/documents';
    }
    console.log('User role (lowercase):', userRoleLower);
    console.log('Redirect URL determined:', redirectUrl);
    
    return res.json({
      message: 'Login successful',
      user: req.session.user,
      redirectUrl: redirectUrl,
      sessionId: req.session.id
    });
  } catch (err) {
    console.error('Login error:', {
      message: err.message,
      code: err.code,
      state: err.state,
      stack: err.stack
    });
    // Handle specific database errors
    if (err.code === 'ECONNRESET' || err.code === 'ETIMEOUT') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again.'
      });
    }

    // Handle other errors
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'production' 
        ? 'Server error during login' 
        : err.message 
    });
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

