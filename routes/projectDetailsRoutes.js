import express from 'express';

const router = express.Router();

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
};

// Test login route for debugging
router.get('/test-login', (req, res) => {
    // Set a test user session
    req.session.user = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'Admin',
        fullName: 'Test User'
    };
    
    // Save session and redirect to project details
    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).send('Error setting session');
        }
        console.log('Test login successful, session set:', req.session.user);
        res.redirect('/project-details/7');
    });
});

// Project Details page route
router.get('/:id', requireLogin, async (req, res) => {
    try {
        // Log session information for debugging
        console.log('Session user in project details route:', req.session.user);
        console.log('Session ID:', req.session.id);
        
        // For now, we're just rendering the UI without any actual data
        // In the future, we'll fetch project details using req.params.id
        
        res.render('projectDetails', { 
            user: req.session.user, 
            page: 'projectDetails',
            projectId: req.params.id
        });
    } catch (err) {
        console.error('Error loading project details:', err);
        res.status(500).render('error', { 
            message: 'Error loading project details',
            error: err,
            user: req.session.user
        });
    }
});

export default router;
