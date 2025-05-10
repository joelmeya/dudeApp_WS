import express from 'express';
import { sql } from '../db/sql.js';

const router = express.Router();

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Users page route
router.get('/', requireLogin, async (req, res) => {
    try {
        // Query to fetch all users from tbl_users
        const result = await sql.query`
            SELECT 
                id,
                name,
                email,
                role,
                status,
                last_login
            FROM tbl_users
            ORDER BY name ASC
        `;

        // Format the data for display
        const users = result.recordset.map(user => ({
            ...user,
            last_login: user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'
        }));

        res.render('users', { 
            user: req.session.user, 
            page: 'users',
            users: users
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).render('error', { 
            message: 'Error fetching users',
            error: err,
            user: req.session.user
        });
    }
});

// Add new user route
router.post('/add', requireLogin, async (req, res) => {
    try {
        const { name, email, role } = req.body;

        console.log('Received data:', { name, email, role });

        // Validate input
        if (!name || !email || !role) {
            throw new Error('Missing required fields');
        }

        // Insert new user into tbl_users
        console.log('Attempting to insert user...');
        const result = await sql.query`
            INSERT INTO tbl_users (name, email, role, status)
            OUTPUT INSERTED.id
            VALUES (${name}, ${email}, ${role}, 'active');
        `;

        const newUserId = result.recordset[0].id;

        // Fetch the newly created user
        const newUser = await sql.query`
            SELECT id, name, email, role, status, last_login
            FROM tbl_users
            WHERE id = ${newUserId}
        `;

        res.json({
            success: true,
            user: {
                ...newUser.recordset[0],
                last_login: 'Never'
            }
        });
    } catch (err) {
        console.error('Error adding new user:', err);
        
        let errorMessage = 'Failed to add new user';
        let statusCode = 500;

        if (err.message === 'Missing required fields') {
            errorMessage = 'Please fill in all required fields';
            statusCode = 400;
        } else if (err.number === 2627) { // SQL Server unique constraint violation
            errorMessage = 'A user with this email already exists';
            statusCode = 409;
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
});

export default router;
