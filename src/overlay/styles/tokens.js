// Colour tokens. The toolbar, panels and labels are built from these, and
// test/unit/contrast.test.mjs computes every text and background pair
// listed in PAIRS, so a colour can't change without its contrast being
// checked. Values come from the 3.0 wireframes; where a wireframe pair fell
// under 4.5:1 it was darkened (or lightened, on dark) and the change is
// noted beside it.
//
// StadiaRef's colour is Signal Lime #A3E635 (Brand Handbook 4.12). Text on
// lime is black; lime is never text on a light surface, where Lime Ink
// #3F6212 is used instead; on a dark surface lime itself is the text.
// #BEF264 is the lime for labels on a dark page.

export const TOOLBAR = {
  light: {
    barBg: '#FFFFFF',
    barBd: '#E5E7EB',
    fg: '#111827',
    key: '#6B7280',
    pillBg: '#F9FAFB',
    accent: '#3F6212',
    wash: 'rgba(163, 230, 53, 0.16)',
    washBd: 'rgba(63, 98, 18, 0.3)',
    ring: 'rgba(63, 98, 18, 0.55)',
    ringGlow: 'rgba(163, 230, 53, 0.3)',
    util: '#4B5563',
    diagBg: 'rgba(17, 24, 39, 0.05)',
    dot: '#A3E635',
    // A lime dot on the white bar is 1.4:1, so it carries a Lime Ink ring.
    dotRing: '#3F6212',
    dotOff: 'rgba(17, 24, 39, 0.22)',
    avatarBg: '#111827',
    refFg: '#3F6212',
    desc: '#6B7280',
    // The wireframe's key colour on the active wash would measure 4.40:1, so
    // the active option's note and key use the accent (4.68:1). Menu hover
    // is #F9FAFB, not #F3F4F6, so the grey notes stay at 4.61:1.
    hover: '#F9FAFB',
    tickOnBd: '#3F6212', tickOnBg: '#A3E635', tickOnFg: '#000000',
    tickOffBd: '#6B7280', tickOffBg: '#FFFFFF',
    autoBd: '#6B7280', autoFg: '#374151',
    tipBg: '#111827', tipFg: '#F7FEE7',
    rowHover: '#F7FEE7', rowHoverFg: '#3F6212',
    chipBg: '#F3F4F6', chipFg: '#374151',
    muted: '#4B5563',
    // Focus is Seguru's on every surface (Brand Handbook, the Seguru Anchor,
    // rule 3): Deep Teal with a white halo on light.
    focus: '#00707E', focusHalo: '#FFFFFF',
    toastBg: '#F7FEE7', toastFg: '#3F6212', toastBd: 'rgba(63, 98, 18, 0.4)',
    pinOnBg: 'rgba(163, 230, 53, 0.16)', pinOnFg: '#3F6212', pinOnBd: 'rgba(63, 98, 18, 0.5)',
    statusBg: '#F7FEE7', statusFg: '#3F6212'
  },
  dark: {
    barBg: '#27272A',
    barBd: '#3F3F46',
    fg: '#F4F4F5',
    key: '#A1A1AA',
    pillBg: 'rgba(255, 255, 255, 0.07)',
    accent: '#A3E635',
    wash: 'rgba(163, 230, 53, 0.14)',
    washBd: 'rgba(163, 230, 53, 0.36)',
    ring: 'rgba(163, 230, 53, 0.6)',
    ringGlow: 'rgba(163, 230, 53, 0.2)',
    util: '#D4D4D8',
    diagBg: 'rgba(255, 255, 255, 0.08)',
    dot: '#A3E635', dotRing: 'transparent',
    dotOff: 'rgba(255, 255, 255, 0.24)',
    avatarBg: '#71717A',
    refFg: '#A3E635',
    desc: '#A1A1AA',
    // A light wash on hover keeps the grey notes at 4.5:1 or more (a solid
    // #3F3F46 would drop them to 4.07:1).
    hover: 'rgba(255, 255, 255, 0.06)',
    tickOnBd: '#A3E635', tickOnBg: '#A3E635', tickOnFg: '#000000',
    tickOffBd: '#A1A1AA', tickOffBg: 'transparent',
    autoBd: '#A1A1AA', autoFg: '#E4E4E7',
    tipBg: '#F4F4F5', tipFg: '#111827',
    rowHover: 'rgba(163, 230, 53, 0.14)', rowHoverFg: '#A3E635',
    chipBg: '#3F3F46', chipFg: '#E4E4E7',
    muted: '#D4D4D8',
    // Primary Blue with a black halo on dark (the Seguru Anchor, rule 3).
    focus: '#00C0F3', focusHalo: '#000000',
    toastBg: '#27272A', toastFg: '#A3E635', toastBd: 'rgba(163, 230, 53, 0.36)',
    pinOnBg: 'rgba(163, 230, 53, 0.14)', pinOnFg: '#A3E635', pinOnBd: 'rgba(163, 230, 53, 0.5)',
    statusBg: '#27272A', statusFg: '#A3E635'
  }
};

