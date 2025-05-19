import express from 'express';
import sql from 'mssql';
import { requireLogin } from '../middleware/auth.js';

const router = express.Router();

// Route to display the accreditor view page
router.get('/', requireLogin, async (req, res) => {
    try {
        // Check if user is an accreditor or document reviewer
        const userRole = req.session.user.role.toLowerCase();
        if (userRole !== 'accreditor' && userRole !== 'document_reviewer') {
            // Log the user role for debugging
            console.log('User role:', req.session.user.role);
            
            // If not authorized, redirect to appropriate page based on role
            if (userRole === 'system_admin') {
                return res.redirect('/admin');
            } else {
                return res.redirect('/documents');
            }
        }
        
        // Render the accreditor view page
        res.render('accreditorView', {
            user: req.session.user,
            activePage: 'accreditor',
            title: 'Accreditor View'
        });
    } catch (error) {
        console.error('Error in accreditor view route:', error);
        res.status(500).render('error', {
            message: 'An error occurred while loading the Accreditor View page.',
            error: error
        });
    }
});

export default router;
