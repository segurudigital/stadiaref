import { S } from './state.js';
import { injectLabels, resolveLabelOverlaps } from './labels.js';
import { applyOutlineMode } from './outline.js';
import { autoRefSections, clearAutoRefs, convertClassRefs } from './survey.js';
import { TIER_NAMES } from './tiers.js';
import { buildTreePanel } from './tree.js';
import { LABEL_NAMES } from './mode.js';

// ─── Nothing is written to the page while StadiaRef is hidden ─────
// Until the toolbar is first shown, StadiaRef keeps everything in memory:
// no host element, no stylesheet, no labels, no attributes, no automatic
// addresses. (The class converter is the one exception: when it is on it
// still runs at start, as in 2.x.) The first show mounts the host and the
// label stylesheet and runs the first survey. While hidden again, changes
// are only recorded; the next show applies them.

// True while StadiaRef is mounted and shown: the only time it writes to the page.
export function isLive() {
  return S.mounted && !S.presentationMode;
}

function mount() {
  if (S.mounted) return;
  document.head.appendChild(S.labelCss);
  document.body.appendChild(S.shadowHost);
  S.mounted = true;
}

// Global state as attributes on <html>, read by the label stylesheet.
export function applyRootState() {
  if (!S.mounted) return;
  var root = document.documentElement;
  if (S.presentationMode) root.removeAttribute('data-stadiaref-visible');
  else root.setAttribute('data-stadiaref-visible', '');
  root.setAttribute('data-stadiaref-labels', LABEL_NAMES[S.state] || 'full');
  var hidden = TIER_NAMES.filter(function (t) { return !S.tiers[t]; });
  if (hidden.length) root.setAttribute('data-stadiaref-hidden-tiers', hidden.join(' '));
  else root.removeAttribute('data-stadiaref-hidden-tiers');
}

// One survey: automatic addresses, labels, tiers, overlaps, outlines.
export function survey() {
  if (!isLive()) return;
  convertClassRefs();
  if (S.autoRefEnabled) autoRefSections();
  else clearAutoRefs();
  injectLabels();
  resolveLabelOverlaps();
  applyOutlineMode();
  if (S.treeOpen) buildTreePanel();
}

// Show: mount on first use, then bring the page up to date with the state.
export function goLive() {
  mount();
  S.shadowHost.style.display = '';
  applyRootState();
  survey();
}

export function goHidden() {
  if (!S.mounted) return;
  S.shadowHost.style.display = 'none';
  applyRootState();
}
