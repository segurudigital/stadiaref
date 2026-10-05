import { FONT_MONO } from '../constants.js';

// ─── Label CSS (injected into the page) ──────────────────────
// Labels live beside the elements they name, in the page's DOM, so this
// sheet goes into the page's <head> the first time StadiaRef is shown.
// `all: initial` resets inherited page and page-builder styles before our
// own properties are declared.
//
// Global state is read from attributes on <html>, never from classes on
// <body> or on the page's elements:
//   data-stadiaref-visible       present while the toolbar is shown
//   data-stadiaref-labels        full | icons | off
//   data-stadiaref-hidden-tiers  the tiers Show is hiding
// Every label node carries its own stadiaref-tier-* and stadiaref-on-light /
// stadiaref-on-dark classes; an automatic address adds stadiaref-auto.
//
// Colours are the 3.0 label spec. Text and background pairs are at least
// 4.5:1; test/unit/contrast.test.mjs checks them, the translucent ones over
// the worst backdrop of their surface.

const LABEL_NODES = '.stadiaref-ref-icon, .stadiaref-ref-tooltip, .stadiaref-ref-full-label, .stadiaref-ref-link, .stadiaref-cluster-badge, .stadiaref-block-group-badge, .stadiaref-outline, .stadiaref-ref-void-host';

