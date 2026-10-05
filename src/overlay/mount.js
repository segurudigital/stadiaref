import { S } from './state.js';
import { injectLabels, resolveLabelOverlaps, syncAllVoidHosts } from './labels.js';
import { applyOutlineMode } from './outline.js';
import { autoRefSections, clearAutoRefs, convertClassRefs } from './survey.js';
import { TIER_NAMES } from './tiers.js';
import { buildTreePanel } from './tree.js';
import { LABEL_NAMES } from './mode.js';
import { applyDockPosition } from './dock.js';
import { applyDialogScope } from './dialogs.js';
import { markSurvey, quiet, startWatching } from './watch.js';

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
  startWatching();
}

function setRootAttr(root, name, value) {
  if (value === null) {
    if (root.hasAttribute(name)) root.removeAttribute(name);
  } else if (root.getAttribute(name) !== value) {
    root.setAttribute(name, value);
  }
}

// Global state as attributes on <html>, read by the label stylesheet.
export function applyRootState() {
  if (!S.mounted) return;
  // Compared before set, so re-asserting them (watch.js) causes no change.
  var root = document.documentElement;
  var hidden = TIER_NAMES.filter(function (t) { return !S.tiers[t]; });
  setRootAttr(root, 'data-stadiaref-visible', S.presentationMode ? null : '');
  setRootAttr(root, 'data-stadiaref-labels', LABEL_NAMES[S.state] || 'full');
  setRootAttr(root, 'data-stadiaref-mode', S.pickMode ? 'pick' : null);
  setRootAttr(root, 'data-stadiaref-hidden-tiers', hidden.length ? hidden.join(' ') : null);
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
  syncAllVoidHosts();
  applyDialogScope();
  applyDockPosition();
  markSurvey();
  // The page changes made by this survey are StadiaRef's own.
  quiet();
}

// Show: mount on first use, then bring the page up to date with the state.
export function goLive() {
  mount();
  S.shadowHost.style.display = '';
  applyDockPosition();
  applyRootState();
  survey();
}

export function goHidden() {
  if (!S.mounted) return;
  S.shadowHost.style.display = 'none';
  applyRootState();
  applyDialogScope();
}
