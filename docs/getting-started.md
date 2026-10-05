# Getting started

Five minutes from nothing to copying your first address.

## 1. Load StadiaRef

Use the guide for your stack if you have one:

- [Astro](install/astro.md)
- [Vite](install/vite.md) (React, Vue, Svelte, plain JS)
- [Next.js](install/nextjs.md)
- [SvelteKit, Nuxt, React Router and others](install/other-frameworks.md)
- [WordPress](install/wordpress.md)

Or try it on any HTML file right now:

```html
<script src="https://cdn.jsdelivr.net/npm/stadiaref@3/dist/stadiaref.min.js" defer></script>
```

## 2. Add three addresses

Put a `data-ref` attribute on a section, something inside it, and one thing inside that.

```html
<section data-ref="home-hero">
  <div data-ref="home-hero-intro">
    <h1 data-ref="home-hero-intro-heading">Welcome</h1>
  </div>
</section>
```

Rules for the value:

- Lower-case letters, numbers and hyphens only.
- Unique on the page.
- It names the thing, so it stays the same when the thing moves.

## 3. Press D

StadiaRef starts hidden. Press **D** and the toolbar appears in the bottom-right corner, with a label on each of your three elements.

- The outer one is a **section** (solid orange label).
- The middle one is a **block** (dark label).
- The inner one is an **element** (light label).

With the default `generic` profile, StadiaRef works the tier out from nesting. You don't declare it.

## 4. Copy an address

Click a label. The address is on your clipboard and a toast confirms it.

Paste it into a ticket, a message or an AI agent's prompt. Whoever picks it up searches the codebase for that string and finds the element.

## 5. Try the three ways to find one address

On a real page there will be more than three labels. These keep it readable:

| When | Use | Key |
|---|---|---|
| You know roughly where it is | **Show**: tick only the tier you want | 1, 2, 3 |
| You can see the thing | **Pick**: point at it and click | P |
| You have the address from a ticket | **Find**: paste it | / |

## What next

- Write addresses that hold up over time: [Addressing](addressing.md)
- Learn every control: [Using the toolbar](using-the-toolbar.md)
- Make sure it never reaches production: [Keeping StadiaRef out of production](keep-it-out-of-production.md)
- Have an AI agent address a whole project: [Working with AI agents](agents.md)

## Starting with no addresses

Turn on **auto-address** and StadiaRef gives every section, block and element a temporary address, so you can use it on a page nobody has prepared.

```html
<script>
  window.stadiarefConfig = { autoAddress: true };
</script>
<script src="https://cdn.jsdelivr.net/npm/stadiaref@3/dist/stadiaref.min.js" defer></script>
```

Temporary addresses show with a dashed label marked **AUTO**. They are worked out from the page slug and position, so they change when the page changes. Use them to explore. Write real `data-ref` attributes for anything you'll refer to more than once.
