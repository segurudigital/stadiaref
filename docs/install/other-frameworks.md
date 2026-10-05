# Install: SvelteKit, Nuxt, React Router and anything else with a bundler

The pattern is the same everywhere: import `stadiaref` in the browser, in development only. Your bundler removes the import from a production build because the development check is a constant.

```bash
npm install --save-dev stadiaref
```

Importing `stadiaref` starts it. On a server the import does nothing, so it is safe in code that also runs during server rendering.

## SvelteKit

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from 'svelte';
  import { dev } from '$app/environment';

  let { children } = $props();

  onMount(() => {
    if (dev) import('stadiaref');
  });
</script>

{@render children()}
```

## Nuxt

```ts
// app/plugins/stadiaref.client.ts  (Nuxt 3: plugins/stadiaref.client.ts)
export default defineNuxtPlugin(() => {
  if (import.meta.dev) import('stadiaref');
});
```

The `.client` suffix keeps the plugin out of server rendering.

## React Router and Remix

```tsx
// app/root.tsx
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    if (import.meta.env.DEV) import('stadiaref');
  }, []);

  // …your existing root layout
}
```

## Anything else

Two things are needed:

1. Run the import in the browser, after the page has mounted.
2. Wrap it in a check your bundler replaces with a constant at build time.

With Vite or anything built on it:

```js
if (import.meta.env.DEV) {
  import('stadiaref');
}
```

With webpack or anything that defines `process.env.NODE_ENV`:

```js
if (process.env.NODE_ENV === 'development') {
  import('stadiaref');
}
```

Write the check exactly like one of these. Optional chaining (`import.meta.env?.DEV`) or combining the two with `||` stops the bundler seeing a constant, and the import ships.

## Passing config

Call `init()` on the module's default export:

```js
import('stadiaref').then(({ default: stadiaref }) => {
  stadiaref.init({
    profile: 'app',
    dock: 'bottom-left',
  });
});
```

Every key is listed in the [API](../api.md#config).

## Then

1. Run your dev server and press **D**.
2. Add `data-ref` attributes. See [Getting started](../getting-started.md) and [Addressing](../addressing.md).
3. Build for production and confirm StadiaRef isn't in the output. See [Keeping StadiaRef out of production](../keep-it-out-of-production.md).

## Without a bundler

Use a script tag: [Static HTML](static-html.md).
