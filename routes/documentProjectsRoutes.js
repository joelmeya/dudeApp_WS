import express from 'express';
import { requireLogin } from '../middleware/auth.js';
import { sql } from '../db/sql.js';

const router = express.Router();

// Main Document Projects page route
router.get('/', requireLogin, async (req, res) => {
    try {
        const { projectName, projectType, status } = req.query;
        
        // Build the SQL query based on search filters
        let query = `
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
            WHERE 1=1
        `;
        
        const params = [];
        
        // Add search conditions if filters are provided
        if (projectName && projectName.trim() !== '') {
            query += ` AND Project_Name LIKE @projectName`;
            params.push({ name: 'projectName', value: `%${projectName}%` });
        }
        
        if (projectType && projectType.trim() !== '') {
            query += ` AND Project_Type = @projectType`;
            params.push({ name: 'projectType', value: projectType });
        }
        
        if (status && status.trim() !== '') {
            query += ` AND Status = @status`;
            params.push({ name: 'status', value: status });
        }
        
        // Add order by clause
        query += ` ORDER BY Created_AT DESC`;
        
        // Create a request with the SQL Server connection
        const request = new sql.Request();
        
        // Add parameters to the request
        params.forEach(param => {
            request.input(param.name, param.value);
        });
        
        // Execute the query
        const result = await request.query(query);
        
        // Render the page with the projects data and search filters
        return res.render('documentProjects', {
            title: 'Document Projects',
            activePage: 'documents',
            page: 'documents',
            user: req.session.user || null,
            projects: result.recordset || [],
            filters: { projectName, projectType, status },
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
            filters: {},
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
