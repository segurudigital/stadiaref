# Install: Astro

The Astro integration loads StadiaRef while `astro dev` is running and at no other time. `astro build` and `astro preview` never include it.

Needs Astro 7 or later.

## 1. Install

```bash
npm install --save-dev stadiaref
```

## 2. Add the integration

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import stadiaref from 'stadiaref/astro';

export default defineConfig({
  integrations: [stadiaref()],
});
```

## 3. Run the dev server

```bash
npm run dev
```

StadiaRef appears as an app in Astro's Dev Toolbar at the bottom of the page. Click its icon to open the panel, or press **D** to show the labels straight away.

The panel has the same controls as the standalone toolbar: Labels, Show, Outline, Pick, Find and Tree. Every key works the same. See [Using the toolbar](../using-the-toolbar.md).

## 4. Add addresses

In any `.astro` file or component:

```astro
<section data-ref="home-hero">
  <h1 data-ref="home-hero-heading">{title}</h1>
</section>
```

If a component should carry an address chosen by the page that uses it, pass the attribute through:

```astro
---
// src/components/Card.astro
const { title, ...rest } = Astro.props;
---
<article {...rest}>
  <h3>{title}</h3>
</article>
```

```astro
<Card title="Starter" data-ref="home-plans-card-01" />
```

## Options

Pass any [config key](../api.md#config) to the integration:

```js
stadiaref({
  profile: 'titan',     // 'generic' (default), 'app', 'titan' or your own
  autoAddress: false,   // temporary addresses for elements that have none
  labels: 'full',       // 'full', 'icons' or 'off'
  startHidden: true,    // press D to reveal
  setup: './stadiaref.setup.js', // optional: your own profile or listeners
})
```

`setup` points at a module in your project. It is loaded on the dev server only. See [Your own profile](../addressing.md#your-own-profile).

## Things to know

- **View transitions.** StadiaRef survives Astro's client router and re-surveys the page after every navigation. You don't need to call `refresh()`.
- **Astro's Dev Toolbar turned off.** If the Dev Toolbar is off, in your config or in your own Astro preferences, StadiaRef falls back to its own floating toolbar in the corner.
- **Islands.** Addresses inside React, Vue or Svelte islands work the same way. Put `data-ref` on the rendered element.
- **Production.** There is nothing to remove. The integration adds nothing to a build. [Keeping StadiaRef out of production](../keep-it-out-of-production.md) shows how to confirm it.

## Seguru Titan Foundations

Use the `titan` profile so labels classify against the Titan grammar:

```js
integrations: [stadiaref({ profile: 'titan' })],
```
