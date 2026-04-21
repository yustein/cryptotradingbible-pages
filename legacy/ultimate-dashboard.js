// ULTIMATE MARKET TERMINAL v2.01 - ALL GRAPHICS & FEATURES
// Combines: Original dashboard graphics + Enhanced features + Historical data

console.log('🚀 Ultimate Market Terminal v2.01 - All Graphics & Features');

let marketData = null;
let newsData = null;
let selectedAsset = 'BTC';
let currentTimeframe = '1D';

// ==================== CORE FUNCTIONS ====================

async function loadUltimateDashboard() {
    console.log('Loading ultimate dashboard with ALL graphics and features...');
    
    try {
        // Show loading state
        document.getElementById('updatedLocal').textContent = 'Loading...';
        document.getElementById('updatedLocal').className = 'pulse';
        
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
        
        console.log('🎉 Ultimate dashboard loaded successfully!');
        
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
        showError('Failed to load data. Check console for details.');
    }
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
    // Market Analytics Tab
    renderMarketSummary();
    renderAssetPerformance();
    renderTechnicalAnalysis();
    renderLiquidityHeatmap();
    renderOrderFlowAnalysis();
    renderMarketStructure();
    
    // Historical Charts Tab
    renderHistoricalCharts();
    
    // Cryptobible Insights Tab
    renderCryptobibleInsights();
    
    // Trading Signals Tab
    renderTradingSignals();
    
    // News Intelligence Tab
    renderNewsIntelligence();
    
    // Risk Management Tab
    renderRiskManagement();
}

// ==================== MARKET ANALYTICS TAB ====================

function renderMarketSummary() {
    const el = document.getElementById('marketSummary');
    if (!marketData || !marketData.summary) return;
    
    const summary = marketData.summary;
    let html = '';
    
    html += `<div class="metric">
        <div class="label">🎯 Market Bias</div>
        <div class="value ${summary.market_bias === 'BULLISH' ? 'positive' : 'negative'}">${summary.market_bias}</div>
    </div>`;
    
    html += `<div class="metric">
        <div class="label">📈 Top Gainer</div>
        <div class="value positive">${summary.top_gainer}</div>
    </div>`;
    
    html += `<div class="metric">
        <div class="label">📉 Top Loser</div>
        <div class="value negative">${summary.top_loser}</div>
    </div>`;
    
    html += `<div class="metric">
        <div class="label">📊 Avg Change</div>
        <div class="value ${summary.avg_change_pct >= 0 ? 'positive' : 'negative'}">${formatPercent(summary.avg_change_pct)}</div>
    </div>`;
    
    html += `<div class="metric">
        <div class="label">🔄 Generated</div>
        <div class="value">${formatTime(marketData.generated_at_local)}</div>
    </div>`;
    
    el.innerHTML = html;
}

function renderAssetPerformance() {
    const el = document.getElementById('assetPerformance');
    if (!marketData || !marketData.market_data) return;
    
    const assets = marketData.market_data;
    let html = '';
    
    // Show all 7 assets
    Object.entries(assets).forEach(([symbol, data]) => {
        const change = data.change_pct || 0;
        const price = data.price || 0;
        
        html += `<div class="metric">
            <div class="label">${symbol}</div>
            <div class="value ${change >= 0 ? 'positive' : 'negative'}">
                ${formatPrice(price)} <span style="font-size: 14px;">(${formatPercent(change)})</span>
            </div>
        </div>`;
    });
    
    el.innerHTML = html;
}

function renderTechnicalAnalysis() {
    const el = document.getElementById('technicalAnalysis');
    if (!marketData || !marketData.technical_analysis) return;
    
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
    
    el.innerHTML = html;
}