// Labels on the page, by tier. "light" and "dark" are the page surface the
// label sits on (StadiaRef's luminance check picks one).
export const LABELS = {
  section: {
    light: { bg: '#A3E635', fg: '#000000', bd: '#3F6212' },
    dark: { bg: '#BEF264', fg: '#000000', bd: '#BEF264' },
    hover: { bg: '#111827', fg: '#FFFFFF', bd: '#111827' }
  },
  block: {
    light: { bg: 'rgba(17, 24, 39, 0.92)', fg: '#F7FEE7', bd: 'rgba(17, 24, 39, 0.92)' },
    dark: { bg: 'rgba(255, 255, 255, 0.92)', fg: '#111827', bd: 'rgba(255, 255, 255, 0.92)' },
    hover: { bg: '#A3E635', fg: '#000000', bd: '#3F6212' }
  },
  element: {
    light: { bg: '#FFFFFF', fg: '#111827', bd: '#6B7280' },
    dark: { bg: 'rgba(17, 24, 39, 0.72)', fg: '#FFFFFF', bd: 'rgba(255, 255, 255, 0.6)' },
    hover: { bg: '#A3E635', fg: '#000000', bd: '#3F6212' }
  },
  unclassified: {
    light: { bg: '#FFFBEB', fg: '#92400E', bd: '#B45309' },
    dark: { bg: 'rgba(17, 24, 39, 0.72)', fg: '#FDE68A', bd: '#FBBF24' },
    hover: { bg: '#92400E', fg: '#FFFFFF', bd: '#92400E' }
  }
};

// Icons-mode dots. Opaque, so the letter keeps its contrast on any page.
export const ICONS = {
  section: { light: { bg: '#A3E635', fg: '#000000', bd: '#3F6212' }, dark: { bg: '#BEF264', fg: '#000000', bd: '#BEF264' } },
  block: { light: { bg: '#111827', fg: '#F7FEE7', bd: '#111827' }, dark: { bg: '#FFFFFF', fg: '#111827', bd: '#FFFFFF' } },
  element: { light: { bg: '#FFFFFF', fg: '#111827', bd: '#6B7280' }, dark: { bg: '#111827', fg: '#FFFFFF', bd: 'rgba(255, 255, 255, 0.6)' } },
  unclassified: { light: { bg: '#FFFBEB', fg: '#92400E', bd: '#B45309' }, dark: { bg: '#111827', fg: '#FDE68A', bd: '#FBBF24' } }
};

// Tier tags in the Tree and the address chain (always on the panel surface).
export const TAGS = {
  section: { tag: 'SEC', bg: '#A3E635', fg: '#000000', bd: '#3F6212' },
  block: { tag: 'BLK', bg: '#111827', fg: '#F7FEE7', bd: '#111827' },
  element: { tag: 'EL', bg: '#FFFFFF', fg: '#111827', bd: '#6B7280' },
  unclassified: { tag: '?', bg: '#FFFBEB', fg: '#92400E', bd: '#B45309' }
};

