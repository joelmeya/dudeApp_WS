import express from 'express';
import { requireLogin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireLogin, (req, res) => {
    res.render('documentProjects', {
        title: 'Document Projects',
        activePage: 'documents',
        page: 'documents',
        user: req.session.user || null
    });
});

export default router;
