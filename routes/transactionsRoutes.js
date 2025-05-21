// routes/transactionsRoutes.js
import express from 'express';
import { requireLogin } from '../middleware/auth.js';

const router = express.Router();

// Route to render the transactions page
router.get('/', requireLogin, async (req, res) => {
    try {
        res.render('transactions', {
            title: 'Transactions',
            page: 'transactions'
        });
    } catch (error) {
        console.error('Error rendering transactions page:', error);
        res.status(500).render('error', {
            message: 'Error loading transactions page',
            error: { status: 500, stack: error.stack }
        });
    }
});

export default router;
