/**
 * StadiaRef — an address for every part of the screen.
 * https://github.com/segurudigital/stadiaref
 *
 * Shows data-ref attributes as labels you can point at and copy.
 * Starts hidden: press D to show it. Labels (L), outline (O), the Tree,
 * click-to-copy and the JavaScript API on window.stadiaref.
 *
 * Usage:
 *   <script src="stadiaref.min.js"></script>
 *   window.stadiarefConfig = { … } before the tag to configure it.
 */

// Entry point for the script tag. esbuild bundles this file and its
// imports into the single IIFE in dist/stadiaref.min.js. Importing modules
// does no DOM work; start() does it (see start.js).
import { start } from './start.js';

start();
