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
  
  // Fetch dashboard data from API
  function fetchDashboardData() {
    fetch('/dashboard/data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        updateDashboard(data);
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
        document.querySelectorAll('.loading-indicator').forEach(el => {
          el.textContent = 'Error loading data. Please refresh the page.';
          el.style.color = '#e53935';
        });
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
  
  // Create project status chart
  function createProjectChart(projectStats) {
    const chartContainer = document.getElementById('project-stats-loading');
    if (chartContainer) {
      chartContainer.style.display = 'none';
    }
    
    const ctx = document.getElementById('projectStatusChart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['New', 'For Review', 'Ongoing', 'Completed'],
        datasets: [{
          data: [
            projectStats.newProjects || 0,
            projectStats.reviewProjects || 0,
            projectStats.ongoingProjects || 0,
            projectStats.completedProjects || 0
          ],
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
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
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
