# Keeping StadiaRef out of production

StadiaRef is a developer tool. Your visitors should never download it. This page shows how each way of loading it stays out of a production build, and how to check.

Two different things are involved:

| Thing | In production? |
|---|---|
| The `data-ref` attributes (your addresses) | **Yes, leave them.** They are plain attributes and do nothing without StadiaRef |
| The StadiaRef script (the toolbar) | **No** |

## By stack

| How you load it | Why it stays out | What you do |
|---|---|---|
| Astro integration | It only runs under `astro dev`. `astro build` and `astro preview` add nothing | Nothing |
| Vite plugin | It only runs on the dev server. `vite build` adds nothing | Nothing |
| Dynamic import (Next.js, SvelteKit, Nuxt, Remix) | The import sits inside a development check that is a constant at build time, so the bundler removes it | Keep the `import()` inside the `if` block |
| WordPress plugin | The script is printed only for signed-in users at or above the Access role | Keep Access at Administrator unless you have a reason |
| Script tag | Nothing stops it. A script tag ships to everyone who gets the page | See below |

## Script tags

If you load StadiaRef with a script tag, you decide who gets it.

- **Wireframes and prototypes.** Fine. They aren't production.
- **Staging templates only.** Put the tag behind a server-side check for the environment.
- **Signed-in staff only.** Print the tag only for staff, the way the Shopify example in [Static HTML](install/static-html.md#shopify-themes) does.
- **Your own browser only.** Use the [bookmark](install/static-html.md#on-a-live-site-from-your-own-browser). It loads StadiaRef into your tab and nowhere else.

Don't rely on StadiaRef starting hidden. Hidden means not drawn. The script has still been downloaded.

## Check your build

The toolbar's code contains the marker `data-stadiaref-root`. Nothing you write does. After a production build, search the output for it:

```bash
# Astro, Vite and most static builds
grep -rl "data-stadiaref-root" dist/ || echo "clean"

# Next.js
grep -rl "data-stadiaref-root" .next/static/ || echo "clean"
```

`clean` is what you want.

Search for the marker, not for the word "stadiaref". Your own code may mention the name without containing the toolbar: an event listener for `stadiaref:address-click`, a guarded `window.stadiaref?.` call, or a component you called `StadiaRef`.

Then load the production site with the browser's Network tab open and filter for `stadiaref`. There should be no request.

Add the search to CI if you want it enforced:

```bash
if grep -rl "data-stadiaref-root" dist/; then
  echo "StadiaRef found in the production build" >&2
  exit 1
fi
```

## Staging and preview builds

A staging deploy is usually a production build, so the rules above keep StadiaRef out of it too. If your team wants it on staging:

- **Bundled apps.** Add your own build-time flag next to the development check. The [Next.js guide](install/nextjs.md#showing-it-on-a-staging-build) shows how, and what changes when you do.
- **Astro and Vite.** The integration and the plugin are dev-server only by design. For a staging build, load StadiaRef with a dev-only dynamic import behind your own flag, or use the bookmark.
- **WordPress.** The plugin works the same on staging and production. Admins see it, visitors don't.

Whatever flag you add, run the build check with the flag off.

## Client hand-over

When a project leaves your hands, StadiaRef leaves nothing behind in the client's build. The addresses stay in the markup and keep their meaning. The next developer installs StadiaRef in their own environment and reads the same addresses you did.