// Every text-on-background pair StadiaRef draws, for the contrast test.
// [name, text, background, backdrop]. `backdrop` is what a translucent
// background sits on: a colour, or 'page-light' / 'page-dark' for any page
// surface the luminance check would call light or dark.
export function pairs() {
  var out = [];
  ['light', 'dark'].forEach(function (theme) {
    var t = TOOLBAR[theme];
    var p = function (name, fg, bg, backdrop) { out.push([theme + ' ' + name, fg, bg, backdrop || t.barBg]); };
    p('control text', t.fg, t.pillBg);
    p('control key', t.key, t.pillBg);
    p('active control text', t.accent, t.wash);
    p('utility control text', t.util, t.barBg);
    p('menu hint', t.key, t.barBg);
    p('menu option', t.fg, t.barBg);
    p('menu option hover', t.fg, t.hover);
    p('menu option note', t.desc, t.barBg);
    p('menu option note hover', t.desc, t.hover);
    p('active menu option', t.accent, t.wash);
    p('tick', t.tickOnFg, t.tickOnBg);
    p('AUTO chip', t.autoFg, t.barBg);
    p('user role', t.key, t.pillBg);
    p('user avatar', '#FFFFFF', t.avatarBg);
    p('brand tip', t.tipFg, t.tipBg);
    p('panel title', t.fg, t.barBg);
    p('panel muted text', t.muted, t.barBg);
    p('panel chip', t.chipFg, t.chipBg);
    p('tree row hover', t.rowHoverFg, t.rowHover);
    p('toast', t.toastFg, t.toastBg);
    p('pinned button', t.pinOnFg, t.pinOnBg);
    p('dialog status line', t.statusFg, t.statusBg);
  });
  Object.keys(LABELS).forEach(function (tier) {
    var l = LABELS[tier];
    out.push(['label ' + tier + ' on light page', l.light.fg, l.light.bg, 'page-light']);
    out.push(['label ' + tier + ' on dark page', l.dark.fg, l.dark.bg, 'page-dark']);
    out.push(['label ' + tier + ' hover', l.hover.fg, l.hover.bg, 'page-any']);
    out.push(['icon ' + tier + ' on light page', ICONS[tier].light.fg, ICONS[tier].light.bg, 'page-light']);
    out.push(['icon ' + tier + ' on dark page', ICONS[tier].dark.fg, ICONS[tier].dark.bg, 'page-dark']);
    out.push(['tier tag ' + tier, TAGS[tier].fg, TAGS[tier].bg, '#FFFFFF']);
  });
  out.push(['icon tooltip', '#F7FEE7', 'rgba(17, 24, 39, 0.92)', 'page-any']);
  out.push(['pick chip hint', '#D1D5DB', '#111827', '#111827']);
  out.push(['pick chip section', '#000000', '#A3E635', '#111827']);
  out.push(['pick chip block', '#111827', 'rgba(255, 255, 255, 0.92)', '#111827']);
  out.push(['pick chip element', '#FFFFFF', '#111827', '#111827']);
  out.push(['pick chip unclassified', '#FDE68A', '#111827', '#111827']);
  out.push(['pick sheet address', '#E5E7EB', '#111827', '#111827']);
  out.push(['pick sheet copy button', '#000000', '#A3E635', '#111827']);
  out.push(['pick sheet button', '#F9FAFB', '#111827', '#111827']);
  // The panel in Astro's Dev Toolbar (panel.js), on Astro's dark window.
  out.push(['astro panel text', '#F4F4F5', '#13151A', '#13151A']);
  out.push(['astro panel key', '#A1A1AA', '#13151A', '#13151A']);
  out.push(['astro panel version', '#A1A1AA', '#13151A', '#13151A']);
  out.push(['astro panel count', '#D4D4D8', '#13151A', '#13151A']);
  out.push(['astro panel segment', '#E4E4E7', '#25272E', '#13151A']);
  out.push(['astro panel segment on', '#000000', '#A3E635', '#13151A']);
  out.push(['astro panel AUTO chip', '#E4E4E7', '#13151A', '#13151A']);
  out.push(['astro panel pressed button', '#A3E635', '#13151A', '#13151A']);
  ['light', 'dark'].forEach(function (theme) {
    var t = TOOLBAR[theme];
    out.push([theme + ' find field', t.fg, t.barBg, t.barBg]);
    out.push([theme + ' find label', t.muted, t.barBg, t.barBg]);
    out.push([theme + ' find selected row', t.rowHoverFg, t.rowHover, t.barBg]);
  });
  out.push(['cluster badge on light page', '#3F6212', '#ECFCCB', 'page-light']);
  out.push(['cluster badge on dark page', '#A3E635', '#27272A', 'page-dark']);
  out.push(['badge hover', '#000000', '#A3E635', 'page-any']);
  out.push(['badge list item', '#F7FEE7', '#111827', '#111827']);
  out.push(['badge list item tag', '#D1D5DB', '#111827', '#111827']);
  out.push(['badge list item hover', '#000000', '#A3E635', '#111827']);
  return out;
}