function renderLiquidityHeatmap() {
    const el = document.getElementById('liquidityHeatmap');
    const zonesEl = document.getElementById('liquidityZones');
    
    if (!marketData || !marketData.enhanced_metrics?.liquidity_heatmap) {
        el.innerHTML = '<div class="insight">No liquidity data available</div>';
        return;
    }
    
    const heatmap = marketData.enhanced_metrics.liquidity_heatmap;
    
    // Create simple visualization
    el.innerHTML = `
        <div style="padding: 20px; background: var(--bg3); border-radius: 12px;">
            <div style="font-weight: 600; margin-bottom: 16px; color: var(--text);">Liquidity Concentration</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="color: var(--success); font-weight: 600;">Support Zones: ${heatmap.support_zones?.length || 0}</div>
                <div style="color: var(--danger); font-weight: 600;">Resistance Zones: ${heatmap.resistance_zones?.length || 0}</div>
            </div>
        </div>
    `;
    
    // Render liquidity zones
    let zonesHtml = '';
    
    // Support zones
    if (heatmap.support_zones?.length) {
        zonesHtml += '<div style="margin-bottom: 20px;"><div style="font-weight: 700; color: var(--success); margin-bottom: 12px; font-size: 16px;">🎯 Support Zones</div>';
        heatmap.support_zones.slice(0, 3).forEach(zone => {
            zonesHtml += `
                <div class="liquidity-zone support">
                    <div>
                        <div style="font-weight: 600; font-size: 15px;">${zone.symbol}</div>
                        <div style="font-size: 13px; color: var(--text-muted);">${formatPrice(zone.price)}</div>
                    </div>
                    <div class="zone-strength ${zone.strength === 'HIGH' ? 'high' : zone.strength === 'MEDIUM' ? 'medium' : 'low'}">${zone.strength}</div>
                </div>
            `;
        });
        zonesHtml += '</div>';
    }
    
    // Resistance zones
    if (heatmap.resistance_zones?.length) {
        zonesHtml += '<div><div style="font-weight: 700; color: var(--danger); margin-bottom: 12px; font-size: 16px;">🎯 Resistance Zones</div>';
        heatmap.resistance_zones.slice(0, 3).forEach(zone => {
            zonesHtml += `
                <div class="liquidity-zone resistance">
                    <div>
                        <div style="font-weight: 600; font-size: 15px;">${zone.symbol}</div>
                        <div style="font-size: 13px; color: var(--text-muted);">${formatPrice(zone.price)}</div>
                    </div>
                    <div class="zone-strength ${zone.strength === 'HIGH' ? 'high' : zone.strength === 'MEDIUM' ? 'medium' : 'low'}">${zone.strength}</div>
                </div>
            `;
        });
        zonesHtml += '</div>';
    }
    
    zonesEl.innerHTML = zonesHtml || '<div class="insight">No liquidity zones detected</div>';
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
    
    metricsEl.innerHTML = metricsHtml;
    
    // Create simple visualization
    chartEl.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 16px; color: var(--text-muted); margin-bottom: 20px;">Order Flow Distribution</div>
            <div style="display: flex; justify-content: center; gap: 40px;">
                <div style="text-align: center;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--success), rgba(34, 197, 94, 0.3)); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
                        <span style="font-weight: 700; font-size: 20px; color: white;">${(flow.maker_ratio * 100).toFixed(0)}%</span>
                    </div>
                    <div style="font-size: 14px; color: var(--text-muted);">Makers</div>
                </div>
                <div style="text-align: center;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--danger), rgba(239, 68, 68, 0.3)); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
                        <span style="font-weight: 700; font-size: 20px; color: white;">${(flow.taker_ratio * 100).toFixed(0)}%</span>
                    </div>
                    <div style="font-size: 14px; color: var(--text-muted);">Takers</div>
                </div>
            </div>
        </div>
    `;
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

// ==================== HISTORICAL CHARTS TAB ====================

function setTimeframe(tf, btn) {
    currentTimeframe = tf;
    document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderHistoricalCharts();
}

function renderHistoricalCharts() {
    if (!marketData) return;
    
    // Update selected asset
    selectedAsset = document.getElementById('assetSelector').value;
    
    // Update title
    document.getElementById('selectedAssetTitle').textContent = `${selectedAsset} - ${currentTimeframe}`;
    
    // Render all charts
    renderCandleChart();
    renderIndicatorChart();
    renderComparisonChart();
    renderSparklines();
}

function renderCandleChart() {
    const el = document.getElementById('candleChart');
    
    // For now, create a simulated candle chart since we don't have OHLC data
    // In a real implementation, you would use marketData.history[selectedAsset]
    
    const dates = [];
    const prices = [];
    const now = new Date();
    
    // Generate sample data for the selected timeframe
    let hours = 24; // Default 1D
    if (currentTimeframe === '7D') hours = 24 * 7;
    if (currentTimeframe === '30D') hours = 24 * 30;
    if (currentTimeframe === 'ALL') hours = 24 * 90; // 90 days max
    
    for (let i = hours; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 60 * 60 * 1000);
        dates.push(date);
        
        // Simulate price movement
        const basePrice = marketData.market_data[selectedAsset]?.price || 50000;
        const volatility = 0.02; // 2% volatility
        const randomWalk = Math.sin(i * 0.1) * volatility * basePrice;
        prices.push(basePrice + randomWalk);
    }
    
    // Create candle data (simplified)
    const candleData = [{
        x: dates,
        close: prices,
        open: prices.map(p => p * (0.99 + Math.random() * 0.02)),
        high: prices.map(p => p * (1.01 + Math.random() * 0.02)),
        low: prices.map(p => p * (0.98 + Math.random() * 0.02)),
        type: 'candlestick',
        name: selectedAsset,
        increasing: {line: {color: '#22c55e'}},
        decreasing: {line: {color: '#ef4444'}}
    }];
    
    const layout = {
        margin: {t: 10, r: 10, b: 40, l: 60},
        paper_bgcolor: '#0f172a',
        plot_bgcolor: '#0f172a',
        font: {color: '#e5e7eb'},
        xaxis: {title: 'Time', gridcolor: '#1f2937'},
        yaxis: {title: 'Price', gridcolor: '#1f2937'},
        showlegend: false
    };
    
    try {
        Plotly.newPlot('candleChart', candleData, layout, {responsive: true});
    } catch (error) {
        console.warn('Could not create candle chart:', error);
        el.innerHTML = '<div class="insight">Candle chart requires OHLC data. Using line chart instead.</div>';
        
        // Fallback to line chart
        const lineData = [{
            x: dates,
            y: prices,
            type: 'scatter',
            mode: 'lines',
            name: selectedAsset,
            line: {color: '#3b82f6', width: 3}
        }];
        
        Plotly.newPlot('candleChart', lineData, layout, {responsive: true});
    }
}

function renderIndicatorChart() {
    const el = document.getElementById('indicatorChart');
    
    // Generate sample data
    const dates = [];
    const rsiValues = [];
    const macdValues = [];
    const now = new Date();
    
    let hours = 24;
    if (currentTimeframe === '7D') hours = 24 * 7;
    if (currentTimeframe === '30D') hours = 24 * 30;
    if (currentTimeframe === 'ALL') hours = 24 * 90;
    
    for (let i = hours; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 60 * 60 * 1000);
        dates.push(date);
        
        // Generate RSI values (oscillating between 30-70)
        const rsi = 50 + 20 * Math.sin(i * 0.05);
        rsiValues.push(rsi);
        
        // Generate MACD values
        const macd = 1000 * Math.sin(i * 0.1);
        macdValues.push(macd);
    }
    
    const data = [
        {
            x: dates,
            y: rsiValues,
            type: 'scatter',
            mode: 'lines',
            name: 'RSI',
            line: {color: '#f59e0b', width: 3}
        },
        {
            x: dates,
            y: macdValues,
            type: 'scatter',
            mode: 'lines',
            name: 'MACD',
            yaxis: 'y2',
            line: {color: '#8b5cf6', width: 3, dash: 'dot'}
        }
    ];
    
    const layout = {
        margin: {t: 10, r: 60, b: 40, l: 50},
        paper_bgcolor: '#0f172a',
        plot_bgcolor: '#0f172a',
        font: {color: '#e5e7eb'},
        xaxis: {title: 'Time', gridcolor: '#1f2937'},
        yaxis: {title: 'RSI', range: [0, 100], gridcolor: '#1f2937'},
        yaxis2: {title: 'MACD', overlaying: 'y', side: 'right'},
        shapes: [
            {type: 'line', x0: dates[0], x1: dates[dates.length-1], y0: 70, y1: 70, line: {dash: 'dot', color: '#ef4444'}},
            {type: 'line', x0: dates[0], x1: dates[dates.length-1], y0: 30, y1: 30, line: {dash: 'dot', color: '#22c55e'}}
        ]
    };
    
    try {
        Plotly.newPlot('indicatorChart', data, layout, {responsive: true});
    } catch (error) {
        console.warn('Could not create indicator chart:', error);
        el.innerHTML = '<div class="insight">Indicator chart requires historical data.</div>';
    }
}

function renderComparisonChart() {
    const el = document.getElementById('comparisonChart');
    
    // Generate sample comparison data
    const dates = [];
    const now = new Date();
    
    let hours = 24;
    if (currentTimeframe === '7D') hours = 24 * 7;
    if (currentTimeframe === '30D') hours = 24 * 30;
    if (currentTimeframe === 'ALL') hours = 24 * 90;
    
    for (let i = hours; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 60 * 60 * 1000);
        dates.push(date);
    }
    
    const colors = ['#38bdf8', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899'];
    const symbols = ['BTC', 'ETH', 'SOL', 'ZEC', 'HYPE', 'ASTER', 'SENT'];
    
    const traces = symbols.map((symbol, i) => {
        // Generate performance data
        const performance = [];
        for (let j = 0; j < dates.length; j++) {
            const base = 100; // Start at 100%
            const trend = Math.sin(j * 0.05 + i) * 20; // Different trend for each asset
            const noise = (Math.random() - 0.5) * 10;
            performance.push(base + trend + noise);
        }
        
        return {
            x: dates,
            y: performance,
            type: 'scatter',
            mode: 'lines',
            name: symbol,
            line: {
                color: colors[i % colors.length],
                width: symbol === selectedAsset ? 4 : 2
            }
        };
    });
    
    const layout = {
        margin: {t: 10, r: 10, b: 40, l: 60},
        paper_bgcolor: '#0f172a',
        plot_bgcolor: '#0f172a',
        font: {color: '#e5e7eb'},
        xaxis: {title: 'Time', gridcolor: '#1f2937'},
        yaxis: {title: 'Performance %', gridcolor: '#1f2937', ticksuffix: '%'},
        legend: {orientation: 'h'}
    };
    
    try {
        Plotly.newPlot('comparisonChart', traces, layout, {responsive: true});
    } catch (error) {
        console.warn('Could not create comparison chart:', error);
        el.innerHTML = '<div class="insight">Comparison chart requires historical data.</div>';
    }
}

function renderSparklines() {
    const el = document.getElementById('sparklinesContainer');
    
    if (!marketData || !marketData.market_data) {
        el.innerHTML = '<div class="insight">No asset data available for sparklines</div>';
        return;
    }
    
    const symbols = Object.keys(marketData.market_data);
    let html = '';
    
    symbols.forEach(symbol => {
        const data = marketData.market_data[symbol];
        const change = data.change_pct || 0;
        const color = change >= 0 ? '#22c55e' : '#ef4444';
        
        // Generate simple sparkline data
        const sparklineData = [];
        for (let i = 0; i < 20; i++) {
            sparklineData.push(50 + Math.sin(i * 0.5) * 20 + (Math.random() - 0.5) * 10);
        }
        
        const sparklineId = `sparkline-${symbol}`;
        
        html += `
            <div style="background: var(--bg3); padding: 16px; border-radius: 12px; border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="font-weight: 700; font-size: 16px;">${symbol}</div>
                    <div style="font-weight: 600; color: ${color};">${formatPercent(change)}</div>
                </div>
                <div id="${sparklineId}" style="height: 60px;"></div>
            </div>
        `;
        
        // Render sparkline after HTML is added
        setTimeout(() => {
            try {
                const trace = {
                    y: sparklineData,
                    type: 'scatter',
                    mode: 'lines',
                    line: {color: color, width: 2},
                    fill: 'tozeroy',
                    fillcolor: change >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                };
                
                const layout = {
                    margin: {t: 2, r: 2, b: 2, l: 2},
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    xaxis: {visible: false},
                    yaxis: {visible: false}
                };
                
                Plotly.newPlot(sparklineId, [trace], layout, {displayModeBar: false});
            } catch (error) {
                console.warn(`Could not create sparkline for ${symbol}:`, error);
            }
        }, 100);
    });
    
    el.innerHTML = html;
}

// ==================== CRYPTOBIBLE INSIGHTS TAB ====================

function renderCryptobibleInsights() {
    // Chapter References
    const chaptersEl = document.getElementById('chapterReferences');
    if (marketData?.enhanced_metrics?.cryptobible_insights?.chapter_references) {
        const chapters = marketData.enhanced_metrics.cryptobible_insights.chapter_references;
        let html = '';
        
        chapters.slice(0, 4).forEach(ref => {
            html += `<div class="insight">
                <div style="font-weight: 700; color: var(--purple); margin-bottom: 4px;">📖 ${ref.chapter}</div>
                <div style="font-size: 13px; color: var(--text-muted);">${ref.description}</div>
            </div>`;
        });
        chaptersEl.innerHTML = html;
    }
    
    // Trading Principles
    const principlesEl = document.getElementById('tradingPrinciples');
    if (marketData?.enhanced_metrics?.cryptobible_insights?.trading_principles) {
        const principles = marketData.enhanced_metrics.cryptobible_insights.trading_principles;
        let html = '';
        
        principles.slice(0, 4).forEach(principle => {
            html += `<div class="insight success">✅ ${principle}</div>`;
        });
        principlesEl.innerHTML = html;
    }
    
    // Risk Warnings
    const warningsEl = document.getElementById('riskWarnings');
    if (marketData?.enhanced_metrics?.cryptobible_insights?.risk_warnings) {
        const warnings = marketData.enhanced_metrics.cryptobible_insights.risk_warnings;
        let html = '';
        
        warnings.slice(0, 3).forEach(warning => {
            html += `<div class="insight danger">
                ⚠️ <strong>${warning.symbol}:</strong> ${warning.description}
            </div>`;
        });
        warningsEl.innerHTML = html;
    }
}

// ==================== TRADING SIGNALS TAB ====================

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
                <span>Confidence: ${signal.confidence || 'Medium'}</span>
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
    
    analysisEl.innerHTML = analysisHtml;
}

// ==================== NEWS INTELLIGENCE TAB ====================

function renderNewsIntelligence() {
    if (!newsData) return;
    
    // News Sentiment
    const sentimentEl = document.getElementById('newsSentiment');
    if (newsData.summary) {
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
        
        sentimentEl.innerHTML = html;
    }
    
    // Breaking News
    const breakingEl = document.getElementById('breakingNews');
    if (newsData.trends?.breaking_news && newsData.trends.breaking_news.length > 0) {
        const breakingNews = newsData.trends.breaking_news;
        let html = '';
        
        breakingNews.slice(0, 3).forEach(item => {
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
        
        breakingEl.innerHTML = html;
    }
    
    // News Categories
    const categoriesEl = document.getElementById('newsCategories');
    if (newsData.trends?.category_counts) {
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
        
        categoriesEl.innerHTML = html;
    }
}

// ==================== RISK MANAGEMENT TAB ====================

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
    
    assessmentEl.innerHTML = assessmentHtml;
    
    // Position Sizing
    let sizingHtml = '';
    
    sizingHtml += `<div class="metric">
        <div class="label">💰 Position Size</div>
        <div class="value">${risk.position_size_recommendation || 'N/A'}</div>
    </div>`;
    
    sizingHtml += `<div class="metric">
        <div class="label">⚖️ Risk/Reward</div>
        <div class="value ${risk.risk_reward_ratio >= 1 ? 'success' : 'warning'}">
          ${risk.risk_reward_ratio?.toFixed(2) || 'N/A'}
        </div>
    </div>`;
    
    sizingEl.innerHTML = sizingHtml;
    
    // Stop Loss Levels
    let stopLossHtml = '';
    
    stopLossHtml += `<div class="metric">
        <div class="label">🛡️ Stop Loss</div>
        <div class="value">${risk.stop_loss_recommendation || 'N/A'}</div>
    </div>`;
    
    stopLossEl.innerHTML = stopLossHtml;
}

// ==================== UTILITY FUNCTIONS ====================

function showError(message) {
    console.error('Dashboard error:', message);
    // Show error in header subtitle
    const subtitle = document.querySelector('.header .subtitle');
    if (subtitle) {
        subtitle.innerHTML = `<span style="color: var(--danger);">❌ ${message}</span>`;
    }
}

// Make functions available globally
window.loadUltimateDashboard = loadUltimateDashboard;
window.renderAllFeatures = renderAllFeatures;

console.log('✅ Ultimate dashboard JavaScript loaded successfully!');