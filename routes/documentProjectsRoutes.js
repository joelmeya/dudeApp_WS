import express from 'express';
import { requireLogin } from '../middleware/auth.js';
import { sql } from '../db/sql.js';

const router = express.Router();

router.get('/', requireLogin, async (req, res) => {
    try {
        // Query to fetch all projects
        const result = await sql.query`
            SELECT 
                ProjectID,
                Project_Name,
                Project_Type,
                Details,
                Date,
                Status,
                Acc_URL,
                Created_AT
            FROM Projects
            ORDER BY Created_AT DESC
        `;

        // Render the view with the projects data
        res.render('documentProjects', {
            title: 'Document Projects',
            activePage: 'documents',
            page: 'documents',
            user: req.session.user || null,
            projects: result.recordset || [],
            error: null
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.render('documentProjects', {
            title: 'Document Projects',
            activePage: 'documents',
            page: 'documents',
            user: req.session.user || null,
            projects: [],
            error: 'Failed to load projects. Please try again later.'
        });
    }
});

export default router;
