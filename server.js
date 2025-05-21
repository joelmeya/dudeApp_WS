// server.js
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import { connectToDatabase } from './db/sql.js';
import projectRoutes from './routes/projectRoutes.js';
import documentProjectsRoutes from './routes/documentProjectsRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import userRoutes from './routes/userRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import projectDetailsRoutes from './routes/projectDetailsRoutes.js';
import accreditorRoutes from './routes/accreditorRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';
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

// Configure session middleware with Vercel-friendly settings
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  rolling: true, // Reset expiration on every response
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/' // Ensure cookie is available on all paths
  },
  proxy: true // Trust the reverse proxy
}));

// Add security headers
app.use((req, res, next) => {
  res.set({
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff'
  });
  next();
});

// Middleware
app.use(express.urlencoded({ extended: true }));

// Add CORS headers for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-client-auth, x-user-email, x-user-name, x-user-role');
  
  // Log session info for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log('Session ID:', req.sessionID);
    console.log('Session User:', req.session?.user || 'No user');
    console.log('Auth Headers:', {
      clientAuth: req.headers['x-client-auth'],
      userEmail: req.headers['x-user-email']
    });
  }
  
  next();
});

app.use(express.json()); // Add JSON body parser for handling JSON requests

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  if (req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  next();
});

// Configure static file serving
const staticOptions = {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    // Enable CORS for static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
};

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public'), staticOptions));

// Fallback for static files
app.use('/public', express.static(path.join(__dirname, 'public'), staticOptions));

import expressLayouts from 'express-ejs-layouts';

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    state: err.state
  });

  // Handle SQL connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEOUT') {
    return res.status(503).render('error', {
      message: 'Database connection failed. Please try again later.',
      error: { status: 503 }
    });
  }

  // Handle other errors
  res.status(500).render('error', {
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
    error: {
      status: 500,
      stack: process.env.NODE_ENV === 'development' ? err.stack : ''
    }
  });
});

// Routes
app.use('/api/login', loginRoutes); // Restore the correct login endpoint
app.use('/projects', projectRoutes);
app.use('/documents', documentProjectsRoutes);
app.use('/users', userRoutes);
app.use('/api', apiRoutes);
app.use('/accreditor', accreditorRoutes);
app.use('/project-details', projectDetailsRoutes);

// Reports route - ensure it's properly registered for Vercel
app.use('/reports', reportsRoutes);

// Transactions route
app.use('/transactions', transactionsRoutes);

// Explicit route for Reports page to fix Vercel routing issues
app.get('/reports', (req, res, next) => {
  // This is a fallback in case the regular route doesn't work in Vercel
  // It will pass control to the reports router
  reportsRoutes(req, res, next);
});

// Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  });

// Dashboard Route
app.get('/dashboard', async (req, res) => {
  try {
    // Check if user is logged in via session
    if (!req.session.user) {
      console.log('No session user found, checking for auth header');
      
      // Check for authorization header as fallback (for Vercel deployment)
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No valid auth header found, redirecting to login');
        return res.redirect('/');
      }
      
      // Extract and validate token (simple check for demo purposes)
      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.redirect('/');
      }
      
      // Create a temporary session user from the token
      // In a real app, you would validate this token properly
      try {
        // For demo purposes, we'll just check if it's a valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(token)) {
          req.session.user = {
            email: token,
            role: 'User'
          };
        } else {
          return res.redirect('/');
        }
      } catch (tokenError) {
        console.error('Token validation error:', tokenError);
        return res.redirect('/');
      }
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
