// The core rules every profile inherits. A profile can add rules; it can't
// relax these. Uniqueness on a screen needs the whole screen, so the overlay
// checks that, not the core.
export const MAX_LENGTH = 160;

// Problems are short phrases for people. They aren't a stable API.
export function coreProblems(address) {
  if (typeof address !== 'string') return ['not a string'];
  if (address === '') return ['empty'];
  var problems = [];
  if (/[A-Z]/.test(address)) problems.push('uppercase letters');
  if (/_/.test(address)) problems.push('underscore');
  if (/\s/.test(address)) problems.push('spaces');
  if (/[^A-Za-z0-9_\s-]/.test(address)) problems.push('characters other than a-z, 0-9 and hyphens');
  if (address.charAt(0) === '-') problems.push('starts with a hyphen');
  if (address.length > 1 && address.charAt(address.length - 1) === '-') problems.push('ends with a hyphen');
  if (address.indexOf('--') !== -1) problems.push('two hyphens in a row');
  if (address.length > MAX_LENGTH) problems.push('longer than ' + MAX_LENGTH + ' characters');
  return problems;
}
