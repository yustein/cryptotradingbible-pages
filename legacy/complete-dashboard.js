// COMPLETE MARKET TERMINAL v2.01 - ALL FEATURES
// Restores: Liquidity Heatmaps, Order Flow, Market Structure, Risk Management, Cryptobible Insights, Trading Signals, News Intelligence

console.log('🚀 Complete Market Terminal v2.01 - All Features Restored');

let marketData = null;
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

async function loadCompleteDashboard() {
    console.log('Loading complete dashboard with all features...');
    
    try {
        // Show loading state
        showLoadingState();
        
        // Load market data
        const marketResponse = await fetch('dashboard-enhanced.json');
        marketData = await marketResponse.json();
        console.log('✅ Market data loaded:', marketData.summary.version);
        
        // Load news data
        const newsResponse = await fetch('news-data.json');
        newsData = await newsResponse.json();
        console.log('✅ News data loaded:', newsData.summary.total_articles, 'articles');
        
        // Update header
        updateHeader();
        
        // Render ALL features
        renderAllFeatures();
        
        console.log('🎉 Complete dashboard loaded successfully!');
        
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
        showError('Failed to load data. Check console for details.');
    }
}

function showLoadingState() {
    // Update header with loading state
    document.getElementById('updatedLocal').textContent = 'Loading...';
    document.getElementById('updatedLocal').className = 'pulse';
}

function updateHeader() {
    if (!marketData || !marketData.summary) return;
    
    const now = new Date();
    document.getElementById('updatedLocal').textContent = now.toLocaleString();
    document.getElementById('updatedLocal').className = '';
    
    const summary = marketData.summary;
    document.getElementById('trackedAssets').textContent = summary.tracked_assets;
    document.getElementById('marketBias').textContent = summary.market_bias;
    document.getElementById('version').textContent = summary.version;
    
    if (newsData && newsData.summary) {
        document.getElementById('newsCount').textContent = newsData.summary.total_articles;
    }
}

function renderAllFeatures() {
    // MARKET ANALYTICS
    renderLiquidityHeatmap();
    renderOrderFlowAnalysis();
    renderMarketStructure();
    renderTechnicalAnalysis();
    renderAssetPerformance();
    renderMarketSummary();
    
    // CRYPTOBIBLE INSIGHTS
    renderCryptobibleInsights();
    
    // TRADING SIGNALS
    renderTradingSignals();
    
    // NEWS INTELLIGENCE
    renderNewsIntelligence();
    
    // RISK MANAGEMENT
    renderRiskManagement();
}

// ==================== MARKET ANALYTICS ====================

function renderLiquidityHeatmap() {
    const el = document.getElementById('liquidityHeatmap');
    const zonesEl = document.getElementById('liquidityZones');
    
    if (!marketData || !marketData.enhanced_metrics?.liquidity_heatmap) {
        el.innerHTML = '<div class="insight">No liquidity data available</div>';
        return;
    }
    
    const heatmap = marketData.enhanced_metrics.liquidity_heatmap;
    
    // Create chart HTML placeholder
    el.innerHTML = `
        <div class="chart-container">
            <div class="chart-title">Liquidity Concentration</div>
            <div id="liquidityChart" style="height: 250px;"></div>
        </div>
    `;
    
    // Render liquidity zones
    let zonesHtml = '';
    
    // Support zones
    if (heatmap.support_zones?.length) {
        zonesHtml += '<div style="margin-bottom: 20px;"><div style="font-weight: 700; color: var(--success); margin-bottom: 12px; font-size: 16px;">🎯 Support Zones</div>';
        heatmap.support_zones.slice(0, 4).forEach(zone => {
            const strengthClass = zone.strength === 'HIGH' ? 'high' : zone.strength === 'MEDIUM' ? 'medium' : 'low';
            zonesHtml += `
                <div class="liquidity-zone support">
                    <div>
                        <div style="font-weight: 600; font-size: 15px;">${zone.symbol}</div>
                        <div style="font-size: 13px; color: var(--text-muted);">${formatPrice(zone.price)}</div>
                    </div>
                    <div class="zone-strength ${strengthClass}">${zone.strength}</div>
                </div>
            `;
        });
        zonesHtml += '</div>';
    }
    
    // Resistance zones
    if (heatmap.resistance_zones?.length) {
        zonesHtml += '<div><div style="font-weight: 700; color: var(--danger); margin-bottom: 12px; font-size: 16px;">🎯 Resistance Zones</div>';
        heatmap.resistance_zones.slice(0, 4).forEach(zone => {
            const strengthClass = zone.strength === 'HIGH' ? 'high' : zone.strength === 'MEDIUM' ? 'medium' : 'low';
            zonesHtml += `
                <div class="liquidity-zone resistance">
                    <div>
                        <div style="font-weight: 600; font-size: 15px;">${zone.symbol}</div>
                        <div style="font-size: 13px; color: var(--text-muted);">${formatPrice(zone.price)}</div>
                    </div>
                    <div class="zone-strength ${strengthClass}">${zone.strength}</div>
                </div>
            `;
        });
        zonesHtml += '</div>';
    }
    
    zonesEl.innerHTML = zonesHtml || '<div class="insight">No liquidity zones detected in current market</div>';
    
    // Create Plotly chart if available
    if (window.Plotly && heatmap.support_zones?.length && heatmap.resistance_zones?.length) {
        createLiquidityChart(heatmap);
    }
}

