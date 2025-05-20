import express from 'express';
import sql from 'mssql';
import { requireLogin } from '../middleware/auth.js';

const router = express.Router();

// Route to display the accreditor view page
router.get('/', requireLogin, async (req, res) => {
    try {
        // Log the user role for debugging
        console.log('User role:', req.session.user.role);
        
        // For now, allow all authenticated users to view the accreditor page
        // We'll keep this comment as a reminder that in production, we might want to restrict access
        // to only accreditors, document reviewers, and system admins
        
        // Fetch projects for review - UI only for now, no actual filtering by accreditor
        // This is a placeholder query that will be replaced with actual logic later
        const pool = await sql.connect();
        const result = await pool.request()
            .query(`SELECT * FROM Projects ORDER BY Created_AT DESC`);
        
        // Render the accreditor view page with projects
        res.render('accreditorView', {
            user: req.session.user,
            activePage: 'accreditor',
            page: 'accreditor',  // Add page variable for layout template
            title: 'Accreditor View',
            projects: result.recordset || [],
            error: null
        });
    } catch (error) {
        console.error('Error in accreditor view route:', error);
        res.status(500).render('accreditorView', {
            user: req.session.user,
            activePage: 'accreditor',
            page: 'accreditor',  // Add page variable for layout template
            title: 'Accreditor View',
            projects: [],
            error: 'An error occurred while loading projects.'
        });
    }
});

// Route to display the accreditor instrument page
router.get('/instrument/:projectId', requireLogin, async (req, res) => {
    try {
        // Log the user role for debugging
        console.log('User role:', req.session.user.role);
        
        const projectId = req.params.projectId;
        
        // Fetch project details - this is a placeholder query that will be replaced with actual logic later
        const pool = await sql.connect();
        const result = await pool.request()
            .input('projectId', sql.Int, projectId)
            .query(`SELECT * FROM Projects WHERE ProjectID = @projectId`);
        
        const project = result.recordset[0] || { Project_Name: 'Pacucoa_OCT2024' };
        
        // For now, we'll use placeholder data for tasks and documents
        // In a real implementation, these would be fetched from the database
        
        // Render the accreditor instrument page
        res.render('accreditorInstrument', {
            user: req.session.user,
            activePage: 'accreditor',
            page: 'accreditor',  // Add page variable for layout template
            title: 'Accreditor Instrument',
            projectName: project.Project_Name,
            projectId: projectId,
            // Placeholder data - would be replaced with database queries
            tasks: [],
            documents: [],
            evidenceUrl: '/static/evidence-placeholder.html',
            instrumentUrl: '/static/instrument-placeholder.html',
            error: null
        });
    } catch (error) {
        console.error('Error in accreditor instrument route:', error);
        res.status(500).render('accreditorInstrument', {
            user: req.session.user,
            activePage: 'accreditor',
            page: 'accreditor',  // Add page variable for layout template
            title: 'Accreditor Instrument',
            projectName: 'Error Loading Project',
            projectId: req.params.projectId,
            tasks: [],
            documents: [],
            evidenceUrl: '/static/evidence-placeholder.html',
            instrumentUrl: '/static/instrument-placeholder.html',
            error: 'An error occurred while loading project data.'
        });
    }
});

export default router;
