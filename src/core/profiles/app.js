// app: [product]-[surface]-[screen]-[part] for web apps and PWAs. Tier from
// nesting, as in generic. Where the screen ends and the part begins can't
// be told from the text, so parse() returns the rest as one `path`.
import { tierFromNesting } from './nesting.js';

export const SURFACES = ['app', 'pwa', 'mobile', 'wp-admin', 'wp-frontend', 'shopify-admin', 'shopify-storefront'];

// { product, surface, rest } or null when there is no product and known surface.
function split(address) {
  var segs = address.split('-');
  if (segs.length < 2 || !segs[0]) return null;
  var two = segs.length >= 3 ? segs[1] + '-' + segs[2] : null;
  if (two && SURFACES.indexOf(two) !== -1) {
    return { product: segs[0], surface: two, path: segs.slice(3).join('-') };
  }
  if (SURFACES.indexOf(segs[1]) !== -1) {
    return { product: segs[0], surface: segs[1], path: segs.slice(2).join('-') };
  }
  return null;
}

export const app = {
  name: 'app',
  classify: function (address, context) {
    return split(address) ? tierFromNesting(context) : null;
  },
  validate: function (address) {
    return split(address) ? [] : ['no product and known surface at the start (' + SURFACES.join(', ') + ')'];
  },
  parse: function (address) {
    return split(address);
  }
};
