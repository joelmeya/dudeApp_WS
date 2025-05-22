// routes/dashboardRoutes.js
import express from 'express';
import { sql, config } from '../db/sql.js';
import { requireLogin } from '../middleware/auth.js';
import mssql from 'mssql';

const router = express.Router();

// Get dashboard data
router.get('/data', requireLogin, async (req, res) => {
  // Create a new SQL connection for this request to ensure serverless compatibility
  let pool = null;
  
  try {
    const userEmail = req.session.user.email;
    const userRole = req.session.user.role;
    
    // Initialize data object with defaults
    const dashboardData = {
      userCounts: {
        systemAdmins: 0,
        documentAdmins: 0,
        totalUsers: 0
      },
      projectStats: {
        newProjects: 0,
        reviewProjects: 0,
        ongoingProjects: 0,
        completedProjects: 0,
        totalProjects: 0
      },
      recentActivity: [],
      userTasks: []
    };

    // Ensure we have a database connection for serverless environment
    if (!sql.connected) {
      console.log('Creating new database connection for dashboard data');
      pool = await new mssql.ConnectionPool(config).connect();
    }
    
    // Use the appropriate connection
    const currentSql = pool || sql;
    
    // Get user counts with error handling
    try {
      const userCountsResult = await currentSql.query`
        SELECT 
          COUNT(CASE WHEN role = 'system_admin' THEN 1 END) as systemAdmins,
          COUNT(CASE WHEN role = 'document_admin' THEN 1 END) as documentAdmins,
          COUNT(*) as totalUsers
        FROM tbl_users
      `;
      
      if (userCountsResult && userCountsResult.recordset && userCountsResult.recordset.length > 0) {
        dashboardData.userCounts = userCountsResult.recordset[0];
      }
    } catch (userCountsError) {
      console.error('Error fetching user counts:', userCountsError);
      // Continue with defaults
    }

    // Get project statistics with error handling
    try {
      const projectStatsResult = await currentSql.query`
        SELECT 
          COUNT(CASE WHEN Status = 'New' THEN 1 END) as newProjects,
          COUNT(CASE WHEN Status = 'For Review' THEN 1 END) as reviewProjects,
          COUNT(CASE WHEN Status = 'Ongoing' THEN 1 END) as ongoingProjects,
          COUNT(CASE WHEN Status = 'Completed' THEN 1 END) as completedProjects,
          COUNT(*) as totalProjects
        FROM Projects
      `;
      
      if (projectStatsResult && projectStatsResult.recordset && projectStatsResult.recordset.length > 0) {
        dashboardData.projectStats = projectStatsResult.recordset[0];
      }
    } catch (projectStatsError) {
      console.error('Error fetching project statistics:', projectStatsError);
      // Continue with defaults
    }

    // Get recent activity from transaction logs with error handling
    try {
      const recentActivityResult = await currentSql.query`
        SELECT TOP 5 
          TransactionType, 
          TransactionDetails, 
          UserEmail, 
          DateTimeLogs
        FROM TransactionLogs 
        ORDER BY DateTimeLogs DESC
      `;
      
      if (recentActivityResult && recentActivityResult.recordset) {
        dashboardData.recentActivity = recentActivityResult.recordset;
      }
    } catch (activityError) {
      console.error('Error fetching recent activity:', activityError);
      // Continue with empty activity list
    }

    // Get user-specific tasks based on role
    try {
      if (userRole === 'system_admin' || userRole === 'document_admin') {
        // For admins, get recent projects
        try {
          const projectsResult = await currentSql.query`
            SELECT TOP 5 
              ProjectID, 
              Project_Name, 
              Project_Type, 
              Status, 
              Created_AT
            FROM Projects 
            ORDER BY Created_AT DESC
          `;
          
          if (projectsResult && projectsResult.recordset) {
            dashboardData.userProjects = projectsResult.recordset;
          }
        } catch (projectsError) {
          console.error('Error fetching admin projects:', projectsError);
          dashboardData.userProjects = [];
        }
      } else {
        // For regular users, get their assigned tasks
        try {
          const tasksResult = await currentSql.query`
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
          
          if (tasksResult && tasksResult.recordset) {
            dashboardData.userTasks = tasksResult.recordset;
          }
        } catch (taskError) {
          console.error('Error fetching user tasks:', taskError);
          dashboardData.userTasks = [];
        }
      }
    } catch (userSpecificError) {
      console.error('Error fetching user-specific content:', userSpecificError);
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
  } finally {
    // Close the connection pool if we created one
    if (pool) {
      try {
        await pool.close();
        console.log('Closed dashboard data connection pool');
      } catch (closeError) {
        console.error('Error closing dashboard connection pool:', closeError);
      }
    }
  }
});

export default router;
