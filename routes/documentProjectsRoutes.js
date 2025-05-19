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
        
        // Add detailed logging for debugging
        console.log('New project submission data:', {
            projectName,
            projectType,
            details: details ? details.substring(0, 50) + '...' : null,
            date
        });

        // Validate required fields
        if (!projectName || !projectType || !date) {
            console.log('Missing required fields:', {
                hasProjectName: !!projectName,
                hasProjectType: !!projectType,
                hasDate: !!date
            });
            return res.redirect('/documents?error=Missing+required+fields');
        }
        
        // Validate project type is one of the allowed values
        const allowedTypes = ['AACCUP', 'ISO', 'PACUCOA'];
        if (!allowedTypes.includes(projectType)) {
            console.log('Invalid project type:', projectType);
            return res.redirect('/documents?error=Invalid+project+type');
        }
        
        // Insert new project into database
        console.log('Attempting to insert project with type:', projectType);
        const result = await sql.query`
            INSERT INTO Projects (Project_Name, Project_Type, Details, Date, Status, Created_AT)
            VALUES (${projectName}, ${projectType}, ${details || null}, ${date}, 'NEW', GETDATE())
        `;
        
        console.log('Insert result:', result);
        
        // Get the newly created project
        //const newProject = result.recordset[0];
        
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
        
        // Log more detailed error information
        if (error.number) {
            console.error('SQL Error Number:', error.number);
        }
        if (error.state) {
            console.error('SQL Error State:', error.state);
        }
        if (error.class) {
            console.error('SQL Error Class:', error.class);
        }
        if (error.lineNumber) {
            console.error('SQL Error Line Number:', error.lineNumber);
        }
        if (error.serverName) {
            console.error('SQL Server Name:', error.serverName);
        }
        if (error.procName) {
            console.error('SQL Procedure Name:', error.procName);
        }
        
        // Check if there are any constraints or triggers causing issues
        try {
            const constraintCheck = await sql.query`
                SELECT name, type_desc 
                FROM sys.objects 
                WHERE parent_object_id = OBJECT_ID('Projects') 
                AND type_desc LIKE '%CONSTRAINT%'
            `;
            console.log('Project table constraints:', constraintCheck.recordset);
        } catch (constraintError) {
            console.error('Error checking constraints:', constraintError);
        }
        
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
        
        // Redirect back to the Document Projects page with error message
        return res.redirect('/documents?error=' + encodeURIComponent('Error adding project: ' + error.message));
    }
});

export default router;
