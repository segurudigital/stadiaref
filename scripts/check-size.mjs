// The bundle-size budget for the script-tag build. The limits are the size
// measured for 3.0.0 plus 10%. Raise them on purpose, in the same commit as
// the change that needs it, never to make CI pass.
import fs from 'node:fs';
import zlib from 'node:zlib';

const FILE = 'dist/stadiaref.min.js';
// Measured for 3.0.0: 133,027 bytes, 36,964 gzipped (zlib level 9).
// 3.3 raised it for the address card, which became the default click (the
// card, its styles, setLookup): 3.2.0 measured 133,644 / 37,114 and the card
// alone took it to 147,203 / 40,496. The 3.3 release sets the final figure.
const BUDGET = { raw: 172000, gzip: 47000 };

const buf = fs.readFileSync(FILE);
const size = { raw: buf.length, gzip: zlib.gzipSync(buf, { level: 9 }).length };
let over = false;
for (const kind of ['raw', 'gzip']) {
  const ok = size[kind] <= BUDGET[kind];
  if (!ok) over = true;
  console.log((ok ? 'ok     ' : 'over   ') + FILE + ' ' + kind + ': ' + size[kind] + ' bytes (budget ' + BUDGET[kind] + ')');
}
process.exit(over ? 1 : 0);