function createLiquidityChart(heatmap) {
    try {
        const supportPrices = heatmap.support_zones.map(z => z.price).slice(0, 5);
        const resistancePrices = heatmap.resistance_zones.map(z => z.price).slice(0, 5);
        
        const trace1 = {
            x: supportPrices,
            y: supportPrices.map(() => 'Support'),
            type: 'scatter',
            mode: 'markers',
            name: 'Support',
            marker: {
                size: 20,
                color: 'rgba(34, 197, 94, 0.8)',
                symbol: 'triangle-down'
            }
        };
        
        const trace2 = {
            x: resistancePrices,
            y: resistancePrices.map(() => 'Resistance'),
            type: 'scatter',
            mode: 'markers',
            name: 'Resistance',
            marker: {
                size: 20,
                color: 'rgba(239, 68, 68, 0.8)',
                symbol: 'triangle-up'
            }
        };
        
        const layout = {
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#94a3b8' },
            xaxis: {
                title: 'Price Level',
                gridcolor: 'rgba(45, 55, 72, 0.5)',
                zerolinecolor: 'rgba(45, 55, 72, 0.5)'
            },
            yaxis: {
                gridcolor: 'rgba(45, 55, 72, 0.5)',
                zerolinecolor: 'rgba(45, 55, 72, 0.5)'
            },
            margin: { t: 30, r: 30, l: 50, b: 50 },
            showlegend: true,
            legend: {
                x: 0.5,
                y: 1.1,
                xanchor: 'center',
                orientation: 'h'
            }
        };
        
        Plotly.newPlot('liquidityChart', [trace1, trace2], layout, { displayModeBar: false });
    } catch (error) {
        console.warn('Could not create liquidity chart:', error);
    }
}

function renderOrderFlowAnalysis() {
    const chartEl = document.getElementById('orderFlowChart');
    const metricsEl = document.getElementById('orderFlowMetrics');
    
    if (!marketData || !marketData.enhanced_metrics?.order_flow) {
        chartEl.innerHTML = '<div class="loading">No order flow data available</div>';
        return;
    }
    
    const flow = marketData.enhanced_metrics.order_flow;
    
    // Create metrics display
    let metricsHtml = '';
    
    metricsHtml += `<div class="metric">
        <div class="label">📊 Market Makers</div>
        <div class="value ${flow.maker_ratio > 0.5 ? 'positive' : 'info'}">${(flow.maker_ratio * 100).toFixed(1)}%</div>
    </div>`;
    
    metricsHtml += `<div class="metric">
        <div class="label">📊 Takers</div>
        <div class="value ${flow.taker_ratio > 0.5 ? 'negative' : 'info'}">${(flow.taker_ratio * 100).toFixed(1)}%</div>
    </div>`;
    
    metricsHtml += `<div class="metric">
        <div class="label">⚖️ Flow Imbalance</div>
        <div class="value ${flow.imbalance > 0 ? 'positive' : flow.imbalance < 0 ? 'negative' : 'neutral'}">
            ${flow.imbalance > 0 ? '+' : ''}${(flow.imbalance * 100).toFixed(1)}%
        </div>
    </div>`;
    
    metricsHtml += `<div class="metric">
        <div class="label">📈 Volume Ratio</div>
        <div class="value">${flow.volume_ratio.toFixed(2)}</div>
    </div>`;
    
    metricsEl.innerHTML = metricsHtml;
    
    // Create order flow chart if Plotly is available
    if (window.Plotly) {
        createOrderFlowChart(flow);
    }
}

