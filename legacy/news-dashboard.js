// News Dashboard JavaScript

async function loadNewsDashboard() {
  try {
    // Show loading state
    document.querySelectorAll('.loading').forEach(el => {
      el.innerHTML = '<div style="text-align: center; padding: 20px; color: #6b7280;">Loading news data...</div>';
    });
    
    // Load news data
    const res = await fetch('./news-data.json?_=' + Date.now());
    
    if (!res.ok) {
      throw new Error(`Failed to load news: ${res.status}`);
    }
    
    newsData = await res.json();
    
    // Update header
    document.getElementById('updatedTime').textContent = formatTime(newsData.generated_at);
    document.getElementById('totalArticles').textContent = newsData.summary.total_articles;
    document.getElementById('overallSentiment').textContent = newsData.summary.overall_sentiment.toUpperCase();
    document.getElementById('breakingNews').textContent = newsData.summary.breaking_news_count;
    
    // Render all components
    renderAll();
    
    console.log('News dashboard loaded successfully');
    
  } catch (error) {
    console.error('Error loading news dashboard:', error);
    
    // Show error state
    document.querySelectorAll('.card > div:not(.card-header)').forEach(el => {
      el.innerHTML = `<div class="breaking-news">
        Failed to load news data: ${error.message}
        <br><small>Try refreshing the page</small>
      </div>`;
    });
  }
}

function renderAll() {
  renderSentimentOverview();
  renderBreakingNews();
  renderCategoryDistribution();
  renderTopArticles();
  renderMarketContext();
  renderWatchItems();
}

// Utility functions
function formatTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadNewsDashboard();
  
  // Auto-refresh every 15 minutes
  setInterval(loadNewsDashboard, 900000);
});

// Make functions available globally
window.loadNewsDashboard = loadNewsDashboard;
window.formatTime = formatTime;