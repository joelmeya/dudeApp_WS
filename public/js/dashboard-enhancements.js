// dashboard-enhancements.js - Enhances the dashboard with dynamic data

document.addEventListener('DOMContentLoaded', () => {
  // Only run on dashboard page
  if (!window.location.pathname.includes('/dashboard')) {
    return;
  }

  // Create dashboard enhancement container
  const dashboardContent = document.querySelector('.dashboard-content');
  if (!dashboardContent) return;

  // Add enhanced dashboard section after the existing content
  const enhancedDashboard = document.createElement('div');
  enhancedDashboard.className = 'enhanced-dashboard';
  enhancedDashboard.innerHTML = `
    <div class="dashboard-row">
      <!-- Project Status Chart -->
      <div class="dashboard-card">
        <h3>Project Status</h3>
        <div class="chart-container">
          <canvas id="projectStatusChart"></canvas>
        </div>
        <div id="project-stats-loading" class="loading-indicator">Loading...</div>
      </div>
      
      <!-- Recent Activity -->
      <div class="dashboard-card">
        <h3>Recent Activity</h3>
        <div id="recent-activity-list" class="activity-list">
          <div class="loading-indicator">Loading...</div>
        </div>
      </div>
    </div>
  `;
  
  // Add the enhanced dashboard after the existing content
  dashboardContent.appendChild(enhancedDashboard);
  
  // Add CSS for the enhanced dashboard
  const style = document.createElement('style');
  style.textContent = `
    .enhanced-dashboard {
      margin-top: 15px;
      border-top: 1px solid #eaeaea;
      padding-top: 10px;
    }
    
    .dashboard-row {
      display: flex;
      gap: 15px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    
    .dashboard-card {
      flex: 1;
      min-width: 280px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 12px;
    }
    
    .dashboard-card h3 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #444;
      font-size: 16px;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
    }
    
    .chart-container {
      height: 180px;
    }
    
    .activity-list {
      max-height: 180px;
      overflow-y: auto;
    }
    
    .activity-item {
      padding: 6px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 13px;
    }
    
    .activity-item:last-child {
      border-bottom: none;
    }
    
    .activity-time {
      font-size: 11px;
      color: #888;
    }
    
    /* Status colors for chart and activity items */
    .status-new {
      background: #e3f2fd;
      color: #1976d2;
    }
    
    .status-review {
      background: #fff8e1;
      color: #ff8f00;
    }
    
    .status-ongoing {
      background: #e8f5e9;
      color: #388e3c;
    }
    
    .status-completed {
      background: #efebe9;
      color: #5d4037;
    }
    
    .loading-indicator {
      text-align: center;
      color: #888;
      padding: 20px 0;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .dashboard-row {
        flex-direction: column;
      }
      
      .dashboard-card {
        margin-bottom: 20px;
      }
    }
  `;
  
  document.head.appendChild(style);
  
  // Load Chart.js if not already loaded
  if (!window.Chart) {
    const chartScript = document.createElement('script');
    chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    chartScript.onload = fetchDashboardData;
    document.head.appendChild(chartScript);
  } else {
    fetchDashboardData();
  }
  
  // Fetch dashboard data from API with enhanced error handling for Vercel
  function fetchDashboardData() {
    // Add a timeout to prevent hanging in serverless environments
    const fetchPromise = fetch('/dashboard/data');
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), 8000)
    );
    
    Promise.race([fetchPromise, timeoutPromise])
      .then(response => {
        if (!response.ok) {
          // For Vercel serverless functions, provide more helpful error message
          if (response.status === 500 || response.status === 504) {
            throw new Error('Server temporarily unavailable. This is normal during cold starts.');
          }
          throw new Error('Network response was not ok: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        // Check if data has expected structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format received');
        }
        updateDashboard(data);
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
        // Show a more user-friendly error message
        const errorMessage = error.message.includes('cold starts') 
          ? 'Dashboard data is loading. This may take a moment on first load...' 
          : 'Unable to load dashboard data. Please try again later.';
        
        document.querySelectorAll('.loading-indicator').forEach(el => {
          el.textContent = errorMessage;
          el.style.color = error.message.includes('cold starts') ? '#fb8c00' : '#e53935';
        });
        
        // For cold start issues, retry after a delay
        if (error.message.includes('cold starts') || error.message.includes('timed out')) {
          setTimeout(fetchDashboardData, 5000);
        }
      });
  }
  
  // Update dashboard with fetched data
  function updateDashboard(data) {
    // Update existing cards with real data
    updateExistingCards(data.userCounts);
    
    // Create project status chart
    createProjectChart(data.projectStats);
    
    // Update recent activity
    updateRecentActivity(data.recentActivity);
  }
  
  // Update existing dashboard cards with real data
  function updateExistingCards(userCounts) {
    const cards = document.querySelectorAll('.card-value');
    if (cards.length >= 3) {
      // System Admins
      cards[0].textContent = userCounts.systemAdmins || '0';
      
      // Document Admins
      cards[1].textContent = userCounts.documentAdmins || '0';
      
      // Total Users
      cards[2].textContent = userCounts.totalUsers || '0';
    }
  }
  
  // Create project status chart with enhanced error handling
  function createProjectChart(projectStats) {
    try {
      const chartContainer = document.getElementById('project-stats-loading');
      if (chartContainer) {
        chartContainer.style.display = 'none';
      }
      
      const canvas = document.getElementById('projectStatusChart');
      if (!canvas) {
        console.error('Chart canvas element not found');
        return;
      }
      
      const ctx = canvas.getContext('2d');
      
      // Ensure we have valid data
      const stats = projectStats || {
        newProjects: 0,
        reviewProjects: 0,
        ongoingProjects: 0,
        completedProjects: 0
      };
      
      // Extract data with fallbacks
      const data = [
        parseInt(stats.newProjects) || 0,
        parseInt(stats.reviewProjects) || 0,
        parseInt(stats.ongoingProjects) || 0,
        parseInt(stats.completedProjects) || 0
      ];
      
      // Check if all values are zero
      const allZero = data.every(val => val === 0);
      
      // If all values are zero, show placeholder data
      const displayData = allZero ? [1, 1, 1, 1] : data;
      
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['New', 'For Review', 'Ongoing', 'Completed'],
          datasets: [{
            data: displayData,
            backgroundColor: [
              '#42a5f5', // blue for new
              '#ffca28', // amber for review
              '#66bb6a', // green for ongoing
              '#78909c'  // blue-grey for completed
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = allZero ? 0 : (context.raw || 0);
                  const total = allZero ? 0 : context.dataset.data.reduce((a, b) => a + b, 0);
                  
                  if (allZero) {
                    return `${label}: No data available`;
                  }
                  
                  const percentage = total === 0 ? 0 : Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    } catch (chartError) {
      console.error('Error creating project chart:', chartError);
      const chartContainer = document.getElementById('project-stats-loading');
      if (chartContainer) {
        chartContainer.textContent = 'Unable to display chart. Please try again later.';
        chartContainer.style.display = 'block';
        chartContainer.style.color = '#e53935';
      }
    }
  }
  
  // Update recent activity list
  function updateRecentActivity(activities) {
    const activityList = document.getElementById('recent-activity-list');
    activityList.innerHTML = '';
    
    if (!activities || activities.length === 0) {
      activityList.innerHTML = '<div class="activity-item">No recent activity found.</div>';
      return;
    }
    
    activities.forEach(activity => {
      const activityItem = document.createElement('div');
      activityItem.className = 'activity-item';
      
      // Format the date
      const activityDate = new Date(activity.DateTimeLogs);
      const timeAgo = getTimeAgo(activityDate);
      
      // Create more compact readable activity description
      let description = activity.TransactionDetails;
      if (description.length > 70) {
        description = description.substring(0, 67) + '...';
      }
      
      // Extract just the username from email for more compact display
      const userEmail = activity.UserEmail || '';
      const username = userEmail.split('@')[0] || userEmail;
      
      activityItem.innerHTML = `
        <div>${description}</div>
        <div class="activity-time">
          ${username} • ${timeAgo}
        </div>
      `;
      
      activityList.appendChild(activityItem);
    });
  }
  
  // Note: User tasks and projects sections have been removed as requested
  
  // Helper function to format time ago
  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? '1 year ago' : interval + ' years ago';
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1 ? '1 month ago' : interval + ' months ago';
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? '1 day ago' : interval + ' days ago';
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? '1 hour ago' : interval + ' hours ago';
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1 ? '1 minute ago' : interval + ' minutes ago';
    }
    
    return seconds < 10 ? 'just now' : seconds + ' seconds ago';
  }
});