function createOrderFlowChart(flow) {
    try {
        const data = [{
            values: [flow.maker_ratio * 100, flow.taker_ratio * 100],
            labels: ['Market Makers', 'Takers'],
            type: 'pie',
            hole: 0.4,
            marker: {
                colors: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)']
            },
            textinfo: 'label+percent',
            textposition: 'inside',
            hoverinfo: 'label+percent+value'
        }];
        
        const layout = {
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#94a3b8' },
            showlegend: true,
            legend: {
                x: 0.5,
                y: -0.1,
                xanchor: 'center',
                orientation: 'h'
            },
            margin: { t: 30, r: 30, l: 30, b: 30 }
        };
        
        Plotly.newPlot('orderFlowChart', data, layout, { displayModeBar: false });
    } catch (error) {
        console.warn('Could not create order flow chart:', error);
    }
}

function renderMarketStructure() {
    const el = document.getElementById('marketStructure');
    if (!marketData || !marketData.enhanced_metrics?.market_structure_layers) {
        el.innerHTML = '<div class="insight">No market structure data available</div>';
        return;
    }
    
    const structure = marketData.enhanced_metrics.market_structure_layers;
    let html = '<div class="three-layer">';
    
    // Structural Layer
    html += `<div class="layer structure">
        <h3>🏗️ Structural Layer</h3>
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 16px;">Price levels, trends, and patterns</div>`;
    
    if (structure.structural?.length) {
        structure.structural.slice(0, 3).forEach(item => {
            html += `<div class="layer-item">${item}</div>`;
        });
    }
    html += '</div>';
    
    // Participant Layer
    html += `<div class="layer participant">
        <h3>👥 Participant Layer</h3>
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 16px;">Institutions, retail, whales</div>`;
    
    if (structure.participant?.length) {
        structure.participant.slice(0, 3).forEach(item => {
            html += `<div class="layer-item">${item}</div>`;
        });
    }
    html += '</div>';
    
    // Psychological Layer
    html += `<div class="layer psychological">
        <h3>🧠 Psychological Layer</h3>
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 16px;">Sentiment, fear, greed, FOMO</div>`;
    
    if (structure.psychological?.length) {
        structure.psychological.slice(0, 3).forEach(item => {
            html += `<div class="layer-item">${item}</div>`;
        });
    }
    html += '</div>';
    
    html += '</div>';
    el.innerHTML = html;
}

function renderTechnicalAnalysis() {
    const el = document.getElementById('technicalAnalysis');
    if (!marketData || !marketData.technical_analysis) {
        el.innerHTML = '<div class="insight">No technical analysis available</div>';
        return;
    }
    
    const ta = marketData.technical_analysis;
    let html = '';
    
    // BTC Analysis
    if (ta.BTC) {
        const btc = ta.BTC;
        html += `<div class="metric">
            <div class="label">🎯 BTC RSI</div>
            <div class="value ${btc.rsi > 70 ? 'danger' : btc.rsi < 30 ? 'success' : 'warning'}">
                ${btc.rsi?.toFixed(1) || '-'} ${getRSILevel(btc.rsi)}
            </div>
        </div>`;
        
        html += `<div class="metric">
            <div class="label">📊 BTC MACD</div>
            <div class="value ${btc.macd > 0 ? 'success' : 'danger'}">
                ${btc.macd?.toFixed(2) || '-'} ${btc.macd > 0 ? '📈' : '📉'}
            </div>
        </div>`;
    }
    
    // ETH Analysis
    if (ta.ETH) {
        const eth = ta.ETH;
        html += `<div class="metric">
            <div class="label">🎯 ETH RSI</div>
            <div class="value ${eth.rsi > 70 ? 'danger' : eth.rsi < 30 ? 'success' : 'warning'}">
                ${eth.rsi?.toFixed(1) || '-'} ${getRSILevel(eth.rsi)}
            </div>
        </div>`;
    }
    
    // Market Condition
    if (marketData.summary?.market_bias) {
        const bias = marketData.summary.market_bias;
        html += `<div class="metric">
            <div class="label">🌐 Market Condition</div>
            <div class="value ${bias === 'BULLISH' ? 'success' : bias === 'BEARISH' ? 'danger' : 'warning'}">
                ${bias} ${bias === 'BULLISH' ? '🚀' : bias === 'BEARISH' ? '🐻' : '⚖️'}
            </div>
        </div>`;
    }
    
    el.innerHTML = html || '<div class="insight">Technical analysis data loading...</div>';
}

