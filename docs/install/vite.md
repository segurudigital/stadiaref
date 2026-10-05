# Install: Vite (React, Vue, Svelte, plain JS)

The Vite plugin loads StadiaRef on the dev server only. `vite build` never includes it.

Use this guide for an app where Vite serves your `index.html`. For frameworks that render HTML on the server (SvelteKit, Nuxt, React Router), or a backend that owns the HTML and uses Vite only for assets (Laravel, Rails), use [Other frameworks](other-frameworks.md). The plugin has no page to add itself to in those setups.

## 1. Install

```bash
npm install --save-dev stadiaref
```

## 2. Add the plugin

StadiaRef is published as ES modules only. Import it from an ES module config: `vite.config.js` in a project with `"type": "module"`, `vite.config.mjs` or `vite.config.ts`. A CommonJS config can only load it on Node versions that can `require()` an ES module (20.19 and later, 22.12 and later).

```js
// vite.config.js
import { defineConfig } from 'vite';
import stadiaref from 'stadiaref/vite';

export default defineConfig({
  plugins: [stadiaref()],
});
```

Put it alongside your framework plugin. Order doesn't matter.

## 3. Run the dev server and press D

```bash
npm run dev
```

The toolbar appears in the bottom-right corner when you press **D**.

## 4. Add addresses

`data-ref` is a normal HTML attribute. Every framework passes it through.

**React**

```jsx
export function Plans() {
  return (
    <section data-ref="pricing-plans">
      <PlanCard data-ref="pricing-plans-card-01" name="Starter" />
    </section>
  );
}

// Let the page choose the address: spread the rest props onto the root element.
function PlanCard({ name, ...rest }) {
  return (
    <article {...rest}>
      <h3>{name}</h3>
    </article>
  );
}
```

**Vue**

```vue
<template>
  <section data-ref="pricing-plans">
    <PlanCard data-ref="pricing-plans-card-01" name="Starter" />
  </section>
</template>
```

Vue passes `data-ref` to the component's root element automatically.

**Svelte**

```svelte
<section data-ref="pricing-plans">
  <PlanCard data-ref="pricing-plans-card-01" name="Starter" />
</section>
```

```svelte
<!-- PlanCard.svelte -->
<script>
  let { name, ...rest } = $props();
</script>

<article {...rest}><h3>{name}</h3></article>
```

Don't hard-code an address inside a reusable component. Two cards on one page would share it. Let each use of the component pass its own.

## Options

Pass any [config key](../api.md#config) to the plugin:

```js
stadiaref({
  profile: 'app',       // 'generic' (default), 'app', 'titan' or your own
  autoAddress: false,
  labels: 'full',
  dock: 'bottom-left',  // move it if something else lives bottom-right
  setup: './stadiaref.setup.js', // optional: your own profile or listeners
})
```

`setup` points at a module in your project. It is loaded on the dev server only. See [Your own profile](../addressing.md#your-own-profile).

## Things to know

- **Route changes.** StadiaRef re-surveys the screen when your router navigates or new content mounts. You don't need to call `refresh()`.
- **Dialogs.** When a modal opens, labels narrow to the dialog. See [Apps and PWAs](../apps-and-pwas.md).
- **Driving it from code.** `window.stadiaref` is available in the browser console and in your app code during development. See the [API](../api.md).
- **Production.** There is nothing to remove. [Keeping StadiaRef out of production](../keep-it-out-of-production.md) shows how to confirm it.
