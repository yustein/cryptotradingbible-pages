# Dashboard Site Structure

## Canonical entrypoints

### Primary user-facing dashboard
- `index.html`
- Uses canonical `dashboard-data.json` as the main signal/advisory source
- Also reads `dashboard-enhanced.json` and `news-data.json` for richer panels

### Slim enhanced dashboard
- `dashboard-enhanced.html`
- Uses `dashboard-enhanced.js`
- Reads `dashboard-enhanced.json`

## Canonical data files
- `dashboard-data.json` — authoritative signal/advisory/dashboard state
- `dashboard-enhanced.json` — enhanced analytics layer, aligned to canonical dashboard data
- `news-data.json` — news layer

## Cleanup decision
All old themed, experimental, duplicate, and test dashboard variants were moved to `legacy/`.

If a future page is reintroduced, it should load from the canonical data pipeline instead of implementing its own signal logic.
