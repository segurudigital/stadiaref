// generic (the default): any address that passes the core rules is valid,
// and the tier comes from where the element sits among addressed elements.
import { tierFromNesting } from './nesting.js';

export const generic = {
  name: 'generic',
  classify: function (address, context) {
    return tierFromNesting(context);
  },
  validate: function () {
    return [];
  },
  parse: function (address) {
    return { segments: address.split('-') };
  }
};
