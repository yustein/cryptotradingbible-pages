// COMPLETE ENHANCED DASHBOARD JAVASCRIPT
// Combines all rendering functions for market data, news, cryptobible insights, and analytics

let dashboardData = null;
let newsData = null;

function normalizeWarningEntry(entry) {
    if (!entry) return null;
    if (typeof entry === 'string') {
        try {
            return normalizeWarningEntry(JSON.parse(entry));
        } catch {
            return { symbol: 'Warning', warning: 'Market warning', description: entry, severity: 'medium' };
        }
    }
    if (typeof entry === 'object') {
        return {
            symbol: entry.symbol || entry.asset || 'Market',
            warning: entry.warning || entry.title || 'Warning',
            description: entry.description || entry.message || entry.details || entry.warning || 'Warning',
            severity: String(entry.severity || 'medium').toLowerCase()
        };
    }
    return { symbol: 'Warning', warning: 'Market warning', description: String(entry), severity: 'medium' };
}

// ==================== CORE FUNCTIONS ====================

function loadDashboard() {
    console.log('Loading complete dashboard data...');
    
    // Load market data
    fetch('dashboard-enhanced.json')
        .then(response => response.json())
        .then(data => {
            dashboardData = data;
            console.log('Market data loaded:', data.summary.version);
            
            // Update header
            updateHeader();
            
            // Render all market sections
            renderLiquidityHeatmap();
            renderOrderFlowAnalysis();
            renderMarketStructure();
            renderRiskAssessment();
            renderCryptobibleInsights();
            renderTechnicalAnalysis();
            renderAssetPerformance();
            renderTradingSignals();
            
            // Load news data
            return fetch('news-data.json');
        })
        .then(response => response.json())
        .then(data => {
            newsData = data;
            console.log('News data loaded:', data.summary.total_articles, 'articles');
            
            // Render news sections
            renderNewsSentiment();
            renderBreakingNews();
            renderNewsCategories();
            
            console.log('Dashboard fully loaded!');
        })
        .catch(error => {
            console.error('Error loading dashboard:', error);
            document.getElementById('liquidityHeatmap').innerHTML = 
                '<div class="insight danger">Error loading data. Please refresh.</div>';
        });
}

function updateHeader() {
    if (!dashboardData || !dashboardData.summary) return;
    
    const summary = dashboardData.summary;
    
    // Update headline
    document.getElementById('headline').textContent = 'Complete Market Terminal v2.01';
    document.getElementById('subheadline').textContent = 
        'Advanced analytics with liquidity heatmaps, order flow, cryptobible insights, and news intelligence';
    
    // Update metadata
    document.getElementById('updatedLocal').textContent = formatTime(dashboardData.generated_at_local);
    document.getElementById('trackedAssets').textContent = summary.tracked_assets;
    document.getElementById('marketBias').textContent = summary.market_bias;
    document.getElementById('version').textContent = summary.version;
}

// ==================== MARKET DATA RENDERING ====================

function renderLiquidityHeatmap() {
    const el = document.getElementById('liquidityHeatmap');
    if (!dashboardData || !dashboardData.enhanced_metrics?.liquidity_heatmap) {
        el.innerHTML = '<div class="loading">Loading liquidity data...</div>';
        return;
    }
    
    const heatmap = dashboardData.enhanced_metrics.liquidity_heatmap;
    let html = '';
    
    // Support zones
    if (heatmap.support_zones?.length) {
        html += '<div style="margin-bottom: 16px;"><div style="font-weight: 600; color: var(--success); margin-bottom: 8px;">Support Zones</div>';
        heatmap.support_zones.slice(0, 3).forEach(zone => {
            html += `<div class="liquidity-zone support">
                <div>${zone.symbol} @ ${formatPrice(zone.price)}</div>
                <div style="font-size: 12px; color: var(--success);">${zone.strength}</div>
            </div>`;
        });
        html += '</div>';
    }
    
    // Resistance zones
    if (heatmap.resistance_zones?.length) {
        html += '<div><div style="font-weight: 600; color: var(--danger); margin-bottom: 8px;">Resistance Zones</div>';
        heatmap.resistance_zones.slice(0, 3).forEach(zone => {
            html += `<div class="liquidity-zone resistance">
                <div>${zone.symbol} @ ${formatPrice(zone.price)}</div>
                <div style="font-size: 12px; color: var(--danger);">${zone.strength}</div>
            </div>`;
        });
        html += '</div>';
    }
    
    if (!html) {
        html = '<div class="insight">No liquidity zones detected in current market</div>';
    }
    
    el.innerHTML = html;
}

