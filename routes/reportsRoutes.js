import express from 'express';
import sql from 'mssql';
import { requireLogin } from '../middleware/auth.js';

const router = express.Router();

// Route to display the reports page
router.get('/', requireLogin, async (req, res) => {
    try {
        // Get sort parameters from query string
        const sortColumn = req.query.sort || 'Created_AT';
        const sortOrder = req.query.order || 'DESC';
        
        // Validate sort parameters to prevent SQL injection
        const validColumns = ['Project_Name', 'Project_Type', 'Status', 'Date', 'Created_AT'];
        const validOrders = ['ASC', 'DESC'];
        
        const column = validColumns.includes(sortColumn) ? sortColumn : 'Created_AT';
        const order = validOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
        
        console.log(`Sorting by ${column} ${order}`);
        
        // Connect to database
        const pool = await sql.connect();
        
        // Fetch all projects with their tasks to calculate completion percentage
        const result = await pool.request().query(`
            SELECT 
                p.ProjectID,
                p.Project_Name,
                p.Project_Type,
                p.Details,
                p.Date,
                p.Status,
                p.Created_AT,
                (
                    SELECT AVG(ISNULL(t.Completion_percentage, 0))
                    FROM Tasks t
                    WHERE t.ProjectID = p.ProjectID
                ) AS Completion_Percentage
            FROM Projects p
            ORDER BY p.${column} ${order}
        `);
        
        // Format the completion percentage to 2 decimal places
        const projects = result.recordset.map(project => ({
            ...project,
            Completion_Percentage: project.Completion_Percentage ? parseFloat(project.Completion_Percentage).toFixed(2) : '0.00'
        }));
        
        // Render the reports page with projects
        res.render('reports', {
            user: req.session.user,
            activePage: 'reports',
            page: 'reports',
            title: 'Reports',
            projects: projects || [],
            sortColumn: column,
            sortOrder: order,
            error: null
        });
    } catch (error) {
        console.error('Error in reports route:', error);
        res.status(500).render('reports', {
            user: req.session.user,
            activePage: 'reports',
            page: 'reports',
            title: 'Reports',
            projects: [],
            sortColumn: 'Created_AT',
            sortOrder: 'DESC',
            error: 'An error occurred while loading reports.'
        });
    }
});

// Route to view project tasks on a dedicated page
router.get('/project-tasks/:projectId', requireLogin, async (req, res) => {
    try {
        const projectId = req.params.projectId;
        
        // Connect to database
        const pool = await sql.connect();
        
        // Fetch project details
        const projectResult = await pool.request()
            .input('projectId', sql.Int, projectId)
            .query(`
                SELECT 
                    ProjectID,
                    Project_Name,
                    Project_Type,
                    Details,
                    Date,
                    Status
                FROM Projects
                WHERE ProjectID = @projectId
            `);
        
        if (projectResult.recordset.length === 0) {
            return res.status(404).render('error', {
                message: 'Project not found',
                error: { status: 404 }
            });
        }
        
        const project = projectResult.recordset[0];
        
        // Fetch tasks for the specified project
        const tasksResult = await pool.request()
            .input('projectId', sql.Int, projectId)
            .query(`
                SELECT 
                    TaskID,
                    Task_Name,
                    Description,
                    Status,
                    Completion_percentage,
                    Created_At,
                    Updated_At
                FROM Tasks
                WHERE ProjectID = @projectId
                ORDER BY Created_At DESC
            `);
        
        // Render the project tasks page
        res.render('projectTasks', {
            title: `${project.Project_Name} - Tasks`,
            project: project,
            tasks: tasksResult.recordset,
            activePage: 'reports'
        });
    } catch (error) {
        console.error('Error fetching project tasks:', error);
        res.status(500).render('error', {
            message: 'Error fetching project tasks',
            error: { status: 500, stack: error.stack }
        });
    }
});

// Route to export reports data to CSV
router.get('/export-csv', requireLogin, async (req, res) => {
    try {
        // Connect to database
        const pool = await sql.connect();
        
        // Fetch all projects with their tasks to calculate completion percentage
        const result = await pool.request().query(`
            SELECT 
                p.ProjectID,
                p.Project_Name,
                p.Project_Type,
                p.Details,
                p.Date,
                p.Status,
                p.Created_AT,
                (
                    SELECT AVG(ISNULL(t.Completion_percentage, 0))
                    FROM Tasks t
                    WHERE t.ProjectID = p.ProjectID
                ) AS Completion_Percentage
            FROM Projects p
            ORDER BY p.Created_AT DESC
        `);
        
        // Format the data for CSV export
        const projects = result.recordset.map(project => {
            // Calculate ageing days
            let ageingDays = 'N/A';
            if (project.Date) {
                const today = new Date();
                const accreditationDate = new Date(project.Date);
                const timeDiff = accreditationDate - today;
                ageingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if (ageingDays < 0) {
                    ageingDays = ageingDays + ' days overdue';
                } else {
                    ageingDays = ageingDays + ' days';
                }
            }
            
            return {
                'Project Name': project.Project_Name || '',
                'Type': project.Project_Type || '',
                'Details': project.Details || '',
                'Accreditation Date': project.Date ? new Date(project.Date).toLocaleDateString() : 'Not set',
                'Ageing': ageingDays,
                'Status': project.Status || '',
                'Completion %': project.Completion_Percentage ? parseFloat(project.Completion_Percentage).toFixed(2) + '%' : '0.00%'
            };
        });
        
        // Create CSV content
        let csvContent = '';
        
        // Add headers
        if (projects.length > 0) {
            csvContent += Object.keys(projects[0]).join(',') + '\n';
        }
        
        // Add rows
        projects.forEach(project => {
            const row = Object.values(project).map(value => {
                // Escape commas and quotes in values
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            }).join(',');
            csvContent += row + '\n';
        });
        
        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=reports_' + new Date().toISOString().slice(0, 10) + '.csv');
        
        // Send CSV content
        res.send(csvContent);
    } catch (error) {
        console.error('Error exporting reports to CSV:', error);
        res.status(500).send('Error exporting reports to CSV: ' + error.message);
    }
});

export default router;
