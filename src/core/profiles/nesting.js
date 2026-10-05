// Tier from nesting, shared by the generic and app profiles.
// context = { depth, hasAddressedChildren }, counting authored addresses only.
export function tierFromNesting(context) {
  if (!context || typeof context.depth !== 'number') return null;
  if (context.depth === 0) return 'section';
  return context.hasAddressedChildren ? 'block' : 'element';
}