function renderOrderFlowAnalysis() {
    const el = document.getElementById('orderFlowAnalysis');
    if (!dashboardData || !dashboardData.enhanced_metrics?.order_flow) {
        el.innerHTML = '<div class="loading">Loading order flow data...</div>';
        return;
    }
    
    const flow = dashboardData.enhanced_metrics.order_flow;
    let html = '';
    
    html += `<div class="metric">
        <div class="label">Market Makers</div>
        <div class="value ${flow.maker_ratio > 0.5 ? 'positive' : 'neutral'}">${(flow.maker_ratio * 100).toFixed(1)}%</div>
    </div>`;
    
    html += `<div class="metric">
        <div class="label">Takers</div>
        <div class="value ${flow.taker_ratio > 0.5 ? 'negative' : 'neutral'}">${(flow.taker_ratio * 100).toFixed(1)}%</div>
    </div>`;
    
    html += `<div class="metric">
        <div class="label">Flow Imbalance</div>
        <div class="value ${flow.imbalance > 0 ? 'positive' : flow.imbalance < 0 ? 'negative' : 'neutral'}">
            ${flow.imbalance > 0 ? '+' : ''}${(flow.imbalance * 100).toFixed(1)}%
        </div>
    </div>`;
    
    html += `<div class="metric">
        <div class="label">Volume Ratio</div>
        <div class="value">${flow.volume_ratio.toFixed(2)}</div>
    </div>`;
    
    // Insight
    if (flow.insight) {
        html += `<div class="insight ${flow.imbalance > 0.2 ? 'warning' : flow.imbalance < -0.2 ? 'danger' : ''}">
            ${flow.insight}
        </div>`;
    }
    
    el.innerHTML = html;
}

function renderMarketStructure() {
    const el = document.getElementById('marketStructure');
    if (!dashboardData || !dashboardData.enhanced_metrics?.market_structure) {
        el.innerHTML = '<div class="loading">Loading market structure...</div>';
        return;
    }
    
    const structure = dashboardData.enhanced_metrics.market_structure;
    let html = '<div class="three-layer">';
    
    // Structural Layer
    html += `<div class="layer structure">
        <h3>Structural Layer</h3>
        <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">Price levels & trends</div>`;
    
    if (structure.structural?.length) {
        structure.structural.slice(0, 2).forEach(item => {
            html += `<div style="margin: 4px 0; padding: 4px; background: #f0f9ff; border-radius: 4px; font-size: 12px;">
                ${item}
            </div>`;
        });
    }
    html += '</div>';
    
    // Participant Layer
    html += `<div class="layer participant">
        <h3>Participant Layer</h3>
        <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">Who's trading</div>`;
    
    if (structure.participant?.length) {
        structure.participant.slice(0, 2).forEach(item => {
            html += `<div style="margin: 4px 0; padding: 4px; background: #f0fdf4; border-radius: 4px; font-size: 12px;">
                ${item}
            </div>`;
        });
    }
    html += '</div>';
    
    // Psychological Layer
    html += `<div class="layer psychological">
        <h3>Psychological Layer</h3>
        <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">Market sentiment</div>`;
    
    if (structure.psychological?.length) {
        structure.psychological.slice(0, 2).forEach(item => {
            html += `<div style="margin: 4px 0; padding: 4px; background: #fef3c7; border-radius: 4px; font-size: 12px;">
                ${item}
            </div>`;
        });
    }
    html += '</div>';
    
    html += '</div>';
    
    el.innerHTML = html;
}

function renderRiskAssessment() {
    const el = document.getElementById('riskAssessment');
    if (!dashboardData || !dashboardData.enhanced_metrics?.risk_management) {
        el.innerHTML = '<div class="loading">Loading risk assessment...</div>';
        return;
    }
    
    const risk = dashboardData.enhanced_metrics.risk_management;
    let html = '';
    
    html += `<div class="metric">
        <div class="label">Overall Risk</div>
        <div class="value ${risk.overall_risk === 'HIGH' ? 'danger' : risk.overall_risk === 'MEDIUM' ? 'warning' : 'success'}">
            ${risk.overall_risk}
        </div>
    </div>`;
    
    html += `<div class="metric">
        <div class="label">Position Size</div>
        <div class="value">${risk.position_size_recommendation}</div>
    </div>`;
    
    html += `<div class="metric">
        <div class="label">Stop Loss</div>
        <div class="value">${risk.stop_loss_recommendation}</div>
    </div>`;
    
    html += `<div class="metric">
        <div class="label">Risk/Reward</div>
        <div class="value ${risk.risk_reward_ratio >= 1 ? 'success' : 'warning'}">${risk.risk_reward_ratio.toFixed(2)}</div>
    </div>`;
    
    // Risk factors
    if (risk.risk_factors?.length) {
        html += '<div style="margin-top: 12px;"><div style="font-weight: 600; color: var(--danger); margin-bottom: 4px; font-size: 13px;">Risk Factors</div>';
        risk.risk_factors.slice(0, 2).forEach(factor => {
            html += `<div style="font-size: 12px; color: #6b7280; margin: 2px 0;">• ${factor}</div>`;
        });
        html += '</div>';
    }
    
    el.innerHTML = html;
}

