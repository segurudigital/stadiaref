

// ─── Version ────────────────────────────────────────────────
// Single source of truth for the bundled version string. Exposed via
// `stadiaref.version` and emitted in the `stadiaref:ready` event detail.
// Kept in sync with package.json on release.
export const VERSION = '3.0.0-dev';

// ─── Configuration ──────────────────────────────────────────
export const FONT_MONO = "'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace";
export const FONT_UI = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";


// ─── Mode + depth display labels ─────────────────────────────
export const MODE_LABELS = { 0: 'Icons', 1: 'Off', 2: 'Full' };
export const OUTLINE_LABELS = { 'off': 'Off', 'section': 'Sections', 'block': 'Blocks' };