function renderAssetPerformance() {
    const el = document.getElementById('assetPerformance');
    if (!marketData || !marketData.market_data) {
        el.innerHTML = '<div class="insight">No asset data available</div>';
        return;
    }
    
    const assets = marketData.market_data;
    let html = '';
    
    // Show all 7 assets with enhanced formatting
    Object.entries(assets).forEach(([symbol, data]) => {
        const change = data.change_pct || 0;
        const price = data.price || 0;
        const emoji = change >= 2 ? '🚀' : change >= 0.5 ? '📈' : change <= -2 ? '📉' : change <= -0.5 ? '🔻' : '➡️';
        
        html += `<div class="metric">
            <div class="label">${emoji} ${symbol}</div>
            <div class="value ${change >= 0 ? 'positive' : 'negative'}">
                ${formatPrice(price)} <span style="font-size: 14px;">(${formatPercent(change)})</span>
            </div>
        </div>`;
    });
    
    el.innerHTML = html;
}

function renderMarketSummary() {
    const el = document.getElementById('marketSummary');
    if (!marketData || !marketData.summary) {
        el.innerHTML = '<div class="insight">No market summary available</div>';
        return;
    }
    
    const summary = marketData.summary;
    let html = '';
    
    html += `<div class="metric">
        <div class="label">🎯 Market Bias</div>
        <div class="value ${summary.market_bias === 'BULLISH' ? 'success' : summary.market_bias === 'BEARISH' ? 'danger' : 'warning'}">
          ${summary.market_bias} ${summary.market_bias === 'BULLISH' ? '🚀' : summary.market_bias === 'BEARISH' ? '🐻' : '⚖️'}
        </div>
    </div>`;
    
    html += `<div class="metric">
        <div class="label">📈 Top Gainer</div>
        <div class="value positive">${summary.top_gainer} 🏆</div>
    </div>`;
    
    html += `<div class="metric">
        <div class="label">📉 Top Loser</div>
        <div class="value negative">${summary.top_loser} ⚠️</div>
    </div>`;
    
    html += `<div class="metric">
        <div class="label">📊 Avg Change</div>
        <div class="value ${summary.avg_change_pct >= 0 ? 'positive' : 'negative'}">
          ${formatPercent(summary.avg_change_pct)}
        </div>
    </div>`;
    
    html += `<div class="metric">
        <div class="label">🔄 Generated</div>
        <div class="value">${formatTime(marketData.generated_at_local)}</div>
    </div>`;
    
    el.innerHTML = html;
}

// ==================== CRYPTOBIBLE INSIGHTS ====================

function renderCryptobibleInsights() {
    // Chapter References
    renderChapterReferences();
    
    // Trading Principles
    renderTradingPrinciples();
    
    // Risk Warnings
    renderRiskWarnings();
}

function renderChapterReferences() {
    const el = document.getElementById('chapterReferences');
    if (!marketData || !marketData.enhanced_metrics?.cryptobible_insights?.chapter_references) {
        el.innerHTML = '<div class="insight">No chapter references available</div>';
        return;
    }
    
    const chapters = marketData.enhanced_metrics.cryptobible_insights.chapter_references;
    let html = '';
    
    chapters.slice(0, 4).forEach(ref => {
        html += `<div class="chapter-ref">
            <div class="chapter">📖 ${ref.chapter}</div>
            <div class="description">${ref.description}</div>
        </div>`;
    });
    
    el.innerHTML = html;
}

