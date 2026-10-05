// Entry point for `import 'stadiaref'` (dist/index.mjs). Importing it
// starts the overlay in a browser and does nothing on a server. The default
// export is the API, the same object as window.stadiaref (undefined on a
// server). The core is imported from ./core.mjs, not bundled, so there is
// one profile registry whichever entry point a profile is registered through.
import { start } from './start.js';

export default start();
