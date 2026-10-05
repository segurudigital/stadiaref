# Install: static HTML, wireframes and Shopify themes

No build step. One script tag.

## The script tag

```html
<!-- Follows the 3.x line: bug fixes and new features, no breaking changes -->
<script src="https://cdn.jsdelivr.net/npm/stadiaref@3/dist/stadiaref.min.js" defer></script>
```

Pin an exact version when you want upgrades to be a deliberate step:

```html
<script src="https://cdn.jsdelivr.net/npm/stadiaref@3.0.0/dist/stadiaref.min.js" defer></script>
```

Or download `stadiaref.min.js` from the [latest release](https://github.com/segurudigital/stadiaref/releases/latest) and serve it yourself:

```html
<script src="/js/stadiaref.min.js" defer></script>
```

Load the page and press **D**.

## Config

Set `window.stadiarefConfig` before the script tag:

```html
<script>
  window.stadiarefConfig = {
    profile: 'generic',   // 'generic' (default), 'app', 'titan' or your own
    labels: 'full',       // 'full', 'icons' or 'off'
    autoAddress: false,   // temporary addresses where none are written
    startHidden: true,    // set false to show the toolbar on load
    dock: 'bottom-right', // any corner, or 'auto'
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/stadiaref@3/dist/stadiaref.min.js" defer></script>
```

For a quick one-off, a few keys also work as attributes on the script tag:

```html
<script
  src="https://cdn.jsdelivr.net/npm/stadiaref@3/dist/stadiaref.min.js"
  data-profile="generic"
  data-labels="icons"
  data-dock="bottom-left"
  data-theme="auto"
  defer></script>
```

Every key is in the [API](../api.md#config).

## Wireframes

Wireframes are where addresses should start. Write the `data-ref` on each section in the wireframe and keep that exact value in the real build. The address then means the same thing in the brief, the copy doc, the ticket and the code.

For a wireframe you send to a client, show the toolbar on load so they don't need to know about the **D** key:

```html
<script>
  window.stadiarefConfig = { startHidden: false, labels: 'icons' };
</script>
```

## Page builders that only let you add a class

If your tool won't let you add a custom attribute, add a CSS class with the `dataref-` prefix and turn on the converter:

```html
<script>
  window.stadiarefConfig = { classConverter: true };
</script>

<section class="hero dataref-home-hero">…</section>
```

StadiaRef turns `dataref-home-hero` into `data-ref="home-hero"` when the page loads. A real `data-ref` attribute always wins over a class. More in [Page builders](../page-builders.md).

## Shopify themes

Upload `stadiaref.min.js` to the theme's `assets/` folder and load it for staff only:

```liquid
{% if customer and customer.tags contains 'staff' %}
  <script src="{{ 'stadiaref.min.js' | asset_url }}" defer></script>
{% endif %}
```

Add addresses in your section files:

```liquid
<section data-ref="home-featured-collection" class="featured-collection">
  …
</section>
```

## On a live site, from your own browser

To survey a page without touching its markup, save this as a bookmark and click it on any page:

```text
javascript:(()=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/stadiaref@3/dist/stadiaref.min.js';s.onload=()=>window.stadiaref.show();document.head.appendChild(s)})()
```

It loads StadiaRef in your tab only. Nobody else sees it. A site with a strict Content Security Policy will block it.

## Keep the script tag out of production

A script tag in a template ships to everyone unless you stop it. Put it in wireframes and staging templates, behind a server-side check, or use the bookmark above. See [Keeping StadiaRef out of production](../keep-it-out-of-production.md).
