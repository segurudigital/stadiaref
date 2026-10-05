// Colour tokens. The toolbar, panels and labels are built from these, and
// test/unit/contrast.test.mjs computes every text and background pair
// listed in PAIRS, so a colour can't change without its contrast being
// checked. Values come from the 3.0 wireframes; where a wireframe pair fell
// under 4.5:1 it was darkened (or lightened, on dark) and the change is
// noted beside it.

export const TOOLBAR = {
  light: {
    barBg: '#FFFFFF',
    barBd: '#E5E7EB',
    fg: '#111827',
    key: '#6B7280',
    pillBg: '#F9FAFB',
    accent: '#C2410C',
    wash: 'rgba(234, 88, 12, 0.08)',
    washBd: 'rgba(234, 88, 12, 0.22)',
    ring: 'rgba(234, 88, 12, 0.55)',
    ringGlow: 'rgba(234, 88, 12, 0.14)',
    util: '#4B5563',
    diagBg: 'rgba(17, 24, 39, 0.05)',
    dot: '#EA580C',
    dotOff: 'rgba(17, 24, 39, 0.22)',
    avatarBg: '#111827',
    refFg: '#C2410C',
    desc: '#6B7280',
    // The wireframe's key colour on the active wash would measure 4.40:1, so
    // the active option's note and key use the accent (4.68:1). Menu hover
    // is #F9FAFB, not #F3F4F6, so the grey notes stay at 4.61:1.
    hover: '#F9FAFB',
    tickOnBd: '#C2410C', tickOnBg: '#C2410C', tickOnFg: '#FFFFFF',
    tickOffBd: '#6B7280', tickOffBg: '#FFFFFF',
    autoBd: '#6B7280', autoFg: '#374151',
    tipBg: '#111827', tipFg: '#FFF7ED',
    rowHover: '#FFF7ED', rowHoverFg: '#9A3412',
    chipBg: '#F3F4F6', chipFg: '#374151',
    muted: '#4B5563',
    focus: '#EA580C',
    toastBg: '#FFF7ED', toastFg: '#9A3412', toastBd: 'rgba(234, 88, 12, 0.4)',
    pinOnBg: 'rgba(234, 88, 12, 0.1)', pinOnFg: '#9A3412', pinOnBd: 'rgba(234, 88, 12, 0.5)',
    statusBg: '#FFF7ED', statusFg: '#9A3412'
  },
  dark: {
    barBg: '#27272A',
    barBd: '#3F3F46',
    fg: '#F4F4F5',
    key: '#A1A1AA',
    pillBg: 'rgba(255, 255, 255, 0.07)',
    accent: '#FDBA74',
    wash: 'rgba(249, 115, 22, 0.16)',
    washBd: 'rgba(249, 115, 22, 0.36)',
    ring: 'rgba(249, 115, 22, 0.6)',
    ringGlow: 'rgba(249, 115, 22, 0.2)',
    util: '#D4D4D8',
    diagBg: 'rgba(255, 255, 255, 0.08)',
    dot: '#F97316',
    dotOff: 'rgba(255, 255, 255, 0.24)',
    avatarBg: '#71717A',
    refFg: '#FDBA74',
    desc: '#A1A1AA',
    // A light wash on hover keeps the grey notes at 4.5:1 or more (a solid
    // #3F3F46 would drop them to 4.07:1).
    hover: 'rgba(255, 255, 255, 0.06)',
    tickOnBd: '#F97316', tickOnBg: '#F97316', tickOnFg: '#111827',
    tickOffBd: '#A1A1AA', tickOffBg: 'transparent',
    autoBd: '#A1A1AA', autoFg: '#E4E4E7',
    tipBg: '#F4F4F5', tipFg: '#111827',
    rowHover: 'rgba(249, 115, 22, 0.16)', rowHoverFg: '#FDBA74',
    chipBg: '#3F3F46', chipFg: '#E4E4E7',
    muted: '#D4D4D8',
    focus: '#F97316',
    toastBg: '#27272A', toastFg: '#FDBA74', toastBd: 'rgba(249, 115, 22, 0.36)',
    pinOnBg: 'rgba(249, 115, 22, 0.16)', pinOnFg: '#FDBA74', pinOnBd: 'rgba(249, 115, 22, 0.5)',
    statusBg: '#27272A', statusFg: '#FDBA74'
  }
};

