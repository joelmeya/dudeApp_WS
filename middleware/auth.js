// middleware/auth.js

// Middleware to check if user is logged in
export function requireLogin(req, res, next) {
    // Check for session-based authentication first
    if (req.session && req.session.user) {
        return next();
    }
    
    // Check for client-side authentication header
    const clientAuth = req.headers['x-client-auth'];
    if (clientAuth === 'true' && req.headers['x-user-email']) {
        // Create a temporary session user from the headers
        req.session.user = {
            email: req.headers['x-user-email'],
            name: req.headers['x-user-name'] || 'User',
            role: req.headers['x-user-role'] || 'User'
        };
        return next();
    }
    
    // No valid authentication found, redirect to login
    res.redirect('/');
}

// Middleware to check if user is admin
export function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'system_admin') {
        return next();
    } else {
        res.status(403).render('error', {
            message: 'Access Denied',
            error: { status: 403, stack: '' }
        });
    }
}

// Middleware to check if user has document admin role
export function requireDocumentAdmin(req, res, next) {
    if (req.session && req.session.user && 
        (req.session.user.role === 'system_admin' || req.session.user.role === 'document_admin')) {
        return next();
    } else {
        res.status(403).render('error', {
            message: 'Access Denied',
            error: { status: 403, stack: '' }
        });
    }
}