function renderCryptobibleInsights() {
    const el = document.getElementById('cryptobibleInsights');
    if (!dashboardData || !dashboardData.enhanced_metrics?.cryptobible_insights) {
        el.innerHTML = '<div class="loading">Loading cryptobible insights...</div>';
        return;
    }
    
    const insights = dashboardData.enhanced_metrics.cryptobible_insights;
    let html = '';
    
    // Chapter References
    if (insights.chapter_references?.length) {
        html += '<div style="margin-bottom: 16px;"><div style="font-weight: 600; color: var(--primary); margin-bottom: 8px;">Chapter References</div>';
        insights.chapter_references.slice(0, 3).forEach(ref => {
            html += `<div class="chapter-ref">
                <div class="chapter">${ref.chapter}</div>
                <div class="description">${ref.description}</div>
            </div>`;
        });
        html += '</div>';
    }
    
    // Trading Principles
    if (insights.trading_principles?.length) {
        html += '<div style="margin-bottom: 16px;"><div style="font-weight: 600; color: var(--success); margin-bottom: 8px;">Trading Principles</div>';
        insights.trading_principles.slice(0, 3).forEach(principle => {
            html += `<div class="insight">${principle}</div>`;
        });
        html += '</div>';
    }
    
    // Risk Warnings
    if (insights.risk_warnings?.length) {
        html += '<div><div style="font-weight: 600; color: var(--danger); margin-bottom: 8px;">Risk Warnings</div>';
        insights.risk_warnings.slice(0, 2).forEach(entry => {
            const warning = normalizeWarningEntry(entry);
            if (!warning) return;
            const severity = warning.severity === 'high' ? 'High' : warning.severity === 'low' ? 'Low' : 'Medium';
            html += `<div class="insight danger">
                <strong>${warning.symbol} — ${warning.warning}</strong><br>
                ${warning.description}<br>
                <small>Severity: ${severity}</small>
            </div>`;
        });
        html += '</div>';
    }
    
    if (!html) {
        html = '<div class="insight">Applying cryptobible framework analysis...</div>';
    }
    
    el.innerHTML = html;
}

function renderTechnicalAnalysis() {
    const el = document.getElementById('technicalAnalysis');
    if (!dashboardData || !dashboardData.technical_analysis) {
        el.innerHTML = '<div class="loading">Loading technical analysis...</div>';
        return;
    }
    
    const ta = dashboardData.technical_analysis;
    let html = '';
    
    // BTC analysis (primary)
    if (ta.BTC) {
        const btc = ta.BTC;
        
        html += `<div class="metric">
            <div class="label">BTC RSI</div>
            <div class="value ${btc.rsi > 70 ? 'danger' : btc.rsi < 30 ? 'success' : 'neutral'}">
                ${btc.rsi?.toFixed(1) || '-'}
            </div>
        </div>`;
        
        html += `<div class="metric">
            <div class="label">BTC MACD</div>
            <div class="value ${btc.macd > 0 ? 'success' : 'danger'}">
                ${btc.macd?.toFixed(2) || '-'}
            </div>
        </div>`;
    }
    
    // ETH analysis
    if (ta.ETH) {
        const eth = ta.ETH;
        
        html += `<div class="metric">
            <div class="label">ETH RSI</div>
            <div class="value ${eth.rsi > 70 ? 'danger' : eth.rsi < 30 ? 'success' : 'neutral'}">
                ${eth.rsi?.toFixed(1) || '-'}
            </div>
        </div>`;
    }
    
    // Market condition
    if (dashboardData.summary?.market_bias) {
        const bias = dashboardData.summary.market_bias;
        html += `<div class="metric">
            <div class="label">Market Condition</div>
            <div class="value ${bias === 'BULLISH' ? 'success' : bias === 'BEARISH' ? 'danger' : 'warning'}">
                ${bias}
            </div>
        </div>`;
    }
    
    el.innerHTML = html;
}

function renderAssetPerformance() {
    const el = document.getElementById('assetPerformance');
    if (!dashboardData || !dashboardData.market_data) {
        el.innerHTML = '<div class="loading">Loading asset data...</div>';
        return;
    }
    
    const assets = dashboardData.market_data;
    let html = '';
    
    // Show all 7 assets
    Object.entries(assets).forEach(([symbol, data]) => {
        const change = data.change_pct || 0;
        const price = data.price || 0;
        
        html += `<div class="metric">
            <div class="label">${symbol}</div>
            <div class="value ${change >= 0 ? 'positive' : 'negative'}">
                ${formatPrice(price)} (${formatPercent(change)})
            </div>
        </div>`;
    });
    
    el.innerHTML = html;
}

