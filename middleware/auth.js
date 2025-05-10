// middleware/auth.js

// Middleware to check if user is logged in
export function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
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
