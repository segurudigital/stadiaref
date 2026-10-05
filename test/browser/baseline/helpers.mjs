// The baseline on the 3.0 names: window.stadiaref, window.stadiarefConfig
// and the stadiaref:* events.
import { makeHelpers, NEW } from '../helpers.mjs';

export { countVisible, visibleFullLabelRefs, labelTiers, shadow, press, settle, HOST_ID } from '../helpers.mjs';
export const { harness, recordEvents, events, clearEvents, open, expectVisible, GLOBAL, EVENT_PREFIX } = makeHelpers(NEW);
