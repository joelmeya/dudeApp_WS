import express from 'express';
import { requireLogin } from '../middleware/auth.js';
import { sql } from '../db/sql.js';

const router = express.Router();

// Main Document Projects page route
router.get('/', requireLogin, async (req, res) => {
    console.log('Document Projects page requested');
    
    try {
        // Fetch all projects from the database
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
        
        // Render the page with the projects data
        return res.render('documentProjects', {
            title: 'Document Projects',
            activePage: 'documents',
            page: 'documents',
            user: req.session.user || null,
            projects: result.recordset || [],
            error: null
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        
        // Render the page with an error message
        return res.render('documentProjects', {
            title: 'Document Projects',
            activePage: 'documents',
            page: 'documents',
            user: req.session.user || null,
            projects: [],
            error: 'Failed to fetch projects. Please try again later.'
        });
    }
});

// Add new project endpoint
// Add new project endpoint - uses traditional form submission for reliability
// This approach is compatible with serverless environments like Vercel
router.post('/add', requireLogin, async (req, res) => {

    try {
        // Extract data from request body
        const { projectName, projectType, details, date } = req.body;
        

        // Validate required fields
        if (!projectName || !projectType || !date) {

            return res.redirect('/documents');
        
        }
        
        // Insert new project into database
        const result = await sql.query`
            INSERT INTO Projects (Project_Name, Project_Type, Details, Date, Status, Created_AT)
            OUTPUT INSERTED.ProjectID, INSERTED.Project_Name, INSERTED.Project_Type, INSERTED.Details, INSERTED.Date, INSERTED.Status, INSERTED.Created_AT
            VALUES (${projectName}, ${projectType}, ${details || null}, ${date}, 'NEW', GETDATE())
        `;
        
        // Get the newly created project
        const newProject = result.recordset[0];
        
        // Fetch all projects again
        const allProjects = await sql.query`
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
        
        // Redirect back to the Document Projects page
        return res.redirect('/documents');
    } catch (error) {
        console.error('Error adding new project:', error);
        
        // Fetch all projects again
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
        
        // Redirect back to the Document Projects page
        return res.redirect('/documents');
    }
});

export default router;
