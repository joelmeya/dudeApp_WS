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
            projectId: req.params.id,
            formSuccess: req.query.success === 'true',
            formError: req.query.error
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

// Route to handle task update form submission
router.post('/:id/update-task', requireLogin, async (req, res) => {
    try {
        const projectId = req.params.id;
        const taskId = req.body.taskId;
        const { taskStatus, percentageDropdown, documentUrl1, documentUrl2 } = req.body;
        
        console.log('Task update data received:', {
            projectId,
            taskId,
            taskStatus,
            percentageCompleted: percentageDropdown,
            documentUrl1,
            documentUrl2
        });
        
        // In a real implementation, this would update the database
        // For now, we'll just redirect back with a success parameter for alertify
        
        res.redirect(`/project-details/${projectId}?success=true`);
    } catch (err) {
        console.error('Error updating task:', err);
        res.redirect(`/project-details/${req.params.id}?error=Failed to update task`);
    }
});

export default router;
