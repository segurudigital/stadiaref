// Builds everything that ships:
//   dist/stadiaref.min.js  the overlay as one IIFE for a script tag
//   dist/core.mjs          stadiaref/core, the grammar on its own (no DOM)
// `node scripts/build.mjs --watch` rebuilds the overlay on change, unminified,
// into dist/stadiaref.js.
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

if (watch) {
  const ctx = await esbuild.context({
    entryPoints: ['src/overlay/index.js'],
    bundle: true,
    format: 'iife',
    outfile: 'dist/stadiaref.js',
    logLevel: 'info',
  });
  await ctx.watch();
} else {
  await esbuild.build({
    entryPoints: ['src/overlay/index.js'],
    bundle: true,
    minify: true,
    format: 'iife',
    outfile: 'dist/stadiaref.min.js',
    logLevel: 'info',
  });
  await esbuild.build({
    entryPoints: ['src/core/index.js'],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    outfile: 'dist/core.mjs',
    logLevel: 'info',
  });
}