// Labels on the page, by tier. "light" and "dark" are the page surface the
// label sits on (StadiaRef's luminance check picks one).
export const LABELS = {
  section: {
    light: { bg: '#C2410C', fg: '#FFFFFF', bd: '#C2410C' },
    dark: { bg: '#F97316', fg: '#111827', bd: '#F97316' },
    hover: { bg: '#111827', fg: '#FFFFFF', bd: '#111827' }
  },
  block: {
    light: { bg: 'rgba(17, 24, 39, 0.92)', fg: '#FFF7ED', bd: 'rgba(17, 24, 39, 0.92)' },
    dark: { bg: 'rgba(255, 255, 255, 0.92)', fg: '#111827', bd: 'rgba(255, 255, 255, 0.92)' },
    hover: { bg: '#C2410C', fg: '#FFFFFF', bd: '#C2410C' }
  },
  element: {
    light: { bg: '#FFFFFF', fg: '#111827', bd: '#6B7280' },
    dark: { bg: 'rgba(17, 24, 39, 0.72)', fg: '#FFFFFF', bd: 'rgba(255, 255, 255, 0.6)' },
    hover: { bg: '#C2410C', fg: '#FFFFFF', bd: '#C2410C' }
  },
  unclassified: {
    light: { bg: '#FFFBEB', fg: '#92400E', bd: '#B45309' },
    dark: { bg: 'rgba(17, 24, 39, 0.72)', fg: '#FDE68A', bd: '#FBBF24' },
    hover: { bg: '#92400E', fg: '#FFFFFF', bd: '#92400E' }
  }
};

// Icons-mode dots. Opaque, so the letter keeps its contrast on any page.
export const ICONS = {
  section: { light: { bg: '#C2410C', fg: '#FFFFFF', bd: '#C2410C' }, dark: { bg: '#F97316', fg: '#111827', bd: '#F97316' } },
  block: { light: { bg: '#111827', fg: '#FFF7ED', bd: '#111827' }, dark: { bg: '#FFFFFF', fg: '#111827', bd: '#FFFFFF' } },
  element: { light: { bg: '#FFFFFF', fg: '#111827', bd: '#6B7280' }, dark: { bg: '#111827', fg: '#FFFFFF', bd: 'rgba(255, 255, 255, 0.6)' } },
  unclassified: { light: { bg: '#FFFBEB', fg: '#92400E', bd: '#B45309' }, dark: { bg: '#111827', fg: '#FDE68A', bd: '#FBBF24' } }
};

// Tier tags in the Tree and the address chain (always on the panel surface).
export const TAGS = {
  section: { tag: 'SEC', bg: '#C2410C', fg: '#FFFFFF', bd: '#C2410C' },
  block: { tag: 'BLK', bg: '#111827', fg: '#FFF7ED', bd: '#111827' },
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
  out.push(['icon tooltip', '#FFF7ED', 'rgba(17, 24, 39, 0.92)', 'page-any']);
  out.push(['pick chip hint', '#D1D5DB', '#111827', '#111827']);
  out.push(['pick chip section', '#111827', '#F97316', '#111827']);
  out.push(['pick chip block', '#111827', 'rgba(255, 255, 255, 0.92)', '#111827']);
  out.push(['pick chip element', '#FFFFFF', '#111827', '#111827']);
  out.push(['pick chip unclassified', '#FDE68A', '#111827', '#111827']);
  out.push(['pick sheet address', '#E5E7EB', '#111827', '#111827']);
  out.push(['pick sheet copy button', '#111827', '#F97316', '#111827']);
  out.push(['pick sheet button', '#F9FAFB', '#111827', '#111827']);
  ['light', 'dark'].forEach(function (theme) {
    var t = TOOLBAR[theme];
    out.push([theme + ' find field', t.fg, t.barBg, t.barBg]);
    out.push([theme + ' find label', t.muted, t.barBg, t.barBg]);
    out.push([theme + ' find selected row', t.rowHoverFg, t.rowHover, t.barBg]);
  });
  out.push(['cluster badge on light page', '#9A3412', '#FCE8DD', 'page-light']);
  out.push(['cluster badge on dark page', '#FDBA74', '#27272A', 'page-dark']);
  out.push(['badge hover', '#FFFFFF', '#C2410C', 'page-any']);
  out.push(['badge list item', '#FFF7ED', '#111827', '#111827']);
  out.push(['badge list item tag', '#D1D5DB', '#111827', '#111827']);
  out.push(['badge list item hover', '#FFFFFF', '#C2410C', '#111827']);
  return out;
}
