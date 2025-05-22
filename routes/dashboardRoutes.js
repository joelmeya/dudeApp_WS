// routes/dashboardRoutes.js
import express from 'express';
import { sql } from '../db/sql.js';
import { requireLogin } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard data
router.get('/data', requireLogin, async (req, res) => {
  try {
    const userEmail = req.session.user.email;
    const userRole = req.session.user.role;
    
    // Initialize data object
    const dashboardData = {
      userCounts: {},
      projectStats: {},
      recentActivity: [],
      userTasks: []
    };

    // Get user counts
    const userCountsResult = await sql.query`
      SELECT 
        COUNT(CASE WHEN role = 'system_admin' THEN 1 END) as systemAdmins,
        COUNT(CASE WHEN role = 'document_admin' THEN 1 END) as documentAdmins,
        COUNT(*) as totalUsers
      FROM tbl_users
    `;
    
    dashboardData.userCounts = userCountsResult.recordset[0];

    // Get project statistics
    const projectStatsResult = await sql.query`
      SELECT 
        COUNT(CASE WHEN Status = 'New' THEN 1 END) as newProjects,
        COUNT(CASE WHEN Status = 'For Review' THEN 1 END) as reviewProjects,
        COUNT(CASE WHEN Status = 'Ongoing' THEN 1 END) as ongoingProjects,
        COUNT(CASE WHEN Status = 'Completed' THEN 1 END) as completedProjects,
        COUNT(*) as totalProjects
      FROM Projects
    `;
    
    dashboardData.projectStats = projectStatsResult.recordset[0] || {
      newProjects: 0,
      reviewProjects: 0,
      ongoingProjects: 0,
      completedProjects: 0,
      totalProjects: 0
    };

    // Get recent activity from transaction logs
    const recentActivityResult = await sql.query`
      SELECT TOP 5 
        TransactionType, 
        TransactionDetails, 
        UserEmail, 
        DateTimeLogs
      FROM TransactionLogs 
      ORDER BY DateTimeLogs DESC
    `;
    
    dashboardData.recentActivity = recentActivityResult.recordset;

    // Get user-specific tasks based on role
    try {
      if (userRole === 'system_admin' || userRole === 'document_admin') {
        // For admins, get recent projects
        const projectsResult = await sql.query`
          SELECT TOP 5 
            ProjectID, 
            Project_Name, 
            Project_Type, 
            Status, 
            Created_AT
          FROM Projects 
          ORDER BY Created_AT DESC
        `;
        
        dashboardData.userProjects = projectsResult.recordset;
      } else {
        // For regular users, get their assigned tasks
        try {
          const tasksResult = await sql.query`
            SELECT TOP 5 
              t.Task_id, 
              t.Task_title, 
              t.Task_description, 
              t.Task_status, 
              p.Project_Name as ProjectName
            FROM Tasks t
            JOIN task_assignedUsers ta ON t.Task_id = ta.task_id
            JOIN Projects p ON t.Project_id = p.ProjectID
            WHERE ta.user_email = ${userEmail}
            ORDER BY t.Task_duedate
          `;
          
          dashboardData.userTasks = tasksResult.recordset;
        } catch (taskError) {
          console.error('Error fetching user tasks:', taskError);
          dashboardData.userTasks = [];
        }
      }
    } catch (projectError) {
      console.error('Error fetching user projects:', projectError);
      dashboardData.userProjects = [];
      dashboardData.userTasks = [];
    }

    // Return the dashboard data
    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard data', 
      error: process.env.NODE_ENV === 'production' ? {} : error 
    });
  }
});

export default router;
