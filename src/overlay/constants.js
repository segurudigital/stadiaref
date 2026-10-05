

// ─── Version ────────────────────────────────────────────────
// Single source of truth for the bundled version string. Exposed via
// `stadiaref.version` and emitted in the `stadiaref:ready` event detail.
// Kept in sync with package.json on release.
export const VERSION = '3.0.0-dev';

// ─── Configuration ──────────────────────────────────────────
export const ACCENT = '234, 88, 12';      // orange — functional UI accent
export const ACCENT_ON_DARK = '249, 115, 22';
export const ACCENT_HEX = '#EA580C';
export const ACCENT_WASH = 'rgba(234, 88, 12, 0.08)';
export const SEGURU_BLUE = '#00C0F3';     // brand primary — badge only
export const FONT_MONO = "'SF Mono', 'Fira Code', 'Cascadia Code', monospace";
export const FONT_UI = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";


// ─── Mode + depth display labels ─────────────────────────────
export const MODE_LABELS = { 0: 'Icons', 1: 'Off', 2: 'Full' };
export const OUTLINE_LABELS = { 'off': 'Off', 'section': 'Sections', 'block': 'Blocks' };