function renderTradingPrinciples() {
    const el = document.getElementById('tradingPrinciples');
    if (!marketData || !marketData.enhanced_metrics?.cryptobible_insights?.trading_principles) {
        el.innerHTML = '<div class="insight">No trading principles available</div>';
        return;
    }
    
    const principles = marketData.enhanced_metrics.cryptobible_insights.trading_principles;
    let html = '';
    
    principles.slice(0, 4).forEach(principle => {
        html += `<div class="insight success">✅ ${principle}</div>`;
    });
    
    el.innerHTML = html;
}

function renderRiskWarnings() {
    const el = document.getElementById('riskWarnings');
    if (!marketData || !marketData.enhanced_metrics?.cryptobible_insights?.risk_warnings) {
        el.innerHTML = '<div class="insight">No risk warnings available</div>';
        return;
    }
    
    const warnings = marketData.enhanced_metrics.cryptobible_insights.risk_warnings;
    let html = '';
    
    warnings.slice(0, 3).forEach(entry => {
        const warning = normalizeWarningEntry(entry);
        if (!warning) return;
        const severity = warning.severity === 'high' ? 'High' : warning.severity === 'low' ? 'Low' : 'Medium';
        html += `<div class="insight danger">
            ⚠️ <strong>${warning.symbol} — ${warning.warning}</strong><br>
            ${warning.description}<br>
            <small>Severity: ${severity}</small>
        </div>`;
    });
    
    el.innerHTML = html;
}

// ==================== TRADING SIGNALS ====================

function renderTradingSignals() {
    const signalsEl = document.getElementById('tradingSignals');
    const analysisEl = document.getElementById('signalAnalysis');
    
    if (!marketData || !marketData.signals || marketData.signals.length === 0) {
        signalsEl.innerHTML = '<div class="insight">No active trading signals</div>';
        analysisEl.innerHTML = '<div class="insight">No signal analysis available</div>';
        return;
    }
    
    const signals = marketData.signals;
    
    // Render signals
    let signalsHtml = '';
    signals.slice(0, 5).forEach(signal => {
        const typeClass = signal.type === 'BUY' ? 'buy' : 'sell';
        const typeEmoji = signal.type === 'BUY' ? '🟢' : '🔴';
        const confidenceLevel = signal.confidence || 'Medium';
        
        signalsHtml += `<div class="signal-card ${typeClass}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="font-weight: 700; font-size: 18px;">
                    ${typeEmoji} ${signal.symbol} ${signal.type}
                </div>
                <div style="font-weight: 600; color: ${typeClass === 'buy' ? 'var(--success)' : 'var(--danger)'};">
                    ${formatPrice(signal.price)}
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted);">
                <span>${signal.timeframe || 'N/A'}</span>
                <span>Confidence: ${confidenceLevel}</span>
            </div>
        </div>`;
    });
    
    signalsEl.innerHTML = signalsHtml;
    
    // Render signal analysis
    let analysisHtml = '';
    
    // Count signal types
    const buySignals = signals.filter(s => s.type === 'BUY').length;
    const sellSignals = signals.filter(s => s.type === 'SELL').length;
    
    analysisHtml += `<div class="metric">
        <div class="label">🟢 Buy Signals</div>
        <div class="value positive">${buySignals}</div>
    </div>`;
    
    analysisHtml += `<div class="metric">
        <div class="label">🔴 Sell Signals</div>
        <div class="value negative">${sellSignals}</div>
    </div>`;
    
    analysisHtml += `<div class="metric">
        <div class="label">📊 Total Signals</div>
        <div class="value">${signals.length}</div>
    </div>`;
    
    // Most common timeframe
    const timeframes = {};
    signals.forEach(s => {
        const tf = s.timeframe || 'Unknown';
        timeframes[tf] = (timeframes[tf] || 0) + 1;
    });
    
    const mostCommonTF = Object.entries(timeframes).sort((a, b) => b[1] - a[1])[0];
    if (mostCommonTF) {
        analysisHtml += `<div class="metric">
            <div class="label">⏰ Common Timeframe</div>
            <div class="value">${mostCommonTF[0]} (${mostCommonTF[1]})</div>
        </div>`;
    }
    
    analysisEl.innerHTML = analysisHtml;
}

