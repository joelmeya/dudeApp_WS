// server.js
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import { connectToDatabase } from './db/sql.js';
import projectRoutes from './routes/projectRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import userRoutes from './routes/userRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from 'mssql';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Secure Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret', // Use env var
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    httpOnly: true, // Prevent client-side JS from accessing cookie
    sameSite: 'strict' // Protect against CSRF
  }
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

import expressLayouts from 'express-ejs-layouts';

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');


// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke! 😱');
});

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/login', loginRoutes);
app.use('/users', userRoutes);

// Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  });

// Dashboard Route
app.get('/dashboard', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.redirect('/');
    }

    // Prepare database query
    const request = new sql.Request();
    const userEmail = req.session.user.email;

    // Query to verify user exists in database
    const result = await request
      .input('email', sql.VarChar, userEmail)
      .query(`
        SELECT email, Name, role
        FROM tbl_users 
        WHERE email = @email
      `);

    // Prepare user object
    const user = result.recordset.length > 0
      ? {
          ...req.session.user,
          name: result.recordset[0].Name || req.session.user.name,
          role: result.recordset[0].role || req.session.user.role
        }
      : req.session.user;

    // Render dashboard with user data
    res.render('dashboard', {
      user: user,
      page: 'dashboard'
    });
  } catch (error) {
    // Log error details
    console.error('Dashboard Route Error', {
      message: error.message,
      stack: error.stack,
      userEmail: req.session?.user?.email || 'No user'
    });

    // Send error response
    res.status(500).render('error', {
      message: 'An error occurred while loading the dashboard',
      error: error
    });
  }
});

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Start the server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectToDatabase();
  console.log('Server is fully initialized and ready to accept connections.');
});
