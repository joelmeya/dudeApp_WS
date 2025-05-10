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

export default router;