// ==================== NEWS INTELLIGENCE ====================

function renderNewsIntelligence() {
    if (!newsData) return;
    
    renderNewsSentiment();
    renderBreakingNews();
    renderNewsCategories();
}

function renderNewsSentiment() {
    const el = document.getElementById('newsSentiment');
    if (!newsData || !newsData.summary) {
        el.innerHTML = '<div class="insight">No sentiment data available</div>';
        return;
    }
    
    const summary = newsData.summary;
    const sentiment = summary.overall_sentiment;
    const breakdown = summary.sentiment_breakdown;
    
    let html = '';
    
    // Overall sentiment
    const sentimentColor = sentiment === 'positive' ? 'success' : 
                          sentiment === 'negative' ? 'danger' : 'warning';
    const sentimentEmoji = sentiment === 'positive' ? '😊' : 
                          sentiment === 'negative' ? '😟' : '😐';
    
    html += `<div class="metric">
        <div class="label">${sentimentEmoji} Overall Sentiment</div>
        <div class="value ${sentimentColor}">${sentiment.toUpperCase()}</div>
    </div>`;
    
    // Sentiment breakdown
    if (breakdown) {
        html += `<div class="metric">
            <div class="label">🟢 Positive</div>
            <div class="value positive">${breakdown.positive || 0}%</div>
        </div>`;
        
        html += `<div class="metric">
            <div class="label">🟡 Neutral</div>
            <div class="value neutral">${breakdown.neutral || 0}%</div>
        </div>`;
        
        html += `<div class="metric">
            <div class="label">🔴 Negative</div>
            <div class="value negative">${breakdown.negative || 0}%</div>
        </div>`;
    }
    
    // Impact score
    if (summary.average_impact_score) {
        html += `<div class="metric">
            <div class="label">💥 Avg Impact</div>
            <div class="value">${summary.average_impact_score.toFixed(1)}/100</div>
        </div>`;
    }
    
    el.innerHTML = html;
}

function renderBreakingNews() {
    const el = document.getElementById('breakingNews');
    if (!newsData || !newsData.trends?.breaking_news || newsData.trends.breaking_news.length === 0) {
        el.innerHTML = '<div class="insight">No breaking news at this time</div>';
        return;
    }
    
    const breakingNews = newsData.trends.breaking_news;
    let html = '';
    
    breakingNews.slice(0, 4).forEach(item => {
        const sentimentColor = item.sentiment === 'positive' ? 'var(--success)' : 
                              item.sentiment === 'negative' ? 'var(--danger)' : 'var(--warning)';
        const sentimentEmoji = item.sentiment === 'positive' ? '📰' : 
                              item.sentiment === 'negative' ? '⚠️' : '📝';
        
        html += `<div style="background: var(--bg3); padding: 16px; border-radius: 12px; margin: 12px 0; border-left: 6px solid ${sentimentColor};">
            <div style="font-weight: 700; font-size: 15px; margin-bottom: 8px; line-height: 1.4;">
                ${sentimentEmoji} ${item.title}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted);">
                <span>${item.source}</span>
                <span style="color: ${sentimentColor}; font-weight: 600;">
                    ${item.sentiment.toUpperCase()}
                </span>
            </div>
        </div>`;
    });
    
    el.innerHTML = html;
}

function renderNewsCategories() {
    const el = document.getElementById('newsCategories');
    if (!newsData || !newsData.trends?.category_counts) {
        el.innerHTML = '<div class="insight">No category data available</div>';
        return;
    }
    
    const categories = newsData.trends.category_counts;
    let html = '';
    
    Object.entries(categories).forEach(([category, count]) => {
        const emoji = category === 'crypto' ? '₿' : 
                     category === 'financial' ? '💹' : 
                     category === 'general' ? '📰' : '📊';
        
        html += `<div class="metric">
            <div class="label">${emoji} ${category.toUpperCase()}</div>
            <div class="value">${count} articles</div>
        </div>`;
    });
    
    el.innerHTML = html;
}

// ==================== RISK MANAGEMENT ====================