function renderTradingSignals() {
    const el = document.getElementById('tradingSignals');
    if (!dashboardData || !dashboardData.signals) {
        return; // Optional section
    }
    
    const signals = dashboardData.signals;
    let html = '';
    
    if (signals.length > 0) {
        html += '<div style="font-weight: 600; color: var(--primary); margin-bottom: 8px;">Active Signals</div>';
        signals.slice(0, 3).forEach(signal => {
            const typeClass = signal.type === 'BUY' ? 'success' : signal.type === 'SELL' ? 'danger' : 'warning';
            html += `<div class="insight ${typeClass}">
                <strong>${signal.symbol} ${signal.type}</strong> @ ${formatPrice(signal.price)}<br>
                <small>${signal.timeframe || ''} - ${signal.confidence || ''}</small>
            </div>`;
        });
    }
    
    if (html) {
        el.innerHTML = html;
    }
}

// ==================== NEWS DATA RENDERING ====================

function renderNewsSentiment() {
    const el = document.getElementById('newsSentimentPanel');
    if (!newsData || !newsData.summary) {
        el.innerHTML = '<div class="loading">Loading sentiment analysis...</div>';
        return;
    }
    
    const summary = newsData.summary;
    const sentiment = summary.overall_sentiment;
    const breakdown = summary.sentiment_breakdown;
    
    let html = '';
    
    // Overall sentiment
    const sentimentColor = sentiment === 'positive' ? 'var(--success)' : 
                          sentiment === 'negative' ? 'var(--danger)' : 'var(--warning)';
    
    html += `<div class="metric">
        <div class="label">Overall Sentiment</div>
        <div class="value" style="color: ${sentimentColor}">${sentiment.toUpperCase()}</div>
    </div>`;
    
    // Sentiment breakdown
    if (breakdown) {
        html += `<div class="metric">
            <div class="label">Positive</div>
            <div class="value positive">${breakdown.positive || 0}%</div>
        </div>`;
        
        html += `<div class="metric">
            <div class="label">Neutral</div>
            <div class="value neutral">${breakdown.neutral || 0}%</div>
        </div>`;
        
        html += `<div class="metric">
            <div class="label">Negative</div>
            <div class="value negative">${breakdown.negative || 0}%</div>
        </div>`;
    }
    
    // Impact score
    if (summary.average_impact_score) {
        html += `<div class="metric">
            <div class="label">Avg Impact</div>
            <div class="value">${summary.average_impact_score.toFixed(1)}/100</div>
        </div>`;
    }
    
    el.innerHTML = html;
}

function renderBreakingNews() {
    const el = document.getElementById('breakingNewsPanel');
    if (!newsData || !newsData.trends || !newsData.trends.breaking_news) {
        el.innerHTML = '<div class="loading">No breaking news at this time</div>';
        return;
    }
    
    const breakingNews = newsData.trends.breaking_news;
    if (breakingNews.length === 0) {
        el.innerHTML = '<div class="loading">No breaking news at this time</div>';
        return;
    }
    
    let html = '';
    
    breakingNews.forEach(item => {
        const sentimentColor = item.sentiment === 'positive' ? 'var(--success)' : 
                              item.sentiment === 'negative' ? 'var(--danger)' : 'var(--warning)';
        
        html += `<div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin: 8px 0; border-left: 4px solid ${sentimentColor};">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${item.title}</div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280;">
                <span>${item.source}</span>
                <span style="color: ${sentimentColor}">${item.sentiment.toUpperCase()}</span>
            </div>
        </div>`;
    });
    
    el.innerHTML = html;
}

function renderNewsCategories() {
    const el = document.getElementById('newsCategories');
    if (!newsData || !newsData.trends || !newsData.trends.category_counts) {
        el.innerHTML = '<div class="loading">No category data available</div>';
        return;
    }
    
    const categories = newsData.trends.category_counts;
    let html = '';
    
    Object.entries(categories).forEach(([category, count]) => {
        html += `<div class="metric">
            <div class="label">${category.toUpperCase()}</div>
            <div class="value">${count} articles</div>
        </div>`;
    });
    
    el.innerHTML = html;
}

// ==================== UTILITY FUNCTIONS ====================

function formatPrice(price) {
    if (!price) return '-';
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

function formatPercent(value) {
    if (value === undefined || value === null) return '-';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

function formatTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').style.display = 'block';
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// ==================== INITIALIZATION ====================

// Auto-refresh every 5 minutes
setInterval(loadDashboard, 300000);

// Load dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing complete dashboard...');
    loadDashboard();
});

// Make functions available globally
window.loadDashboard = loadDashboard;
window.switchTab = switchTab;
