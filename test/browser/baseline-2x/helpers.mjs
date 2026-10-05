// The 2.x baseline runs against the 2.x names: window.seguruDebugToolbar,
// window.seguruDebugConfig and the sdt:* events.
import { makeHelpers, OLD } from '../helpers.mjs';

export { countVisible, visibleFullLabelRefs, shadow, press, settle, HOST_ID } from '../helpers.mjs';
export const { harness, recordEvents, events, clearEvents, open, expectVisible, GLOBAL, EVENT_PREFIX } = makeHelpers(OLD);