function renderRiskManagement() {
    const assessmentEl = document.getElementById('riskAssessment');
    const sizingEl = document.getElementById('positionSizing');
    const stopLossEl = document.getElementById('stopLossLevels');
    
    if (!marketData || !marketData.enhanced_metrics?.risk_management) {
        assessmentEl.innerHTML = '<div class="insight">No risk assessment available</div>';
        sizingEl.innerHTML = '<div class="insight">No position sizing data</div>';
        stopLossEl.innerHTML = '<div class="insight">No stop loss levels</div>';
        return;
    }
    
    const risk = marketData.enhanced_metrics.risk_management;
    
    // Risk Assessment
    let assessmentHtml = '';
    
    assessmentHtml += `<div class="metric">
        <div class="label">⚠️ Overall Risk</div>
        <div class="value ${risk.overall_risk === 'HIGH' ? 'danger' : risk.overall_risk === 'MEDIUM' ? 'warning' : 'success'}">
          ${risk.overall_risk}
        </div>
    </div>`;
    
    assessmentHtml += `<div class="metric">
        <div class="label">📊 Risk Score</div>
        <div class="value">${risk.risk_score || 'N/A'}/100</div>
    </div>`;
    
    if (risk.risk_factors?.length) {
        assessmentHtml += '<div style="margin-top: 16px;"><div style="font-weight: 700; color: var(--danger); margin-bottom: 8px; font-size: 14px;">Key Risk Factors:</div>';
        risk.risk_factors.slice(0, 2).forEach(factor => {
            assessmentHtml += `<div style="font-size: 13px; color: var(--text-muted); margin: 6px 0; padding-left: 12px; border-left: 3px solid var(--danger);">
                • ${factor}
            </div>`;
        });
        assessmentHtml += '</div>';
    }
    
    assessmentEl.innerHTML = assessmentHtml;
    
    // Position Sizing
    let sizingHtml = '';
    
    sizingHtml += `<div class="metric">
        <div class="label">💰 Position Size</div>
        <div class="value">${risk.position_size_recommendation}</div>
    </div>`;
    
    sizingHtml += `<div class="metric">
        <div class="label">⚖️ Risk/Reward</div>
        <div class="value ${risk.risk_reward_ratio >= 1 ? 'success' : 'warning'}">
          ${risk.risk_reward_ratio?.toFixed(2) || 'N/A'}
        </div>
    </div>`;
    
    sizingHtml += `<div class="metric">
        <div class="label">🎯 Max Allocation</div>
        <div class="value">${risk.max_allocation_percentage || 'N/A'}%</div>
    </div>`;
    
    sizingEl.innerHTML = sizingHtml;
    
    // Stop Loss Levels
    let stopLossHtml = '';
    
    stopLossHtml += `<div class="metric">
        <div class="label">🛡️ Stop Loss</div>
        <div class="value">${risk.stop_loss_recommendation}</div>
    </div>`;
    
    stopLossHtml += `<div class="metric">
        <div class="label">📉 Max Drawdown</div>
        <div class="value danger">${risk.max_drawdown_percentage || 'N/A'}%</div>
    </div>`;
    
    if (risk.stop_loss_levels?.length) {
        stopLossHtml += '<div style="margin-top: 16px;"><div style="font-weight: 700; color: var(--warning); margin-bottom: 8px; font-size: 14px;">Key Levels:</div>';
        risk.stop_loss_levels.slice(0, 3).forEach(level => {
            stopLossHtml += `<div style="font-size: 13px; color: var(--text-muted); margin: 6px 0; padding-left: 12px; border-left: 3px solid var(--warning);">
                • ${level.symbol}: ${formatPrice(level.price)} (${level.distance}%)
            </div>`;
        });
        stopLossHtml += '</div>';
    }
    
    stopLossEl.innerHTML = stopLossHtml;
}

// ==================== UTILITY FUNCTIONS ====================

function formatTime(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
        return dateString;
    }
}

function showError(message) {
    console.error('Dashboard error:', message);
    // Show error in header
    const header = document.querySelector('.header .subtitle');
    if (header) {
        header.innerHTML = `<span style="color: var(--danger);">❌ ${message}</span>`;
    }
}

// Make functions available globally
window.loadCompleteDashboard = loadCompleteDashboard;
window.renderAllFeatures = renderAllFeatures;

console.log('✅ Complete dashboard JavaScript loaded successfully!');