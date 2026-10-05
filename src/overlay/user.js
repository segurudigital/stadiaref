import { S } from './state.js';
import { emitEvent } from './events.js';

// ─── Identity (host-supplied user) ──────────────────────────
export function renderUser() {
  var pill = S.toolbar.querySelector('[data-sdt-user-pill]');
  if (!pill) return;
  var avatar = pill.querySelector('[data-sdt-user-avatar]');
  var nameEl = pill.querySelector('[data-sdt-user-name]');
  var roleEl = pill.querySelector('[data-sdt-user-role]');
  if (!S.currentUser || !S.currentUser.name) {
    // Clear inner spans on `setUser(null)`. The pill is hidden via the class
    // toggle, but `role="status"` content is sometimes surfaced by assistive
    // tech even when display:none — leaving stale text would let a previous
    // user's name leak after sign-out.
    if (avatar) avatar.textContent = '';
    if (nameEl) nameEl.textContent = '';
    if (roleEl) { roleEl.textContent = ''; roleEl.style.display = 'none'; }
    pill.classList.remove('sdt-toolbar__user--visible');
    pill.removeAttribute('title');
    return;
  }
  var name = String(S.currentUser.name);
  var role = S.currentUser.role ? String(S.currentUser.role) : '';
  var initial = name.replace(/\s+/g, ' ').trim().charAt(0).toUpperCase() || '·';
  if (avatar) avatar.textContent = initial;
  if (nameEl) nameEl.textContent = name;
  if (roleEl) {
    if (role) {
      roleEl.textContent = role;
      roleEl.style.display = '';
    } else {
      roleEl.textContent = '';
      roleEl.style.display = 'none';
    }
  }
  pill.title = role ? (name + ' · ' + role) : name;
  pill.classList.add('sdt-toolbar__user--visible');
}

// Snapshot the documented public fields only. Anything else the host hands us
// (auth tokens, internal IDs) is dropped on the floor. Returns a fresh object
// every call so external mutation can't reach SDT's stored state.
export function snapshotUser(u) {
  if (!u || typeof u !== 'object') return null;
  var clone = {};
  if ('name'  in u) clone.name  = u.name;
  if ('role'  in u) clone.role  = u.role;
  if ('id'    in u) clone.id    = u.id;
  if ('email' in u) clone.email = u.email;
  return clone;
}

export function setUser(user) {
  if (user === null || typeof user === 'undefined') {
    S.currentUser = null;
  } else if (typeof user === 'object') {
    S.currentUser = snapshotUser(user);
  } else {
    return;
  }
  renderUser();
  emitEvent('user-change', { user: getUser() });
}

export function getUser() { return snapshotUser(S.currentUser); }
