// Builds everything that ships:
//   dist/stadiaref.min.js  the overlay as one IIFE for a script tag
//   dist/index.mjs         the overlay as an ES module (`import 'stadiaref'`);
//                          imports ./core.mjs rather than bundling it
//   dist/core.mjs          stadiaref/core, the grammar on its own (no DOM)
//   dist/vite.mjs          stadiaref/vite, the Vite plugin
//   dist/astro.mjs         stadiaref/astro, the Astro integration
//   dist/astro-app.mjs     its Dev Toolbar app (loaded by Astro, not exported)
// `node scripts/build.mjs --watch` rebuilds the overlay on change, unminified,
// into dist/stadiaref.js.
import * as esbuild from 'esbuild';
import path from 'node:path';

const watch = process.argv.includes('--watch');
const CORE_INDEX = path.resolve('src/core/index.js');

// In dist/index.mjs the core stays a separate module, so the overlay and
// stadiaref/core share one profile registry.
const coreExternal = {
  name: 'core-external',
  setup(build) {
    build.onResolve({ filter: /core\/index\.js$/ }, (args) => {
      if (path.resolve(args.resolveDir, args.path) === CORE_INDEX) return { path: './core.mjs', external: true };
      return undefined;
    });
  },
};

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
    entryPoints: ['src/overlay/module.js'],
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    plugins: [coreExternal],
    outfile: 'dist/index.mjs',
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
  for (const [entry, out] of [
    ['src/integrations/vite/index.js', 'dist/vite.mjs'],
    ['src/integrations/astro/index.js', 'dist/astro.mjs'],
  ]) {
    await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      format: 'esm',
      platform: 'node',
      target: 'node18',
      outfile: out,
      logLevel: 'info',
    });
  }
  await esbuild.build({
    entryPoints: ['src/integrations/astro/app.js'],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outfile: 'dist/astro-app.mjs',
    logLevel: 'info',
  });
}