export const LABEL_CSS = `
/* --- What is drawn --- */
html:not([data-stadiaref-visible]) :is(${LABEL_NODES}) { display: none !important; }
html[data-stadiaref-labels="off"] :is(.stadiaref-ref-icon, .stadiaref-ref-tooltip, .stadiaref-ref-full-label, .stadiaref-ref-link, .stadiaref-cluster-badge, .stadiaref-block-group-badge) { display: none !important; }
html[data-stadiaref-labels="full"] :is(.stadiaref-ref-icon, .stadiaref-ref-tooltip) { display: none !important; }
html:not([data-stadiaref-labels="full"]) .stadiaref-ref-full-label { display: none !important; }
html[data-stadiaref-hidden-tiers~="section"] .stadiaref-tier-section,
html[data-stadiaref-hidden-tiers~="block"] .stadiaref-tier-block,
html[data-stadiaref-hidden-tiers~="element"] .stadiaref-tier-element,
html[data-stadiaref-hidden-tiers] .stadiaref-tier-unclassified { display: none !important; }
.stadiaref-ref-hidden, .stadiaref-ref-clustered, .stadiaref-collapsed { display: none !important; }
/* Outside the open host dialog (dialogs.js). */
.stadiaref-ref-outside { display: none !important; }
/* Labels step aside while Pick is on */
html[data-stadiaref-mode="pick"] :is(${LABEL_NODES}) { display: none !important; }

/* --- Full label: a tier tag and the address --- */
.stadiaref-ref-full-label {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  top: 2px;
  left: 2px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  width: max-content;
  max-width: 280px;
  padding: 2px 5px;
  border: 1px solid transparent;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  font-family: ${FONT_MONO};
  font-size: 10px;
  line-height: 1.3;
  white-space: nowrap;
  z-index: 90;
  cursor: pointer;
  pointer-events: none;
  user-select: none;
}
.stadiaref-ref-tag {
  all: initial;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  font-weight: 700;
  letter-spacing: 0.3px;
  white-space: nowrap;
  flex-shrink: 0;
}
.stadiaref-ref-address {
  all: initial;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Section: solid orange */
.stadiaref-ref-full-label.stadiaref-tier-section.stadiaref-on-light { background: #C2410C; color: #FFFFFF; border-color: #C2410C; }
.stadiaref-ref-full-label.stadiaref-tier-section.stadiaref-on-dark { background: #F97316; color: #111827; border-color: #F97316; }
.stadiaref-ref-full-label.stadiaref-tier-section:hover { background: #111827; color: #FFFFFF; border-color: #111827; }
/* Block: dark */
.stadiaref-ref-full-label.stadiaref-tier-block.stadiaref-on-light { background: rgba(17, 24, 39, 0.92); color: #FFF7ED; border-color: rgba(17, 24, 39, 0.92); }
.stadiaref-ref-full-label.stadiaref-tier-block.stadiaref-on-dark { background: rgba(255, 255, 255, 0.92); color: #111827; border-color: rgba(255, 255, 255, 0.92); }
/* Element: light, with a border */
.stadiaref-ref-full-label.stadiaref-tier-element.stadiaref-on-light { background: #FFFFFF; color: #111827; border-color: #6B7280; }
.stadiaref-ref-full-label.stadiaref-tier-element.stadiaref-on-dark { background: rgba(17, 24, 39, 0.72); color: #FFFFFF; border-color: rgba(255, 255, 255, 0.6); }
.stadiaref-ref-full-label.stadiaref-tier-block:hover,
.stadiaref-ref-full-label.stadiaref-tier-element:hover { background: #C2410C; color: #FFFFFF; border-color: #C2410C; }
/* Unclassified: dashed amber, no shadow */
.stadiaref-ref-full-label.stadiaref-tier-unclassified { box-shadow: none; border-style: dashed; }
.stadiaref-ref-full-label.stadiaref-tier-unclassified.stadiaref-on-light { background: #FFFBEB; color: #92400E; border-color: #B45309; }
.stadiaref-ref-full-label.stadiaref-tier-unclassified.stadiaref-on-dark { background: rgba(17, 24, 39, 0.72); color: #FDE68A; border-color: #FBBF24; }
.stadiaref-ref-full-label.stadiaref-tier-unclassified:hover { background: #92400E; color: #FFFFFF; border-color: #92400E; border-style: solid; }
/* Automatic address: the tier's colours with a dashed border. Where the
   tier's border matches its background, the dash takes the text colour. */
.stadiaref-ref-full-label.stadiaref-auto { border-style: dashed; }
.stadiaref-ref-full-label.stadiaref-auto.stadiaref-tier-section,
.stadiaref-ref-full-label.stadiaref-auto.stadiaref-tier-block { border-color: currentColor; }

/* --- Icons mode: a 16px dot carrying the tier's letter --- */
.stadiaref-ref-icon {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border: 1px solid transparent;
  border-radius: 50%;
  font-family: ${FONT_MONO};
  font-size: 9px;
  font-weight: 700;
  line-height: 14px;
  text-align: center;
  z-index: 90;
  cursor: pointer;
  pointer-events: none;
  user-select: none;
}
.stadiaref-ref-icon.stadiaref-tier-section.stadiaref-on-light { background: #C2410C; color: #FFFFFF; border-color: #C2410C; }
.stadiaref-ref-icon.stadiaref-tier-section.stadiaref-on-dark { background: #F97316; color: #111827; border-color: #F97316; }
.stadiaref-ref-icon.stadiaref-tier-block.stadiaref-on-light { background: #111827; color: #FFF7ED; border-color: #111827; }
.stadiaref-ref-icon.stadiaref-tier-block.stadiaref-on-dark { background: #FFFFFF; color: #111827; border-color: #FFFFFF; }
.stadiaref-ref-icon.stadiaref-tier-element.stadiaref-on-light { background: #FFFFFF; color: #111827; border-color: #6B7280; }
.stadiaref-ref-icon.stadiaref-tier-element.stadiaref-on-dark { background: #111827; color: #FFFFFF; border-color: rgba(255, 255, 255, 0.6); }
.stadiaref-ref-icon.stadiaref-tier-unclassified { border-style: dashed; }
.stadiaref-ref-icon.stadiaref-tier-unclassified.stadiaref-on-light { background: #FFFBEB; color: #92400E; border-color: #B45309; }
.stadiaref-ref-icon.stadiaref-tier-unclassified.stadiaref-on-dark { background: #111827; color: #FDE68A; border-color: #FBBF24; }
.stadiaref-ref-icon.stadiaref-auto { border-style: dashed; }
.stadiaref-ref-icon.stadiaref-auto.stadiaref-tier-section,
.stadiaref-ref-icon.stadiaref-auto.stadiaref-tier-block { border-color: currentColor; }
.stadiaref-ref-icon:hover { box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.35); }

/* The address beside a dot, on hover or keyboard focus. */
.stadiaref-ref-tooltip {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  top: 2px;
  left: 22px;
  padding: 4px 7px;
  background: rgba(17, 24, 39, 0.92);
  color: #FFF7ED;
  border-radius: 3px;
  font-family: ${FONT_MONO};
  font-size: 10px;
  line-height: 1;
  white-space: nowrap;
  z-index: 91;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.1s, transform 0.1s;
  cursor: pointer;
  pointer-events: none;
  user-select: none;
}
.stadiaref-ref-icon:hover + .stadiaref-ref-tooltip,
.stadiaref-ref-icon:focus-visible + .stadiaref-ref-tooltip,
.stadiaref-ref-tooltip:hover {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

/* Labels only take the pointer once StadiaRef knows they are visible. */
.stadiaref-ref-icon.stadiaref-visible-host,
.stadiaref-ref-full-label.stadiaref-visible-host { pointer-events: auto; }

/* --- Stagger leader line --- */
.stadiaref-ref-link {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  top: 2px;
  left: 9px;
  width: 1px;
  height: 0;
  background: #C2410C;
  z-index: 89;
  pointer-events: none;
  opacity: 0;
}
.stadiaref-ref-link.stadiaref-on-dark { background: #FDBA74; }

/* --- Void elements: labels mount in a host over the element's box --- */
.stadiaref-ref-void-host {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  pointer-events: none;
  z-index: 95;
}

/* --- Outline guides: StadiaRef's own frame inside the element --- */
.stadiaref-outline {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  z-index: 88;
}
.stadiaref-outline--section { border: 2px solid rgba(234, 88, 12, 0.9); box-shadow: inset 0 0 0 1px rgba(234, 88, 12, 0.2), inset 0 14px 0 0 rgba(234, 88, 12, 0.08); }
.stadiaref-outline--section.stadiaref-on-dark { border-color: rgba(249, 115, 22, 0.98); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14), inset 0 14px 0 0 rgba(249, 115, 22, 0.12); }
.stadiaref-outline--block { border: 1px dashed rgba(234, 88, 12, 0.6); box-shadow: inset 0 0 0 1px rgba(234, 88, 12, 0.08); }
.stadiaref-outline--block.stadiaref-on-dark { border-color: rgba(255, 255, 255, 0.36); box-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.14); }

/* --- "+N" cluster badge and its list --- */
.stadiaref-cluster-badge {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  padding: 2px 6px;
  background: #FCE8DD;
  color: #9A3412;
  border: 1px solid rgba(234, 88, 12, 0.5);
  border-radius: 10px;
  font-family: ${FONT_MONO};
  font-size: 10px;
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
  cursor: pointer;
  z-index: 92;
  pointer-events: auto;
  user-select: none;
}
.stadiaref-cluster-badge.stadiaref-on-dark { background: #27272A; color: #FDBA74; border-color: rgba(249, 115, 22, 0.5); }
.stadiaref-cluster-badge:hover { background: #C2410C; color: #FFFFFF; border-color: #C2410C; }

/* --- "+N blocks" block group badge and its list --- */
.stadiaref-block-group-badge {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  padding: 3px 7px;
  background: #FCE8DD;
  color: #9A3412;
  border-radius: 999px;
  font-family: ${FONT_MONO};
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  z-index: 92;
  pointer-events: auto;
  user-select: none;
}
.stadiaref-block-group-badge.stadiaref-on-dark { background: #27272A; color: #FDBA74; }

.stadiaref-cluster-popover,
.stadiaref-block-group-popover {
  all: initial;
  box-sizing: border-box;
  display: none;
  flex-direction: column;
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 180px;
  max-width: 320px;
  padding: 4px;
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.24);
  z-index: 93;
  pointer-events: auto;
}
.stadiaref-cluster-badge:hover > .stadiaref-cluster-popover,
.stadiaref-cluster-popover:hover,
.stadiaref-block-group-badge:hover > .stadiaref-block-group-popover,
.stadiaref-block-group-popover:hover { display: flex; }
.stadiaref-cluster-item,
.stadiaref-block-group-item {
  all: initial;
  box-sizing: border-box;
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 3px;
  font-family: ${FONT_MONO};
  font-size: 10px;
  line-height: 1.3;
  color: #FFF7ED;
  white-space: nowrap;
  cursor: pointer;
}
.stadiaref-cluster-item:hover,
.stadiaref-block-group-item:hover { background: #C2410C; color: #FFFFFF; }
.stadiaref-cluster-item-tag,
.stadiaref-block-group-item-type {
  all: initial;
  font-family: inherit;
  font-size: inherit;
  font-weight: 700;
  color: #D1D5DB;
  flex-shrink: 0;
}
.stadiaref-cluster-item:hover .stadiaref-cluster-item-tag,
.stadiaref-block-group-item:hover .stadiaref-block-group-item-type { color: inherit; }
.stadiaref-cluster-item-ref,
.stadiaref-block-group-item-ref {
  all: initial;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
`;
