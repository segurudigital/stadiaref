<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/stadiaref-logotype-on-dark.svg">
    <img src="assets/stadiaref-logotype.svg" alt="StadiaRef" height="48">
  </picture>
</h1>

**An address for every part of the screen.**

StadiaRef shows the `data-ref` attributes in your markup as labels on the page. Point at a section, a card or a button, copy its address, and hand it to a developer or an AI agent. They search the codebase for that exact string and land on the right element.

It is one small script with no dependencies. It works on websites, web apps and PWAs. It only runs where you load it, so your production build stays clean.

[Live demo](https://segurudigital.github.io/stadiaref/) · [Get started in five minutes](docs/getting-started.md) · [Changelog](CHANGELOG.md)

---

## The idea

Feedback like "the card near the top looks off" costs a round trip. Feedback like "`home-plans-card-02` has the wrong price" doesn't.

Give the parts of your screen an address:

```html
<section data-ref="home-plans">
  <article data-ref="home-plans-card-02">
    <button data-ref="home-plans-card-02-cta">Choose plan</button>
  </article>
</section>
```

The value of a `data-ref` attribute is a **Stadia Address**. StadiaRef reads those addresses and draws them on the page, in three tiers: **section**, **block** and **element**. Anyone looking at the screen can copy one with a click. The attribute is plain HTML, so it survives every framework, CMS and build tool.

---

## Install

Pick your stack. Each guide takes a few minutes.

| You're building with | Install | Guide |
|---|---|---|
| Astro | `npm i -D stadiaref`, add the integration | [Astro](docs/install/astro.md) |
| Vite (React, Vue, Svelte, plain JS) | `npm i -D stadiaref`, add the plugin | [Vite](docs/install/vite.md) |
| Next.js | `npm i -D stadiaref`, add one client component | [Next.js](docs/install/nextjs.md) |
| SvelteKit, Nuxt, React Router, anything else with a bundler | `npm i -D stadiaref`, one dev-only import | [Other frameworks](docs/install/other-frameworks.md) |
| Static HTML, wireframes, Shopify themes | One script tag | [Static HTML](docs/install/static-html.md) |
| WordPress | The StadiaRef plugin | [WordPress](docs/install/wordpress.md) |
| A PWA or a web app in a web view | Any of the above, plus a few app settings | [Apps and PWAs](docs/apps-and-pwas.md) |

The shortest path, for any HTML page:

```html
<script src="https://cdn.jsdelivr.net/npm/stadiaref@3/dist/stadiaref.min.js" defer></script>
```

Load the page and press **D**.

StadiaRef starts hidden. Nothing shows until someone presses **D**, so screenshots, demos and automated browser sessions stay clean.

---

## What you get

| Control | Key | What it does |
|---|---|---|
| **Labels** | L | Full labels, small dots you hover, or off |
| **Show** | 1, 2, 3 | Tick which tiers you see: sections, blocks, elements, in any mix |
| **Pick** | P | Point at anything. One chip shows its section, block and element. Click copies the address |
| **Find** | / | Paste an address from a ticket and press Enter. The page scrolls to it and dims the rest |
| **Outline** | O | Frames around section wrappers and dashed guides around block containers |
| **Tree** | | Every address on the page as a nested list |
| Show or hide everything | D | The whole toolbar and every label |
| Step out or hide | Esc | Leaves Pick or Find. With neither open, hides everything in one press |

Click any label to copy its address.

Labels are colour-coded by tier: sections are solid lime, blocks are dark, elements are light. On a dense page, use **Show** to cut down to one tier, **Pick** when you can see the thing you want, and **Find** when you already have its address.

Full details: [Using the toolbar](docs/using-the-toolbar.md).

---

## Built for apps as well as pages

- **Route changes.** StadiaRef re-surveys the screen when the route changes or new content mounts. You don't call anything.
- **Dialogs and sheets.** When a modal opens, labels narrow to what's inside it.
- **Touch.** On a phone, Pick opens a sheet with large controls.
- **Installed PWAs.** The toolbar respects safe areas and sits above your tab bar.

StadiaRef reads the DOM. It covers web apps, PWAs and web views. It can't see native iOS or Android views.

More: [Apps and PWAs](docs/apps-and-pwas.md).

---

## Addresses and profiles

Any lower-case value with letters, numbers and hyphens is a valid address. A **profile** tells StadiaRef how to sort addresses into tiers and what counts as well-formed.

| Profile | Use it for | Example |
|---|---|---|
| `generic` (default) | Any project. Tiers come from nesting | `home-plans-card-02` |
| `app` | Web apps and PWAs | `ops-app-jobs-card-02-status` |
| `titan` | Seguru Titan Foundations | `home-hero-heading-01-01-primary` |

You can register your own profile in a few lines. See [Addressing](docs/addressing.md).

---

## Use it without shipping it

StadiaRef is a developer tool. The Astro integration and the Vite plugin only run on the dev server, and the WordPress plugin only loads for signed-in users with the role you choose. The addresses themselves are inert attributes and are safe to leave in production.

[Keeping StadiaRef out of production](docs/keep-it-out-of-production.md) covers each stack and how to check your build.

---

## Documentation

| Doc | What's in it |
|---|---|
| [Getting started](docs/getting-started.md) | Install, add three addresses, copy your first one |
| [Install guides](docs/install/) | Astro, Vite, Next.js, other frameworks, static HTML, WordPress |
| [Apps and PWAs](docs/apps-and-pwas.md) | Route changes, dialogs, touch, safe areas, web views |
| [Addressing](docs/addressing.md) | How to write addresses, the three tiers, profiles |
| [Using the toolbar](docs/using-the-toolbar.md) | Every control and key |
| [API](docs/api.md) | Config, JavaScript API, events, the core library |
| [Integrations](docs/integrations.md) | Theme sync, reviewer identity, wiring a feedback panel |
| [Page builders](docs/page-builders.md) | Elementor, Bricks, Oxygen, Breakdance, Gutenberg |
| [Keeping it out of production](docs/keep-it-out-of-production.md) | Dev-only loading per stack |
| [Working with AI agents](docs/agents.md) | A copy-paste prompt that adds StadiaRef and addresses to a project |
| [Migrating from 2.x](docs/migrating-from-2.x.md) | Coming from Seguru Debug Toolbar |
| [Stadia Address core spec](docs/spec/stadia-address-core.md) | The grammar every profile builds on |

---

## Coming from Seguru Debug Toolbar

StadiaRef 3.0 is the same tool under its new name. `@segurudigital/seguru-debug-toolbar` ended at 2.5.0. The old global, config keys and events keep working through 3.x, so you can move over in your own time. [Migrating from 2.x](docs/migrating-from-2.x.md) lists every rename.

---

## Build from source

```bash
git clone https://github.com/segurudigital/stadiaref.git
cd stadiaref
npm ci
npm run build      # dist/stadiaref.min.js
npm test           # unit tests and the browser checks
npm run dev        # watch mode
```

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first. Security reports go through [SECURITY.md](SECURITY.md).

If StadiaRef saves you time, you can [buy us a coffee](https://buymeacoffee.com/segurudigital).

## License

MIT. Free for personal and commercial use.

"StadiaRef" and the Seguru mark are trademarks of Seguru Digital. The licence covers the code. It doesn't cover use of the name or the mark for a fork or a competing product.

The logotype is drawn from outlines of Barlow Bold, used under the SIL Open Font License 1.1. See [NOTICE](NOTICE).

Made by [Seguru Digital](https://seguru.digital). StadiaRef gives every part of the screen an address.
