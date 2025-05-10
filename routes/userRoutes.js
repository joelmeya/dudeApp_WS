import express from 'express';
import sql from 'mssql';

const router = express.Router();

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    next();
};

// Users page route
router.get('/', requireLogin, async (req, res) => {
    try {
        // For now, we'll just render the page without data
        res.render('users', {
            user: req.session.user,
            page: 'users'
        });
    } catch (error) {
        console.error('Users Route Error:', error);
        res.status(500).render('error', { 
            message: 'Error loading users page',
            error: error
        });
    }
});

export default router;
