// Cryptobible Enhanced Dashboard - JavaScript

let dashboardData = {};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPrice(price) {
  if (price === undefined || price === null || Number.isNaN(Number(price))) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(price));
}

function formatPercent(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '-';
  const numeric = Number(value);
  return (numeric >= 0 ? '+' : '') + numeric.toFixed(2) + '%';
}

function formatFundingRate(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '-';
  return `${Number(value).toFixed(4)}%`;
}

function formatRatio(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '-';
  return Number(value).toFixed(2);
}

function formatTrtTimestamp(utcValue, fallbackValue) {
  const utcDate = utcValue ? new Date(utcValue) : null;

  if (utcDate && !Number.isNaN(utcDate.getTime())) {
    return utcDate.toLocaleString('en-GB', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', '') + ' TRT';
  }

  const fallbackDate = fallbackValue ? new Date(fallbackValue) : null;
  if (fallbackDate && !Number.isNaN(fallbackDate.getTime())) {
    return fallbackDate.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  return '-';
}

function normalizeWarningEntry(entry) {
  if (!entry) return null;

  if (typeof entry === 'string') {
    try {
      return normalizeWarningEntry(JSON.parse(entry));
    } catch {
      return {
        symbol: 'Warning',
        warning: 'Market warning',
        description: entry,
        severity: 'medium'
      };
    }
  }

  if (typeof entry === 'object') {
    const symbol = entry.symbol || entry.asset || 'Market';
    const warning = entry.warning || entry.title || 'Warning';
    const severity = String(entry.severity || 'medium').toLowerCase();
    const description = entry.description || entry.message || entry.details || warning;
    return { symbol, warning, description, severity };
  }

  return {
    symbol: 'Warning',
    warning: 'Market warning',
    description: String(entry),
    severity: 'medium'
  };
}

function getLiquidityPrice(zone) {
  const candidates = [
    zone?.price,
    zone?.level,
    zone?.pool_price,
    zone?.target_price,
    zone?.reference_price
  ];

  for (const candidate of candidates) {
    const numeric = Number(candidate);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }

  return null;
}

function formatLiquidityStrength(zone) {
  const raw = zone?.strength;

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return `${raw}/5`;
  }

  const text = String(raw ?? '').trim();
  if (!text) return 'Unrated';

  const normalized = text.replace(/_/g, ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatClusterType(zone, type) {
  const raw = zone?.cluster_type || zone?.pool_type || (type === 'support' ? 'swing_low' : 'swing_high');
  const normalized = String(raw || '')
    .replace(/_/g, ' ')
    .trim();

  if (!normalized) return type === 'support' ? 'Support zone' : 'Resistance zone';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function dedupeLiquidityZones(zones) {
  const deduped = [];

  for (const zone of zones || []) {
    const symbol = String(zone?.symbol || '');
    const clusterType = String(zone?.cluster_type || zone?.pool_type || '');
    const price = getLiquidityPrice(zone);

    const isDuplicate = deduped.some(existing => {
      if (String(existing?.symbol || '') !== symbol) return false;
      if (String(existing?.cluster_type || existing?.pool_type || '') !== clusterType) return false;

      const existingPrice = getLiquidityPrice(existing);
      if (!price || !existingPrice) return false;

      const tolerance = Math.max(existingPrice * 0.0025, 0.5);
      return Math.abs(existingPrice - price) <= tolerance;
    });

    if (!isDuplicate) {
      deduped.push(zone);
    }
  }

  return deduped;
}

function renderLiquidityZone(zone, type) {
  const price = getLiquidityPrice(zone);
  const strength = formatLiquidityStrength(zone);
  const clusterType = formatClusterType(zone, type);
  const notes = Array.isArray(zone?.notes) ? zone.notes.filter(Boolean).slice(0, 2) : [];
  const noteText = notes.length ? escapeHtml(notes.join(' • ')) : 'Liquidity reference zone';

  return `<div class="liquidity-zone ${type}">
    <div class="liquidity-zone-main">
      <div class="liquidity-zone-topline">
        <span class="liquidity-symbol">${escapeHtml(zone?.symbol || 'Asset')}</span>
        <span class="liquidity-price">${price ? formatPrice(price) : 'Level unavailable'}</span>
      </div>
      <div class="liquidity-zone-subline">
        <span class="liquidity-badge ${type}">${escapeHtml(clusterType)}</span>
        <span class="liquidity-strength">Strength: ${escapeHtml(strength)}</span>
      </div>
      <div class="liquidity-zone-notes">${noteText}</div>
    </div>
  </div>`;
}

function renderLiquidityHeatmap() {
  const el = document.getElementById('liquidityHeatmap');
  const heatmap = dashboardData.enhanced_metrics?.liquidity_heatmap;

  if (!heatmap) {
    el.innerHTML = '<div class="insight warning">No liquidity data available</div>';
    return;
  }

  const supportZones = dedupeLiquidityZones(heatmap.support_clusters).slice(0, 5);
  const resistanceZones = dedupeLiquidityZones(heatmap.resistance_clusters).slice(0, 5);
  let html = '';

  if (supportZones.length) {
    html += '<div style="margin-bottom: 16px;"><div style="font-weight: 600; color: #10b981; margin-bottom: 8px;">Support Zones</div>';
    supportZones.forEach(zone => {
      html += renderLiquidityZone(zone, 'support');
    });
    html += '</div>';
  }

  if (resistanceZones.length) {
    html += '<div style="margin-bottom: 16px;"><div style="font-weight: 600; color: #ef4444; margin-bottom: 8px;">Resistance Zones</div>';
    resistanceZones.forEach(zone => {
      html += renderLiquidityZone(zone, 'resistance');
    });
    html += '</div>';
  }

  if (!html) {
    html = '<div class="insight">No significant liquidity zones detected</div>';
  }

  el.innerHTML = html;
}

function renderOrderFlowMetrics() {
  const el = document.getElementById('orderFlowMetrics');
  const orderFlow = dashboardData.enhanced_metrics?.order_flow;

  if (!orderFlow) {
    el.innerHTML = '<div class="insight warning">No order flow data available</div>';
    return;
  }

  let html = '';
  const imbalance = Number(orderFlow.bid_ask_imbalance || 0);

  html += `<div class="metric">
    <div class="label">Bid/Ask Imbalance</div>
    <div class="value ${imbalance > 0 ? 'positive' : imbalance < 0 ? 'negative' : 'neutral'}">
      ${imbalance > 0 ? 'Bulls' : imbalance < 0 ? 'Bears' : 'Balanced'}
    </div>
  </div>`;

  if (orderFlow.whale_activity?.length) {
    html += `<div class="metric">
      <div class="label">Whale Activity</div>
      <div class="value">${orderFlow.whale_activity.length} assets</div>
    </div>`;

    orderFlow.whale_activity.slice(0, 3).forEach(activity => {
      html += `<div class="insight">
        <strong>${escapeHtml(activity.symbol)}:</strong> ${escapeHtml(activity.description)}
      </div>`;
    });
  } else {
    html += `<div class="metric">
      <div class="label">Whale Activity</div>
      <div class="value">Low</div>
    </div>`;
  }

  el.innerHTML = html;
}

function renderMarketStructure() {
  const el = document.getElementById('marketStructure');
  const structure = dashboardData.enhanced_metrics?.market_structure_layers;

  if (!structure) {
    el.innerHTML = '<div class="insight warning">No market structure data available</div>';
    return;
  }

  let html = '<div class="three-layer">';

  html += `<div class="layer structure">
    <h3>Structure Layer</h3>
    <div style="font-size: 14px; margin-bottom: 8px;"><strong>Trend:</strong> ${escapeHtml(structure.structure_layer?.trend_state || '-')}</div>
    <div style="font-size: 12px; color: #6b7280;">${(structure.structure_layer?.key_levels || []).length} key levels</div>
  </div>`;

  html += `<div class="layer participant">
    <h3>Participant Layer</h3>
    <div style="font-size: 14px; margin-bottom: 8px;"><strong>Institutional:</strong> ${escapeHtml(structure.participant_layer?.institutional_activity || '-')}</div>
    <div style="font-size: 12px; color: #6b7280;">${(structure.participant_layer?.whale_movements || []).length} whale movements</div>
  </div>`;

  html += `<div class="layer psychological">
    <h3>Psychological Layer</h3>
    <div style="font-size: 14px; margin-bottom: 8px;"><strong>Sentiment:</strong> ${escapeHtml(structure.psychological_layer?.sentiment_bias || '-')}</div>
    <div style="font-size: 12px; color: #6b7280;">Fear/Greed: ${escapeHtml(structure.psychological_layer?.fear_greed_index ?? '-')} / 100</div>
  </div>`;

  html += '</div>';
  el.innerHTML = html;
}

function renderDerivativesSummary() {
  const el = document.getElementById('derivativesSummary');
  const derivatives = dashboardData.enhanced_metrics?.derivatives;

  if (!el) return;
  if (!derivatives) {
    el.innerHTML = '<div class="insight warning">No derivatives summary available</div>';
    return;
  }

  const summary = derivatives.summary || {};
  let html = '';

  html += `<div class="metric"><div class="label">Bias</div><div class="value">${escapeHtml(summary.bias || '-')}</div></div>`;
  html += `<div class="metric"><div class="label">Crowding</div><div class="value">${escapeHtml(summary.crowding || '-')}</div></div>`;
  html += `<div class="metric"><div class="label">Squeeze Risk</div><div class="value">${escapeHtml(summary.squeeze_risk || '-')}</div></div>`;
  html += `<div class="metric"><div class="label">Sources</div><div class="value">${escapeHtml((summary.sources || []).join(', ') || '-')}</div></div>`;

  const coverage = summary.coverage || {};
  html += `<div class="insight"><strong>Coverage:</strong> ${escapeHtml(String(coverage.symbols ?? 0))} symbols, OI ${escapeHtml(String(coverage.with_open_interest ?? 0))}, funding ${escapeHtml(String(coverage.with_funding ?? 0))}, long/short ${escapeHtml(String(coverage.with_long_short ?? 0))}</div>`;

  el.innerHTML = html;
}

function renderDerivativesBySymbol() {
  const el = document.getElementById('derivativesBySymbol');
  const derivatives = dashboardData.enhanced_metrics?.derivatives?.symbols;

  if (!el) return;
  if (!derivatives || !Object.keys(derivatives).length) {
    el.innerHTML = '<div class="insight warning">No per-symbol derivatives data available</div>';
    return;
  }

  let html = '';
  Object.entries(derivatives).slice(0, 6).forEach(([symbol, data]) => {
    const oi = data.open_interest || {};
    const funding = data.funding || {};
    const longShort = data.long_short || {};
    const liq = data.liquidation_map || {};
    const regime = data.regime || {};

    html += `<div class="derivatives-symbol">
      <h4>${escapeHtml(symbol)} <span class="derivatives-chip">${escapeHtml(regime.summary || 'derivatives')}</span></h4>
      <div class="derivatives-grid">
        <div><strong>OI 1h</strong><br>${formatPercent(oi.change_1h_pct)}</div>
        <div><strong>Funding</strong><br>${formatFundingRate(funding.current)}</div>
        <div><strong>Long/Short</strong><br>${formatRatio(longShort.value)} <small>(${escapeHtml(longShort.type || 'n/a')})</small></div>
        <div><strong>Liq Bias</strong><br>${escapeHtml(liq.nearest_bias || '-')}</div>
        <div><strong>Nearest Level</strong><br>${liq.nearest_level ? formatPrice(liq.nearest_level) : '-'}</div>
        <div><strong>Confidence</strong><br>${escapeHtml(liq.confidence || '-')}</div>
      </div>
    </div>`;
  });

  el.innerHTML = html;
}

function renderRiskMetrics() {
  const el = document.getElementById('riskMetrics');
  const risk = dashboardData.enhanced_metrics?.risk_management;

  if (!risk) {
    el.innerHTML = '<div class="insight warning">No risk data available</div>';
    return;
  }

  let html = '';

  if (Number(risk.var_95) > 0) {
    html += `<div class="metric">
      <div class="label">VaR (95%)</div>
      <div class="value">${Number(risk.var_95).toFixed(2)}%</div>
    </div>`;
  }

  if (Number(risk.max_drawdown) > 0) {
    html += `<div class="metric">
      <div class="label">Max Drawdown</div>
      <div class="value">${Number(risk.max_drawdown).toFixed(2)}%</div>
    </div>`;
  }

  if (risk.position_sizing && Object.keys(risk.position_sizing).length > 0) {
    html += '<div style="margin-top: 16px; font-weight: 600; color: var(--dark); margin-bottom: 8px;">Position Sizing</div>';

    Object.entries(risk.position_sizing).slice(0, 4).forEach(([symbol, sizing]) => {
      const riskLevel = String(sizing.risk_level || '').toLowerCase();
      const riskColor = riskLevel === 'high' ? 'var(--danger)' : riskLevel === 'medium' ? 'var(--warning)' : 'var(--success)';

      html += `<div class="metric">
        <div class="label">${escapeHtml(symbol)}</div>
        <div class="value" style="color: ${riskColor}">${escapeHtml(String(sizing.recommended_size || '-').toUpperCase())}</div>
      </div>`;
    });
  }

  if (!html) {
    html = '<div class="insight">Risk metrics calculation in progress</div>';
  }

  el.innerHTML = html;
}

function renderCryptobibleInsights() {
  const el = document.getElementById('cryptobibleInsights');
  const insights = dashboardData.enhanced_metrics?.cryptobible_insights;

  if (!insights) {
    el.innerHTML = '<div class="insight warning">No cryptobible insights available</div>';
    return;
  }

  let html = '';

  if (insights.chapter_references?.length) {
    html += '<div style="margin-bottom: 16px;"><div style="font-weight: 600; color: var(--primary); margin-bottom: 8px;">Chapter References</div>';
    insights.chapter_references.slice(0, 3).forEach(ref => {
      html += `<div class="chapter-ref">
        <div class="chapter">${escapeHtml(ref.chapter)}</div>
        <div class="description">${escapeHtml(ref.description)}</div>
      </div>`;
    });
    html += '</div>';
  }

  if (insights.trading_principles?.length) {
    html += '<div style="margin-bottom: 16px;"><div style="font-weight: 600; color: var(--success); margin-bottom: 8px;">Trading Principles</div>';
    insights.trading_principles.slice(0, 3).forEach(principle => {
      html += `<div class="insight">${escapeHtml(principle)}</div>`;
    });
    html += '</div>';
  }

  const normalizedWarnings = (insights.risk_warnings || [])
    .map(normalizeWarningEntry)
    .filter(Boolean);

  if (normalizedWarnings.length) {
    html += '<div><div style="font-weight: 600; color: var(--danger); margin-bottom: 8px;">Risk Warnings</div>';
    normalizedWarnings.slice(0, 4).forEach(warning => {
      const severity = warning.severity === 'high' ? 'High' : warning.severity === 'low' ? 'Low' : 'Medium';
      html += `<div class="insight danger">
        <strong>${escapeHtml(warning.symbol)} — ${escapeHtml(warning.warning)}</strong><br>
        ${escapeHtml(warning.description)}<br>
        <small>Severity: ${escapeHtml(severity)}</small>
      </div>`;
    });
    html += '</div>';
  }

  if (!html) {
    html = '<div class="insight">Applying cryptobible framework analysis...</div>';
  }

  el.innerHTML = html;
}

function renderUpdateLog() {
  const el = document.getElementById('updateLog');
  const updates = dashboardData.update_log || [];

  if (!el) return;
  if (!updates.length) {
    el.innerHTML = '<div class="insight warning">No update log entries available</div>';
    return;
  }

  el.innerHTML = `<div class="update-log">${updates.map((entry, index) => `
    <div class="update-log-item"><strong>${index + 1}.</strong> ${escapeHtml(entry)}</div>
  `).join('')}</div>`;
}

function renderMarketSummary() {
  const el = document.getElementById('marketSummary');
  const summary = dashboardData.summary;
  const marketData = dashboardData.market_data;

  if (!summary || !marketData) {
    el.innerHTML = '<div class="insight warning">No market data available</div>';
    return;
  }

  let html = '';
  const biasColor = summary.market_bias === 'BULLISH' ? 'var(--success)' : summary.market_bias === 'BEARISH' ? 'var(--danger)' : 'var(--warning)';

  html += `<div class="metric">
    <div class="label">Market Bias</div>
    <div class="value" style="color: ${biasColor}">${escapeHtml(summary.market_bias)}</div>
  </div>`;

  html += `<div class="metric">
    <div class="label">Avg Change</div>
    <div class="value ${Number(summary.avg_change_pct) >= 0 ? 'positive' : 'negative'}">
      ${formatPercent(summary.avg_change_pct)}
    </div>
  </div>`;

  if (summary.top_gainer && summary.top_loser) {
    html += `<div class="metric">
      <div class="label">Top Gainer</div>
      <div class="value positive">${escapeHtml(summary.top_gainer)}</div>
    </div>`;

    html += `<div class="metric">
      <div class="label">Top Loser</div>
      <div class="value negative">${escapeHtml(summary.top_loser)}</div>
    </div>`;
  }

  html += '<div style="margin-top: 16px; font-weight: 600; color: var(--dark); margin-bottom: 8px;">Asset Performance</div>';

  Object.entries(marketData).slice(0, 4).forEach(([symbol, data]) => {
    const change = Number(data.change_pct || 0);
    const price = data.price || 0;

    html += `<div class="metric">
      <div class="label">${escapeHtml(symbol)}</div>
      <div class="value ${change >= 0 ? 'positive' : 'negative'}">
        ${formatPrice(price)} (${formatPercent(change)})
      </div>
    </div>`;
  });

  el.innerHTML = html;
}

function renderAll() {
  renderLiquidityHeatmap();
  renderOrderFlowMetrics();
  renderMarketStructure();
  renderDerivativesSummary();
  renderDerivativesBySymbol();
  renderRiskMetrics();
  renderCryptobibleInsights();
  renderMarketSummary();
  renderUpdateLog();
}

async function loadDashboard() {
  try {
    document.querySelectorAll('.loading').forEach(el => {
      el.innerHTML = '<div style="text-align: center; padding: 20px; color: #6b7280;">Loading data...</div>';
    });

    const res = await fetch('./dashboard-enhanced.json?_=' + Date.now());
    if (!res.ok) {
      throw new Error(`Failed to load dashboard: ${res.status}`);
    }

    dashboardData = await res.json();

    const computedTrt = formatTrtTimestamp(dashboardData.generated_at_utc, dashboardData.generated_at_local);

    document.getElementById('headline').textContent = dashboardData.summary?.headline || 'Market Dashboard';
    document.getElementById('subheadline').textContent = dashboardData.summary?.subheadline || '';
    document.getElementById('updatedLocal').textContent = computedTrt;
    document.getElementById('trackedAssets').textContent = dashboardData.summary?.tracked_assets ?? 0;
    document.getElementById('marketBias').textContent = dashboardData.summary?.market_bias || '-';
    document.getElementById('version').textContent = dashboardData.summary?.version || 'Unknown';

    renderAll();
    console.log('Dashboard loaded successfully');
  } catch (error) {
    console.error('Error loading dashboard:', error);
    document.querySelectorAll('.card > div:not(.card-header)').forEach(el => {
      el.innerHTML = `<div class="insight danger">
        Failed to load data: ${escapeHtml(error.message)}
        <br><small>Try refreshing the page</small>
      </div>`;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  setInterval(loadDashboard, 300000);
});
