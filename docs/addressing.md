# Addressing

A **Stadia Address** is the value of a `data-ref` attribute. This guide covers how to write addresses that last, how StadiaRef sorts them into tiers, and how profiles work.

```html
<section data-ref="home-plans">…</section>
```

## The rules

These apply in every profile. They come from the [Stadia Address core spec](spec/stadia-address-core.md).

1. **Lower-case letters, numbers and hyphens.** No spaces, underscores or capitals. No hyphen at the start or the end, no two hyphens in a row, and no more than 160 characters. An address is safe in a URL, a CSS selector and a search box.
2. **Unique on the screen.** Two elements never share an address.
3. **Stable.** An address names the thing. It doesn't change when the thing moves, gets restyled or goes from wireframe to production.
4. **Readable.** Someone should be able to look at `about-team-card-03` and know roughly where it is.

Rule 3 is the one that pays off. An address written in the wireframe should be the same string in the brief, the copy doc, the ticket and the shipped markup.

## The three tiers

| Tier | What it is | Label |
|---|---|---|
| **Section** | A major band of the screen: hero, pricing, footer. In an app, the screen itself | Solid orange |
| **Block** | A self-contained unit inside a section: a card, a row, a form | Dark |
| **Element** | A single thing: a heading, a button, an image, a field | Light |

The tiers are what the **Show** control switches on and off. On a busy screen, showing one tier at a time is the quickest way to cut the noise.

## What to address

Start with sections. Every screen is readable at that level and it takes minutes.

Then add blocks and elements where people will point: the cards, the calls to action, the form fields, the images that get swapped. A good test is whether a designer, a developer or a client would ever mention the thing in feedback.

Skip wrappers that only exist for layout, and repeated text inside one block of copy.

## Profiles

A profile tells StadiaRef two things: which tier an address belongs to, and whether it is well-formed. Set it once:

```js
stadiaref.init({ profile: 'generic' }); // or 'app', 'titan', or your own
```

| Profile | Tier comes from | Checks |
|---|---|---|
| `generic` (default) | Nesting | The core rules |
| `app` | Nesting, with the screen as the section | Core rules, plus the product and surface prefix |
| `titan` | The address's own shape | The Titan Foundation grammar |

### The generic profile

Any address that follows the core rules is valid. The tier comes from where the element sits among other addressed elements:

- No addressed ancestor: **section**.
- Inside an addressed element, with addressed elements inside it: **block**.
- Inside an addressed element, with none inside it: **element**.

```html
<section data-ref="home-plans">                      <!-- section -->
  <article data-ref="home-plans-card-02">            <!-- block -->
    <button data-ref="home-plans-card-02-cta">…</button>  <!-- element -->
  </article>
</section>
```

A card with nothing addressed inside it counts as an element until you address something inside it. If that matters for how you filter, address its heading or its button.

You can name things however you like. This pattern works well for websites:

```text
[page]-[section]              home-plans
[page]-[section]-[part]       home-plans-card-02
[page]-[section]-[part]-[role]  home-plans-card-02-cta
```

- **page** matches the URL: `home`, `about`, `services-web-design`.
- **section** says what the band is, not where it is: `plans`, not `third`.
- **part** and **role** use the role, not the tag: `heading`, not `h2`. The tag may change. The role won't.

Starting each child's address with its parent's address isn't required, but it makes addresses easy to read and lets Find match a whole branch.

### The app profile

For web apps and PWAs.

```text
[product]-[surface]-[screen]-[part]
```

| Piece | Rule |
|---|---|
| product | One short word: `ops`, `shop`, `crm` |
| surface | One of `app`, `pwa`, `mobile`, `wp-admin`, `wp-frontend`, `shopify-admin`, `shopify-storefront` |
| screen | The screen, with enough of the path to be unambiguous: `settings-users-roles` |
| part | Optional. Anything inside the screen |

```text
ops-app-jobs                      the Jobs screen
ops-app-jobs-card-02              a card on it
ops-app-jobs-card-02-status       the status pill on that card
ops-app-jobs-dialog-edit          the edit dialog
```

Tiers come from nesting, as in `generic`, so the screen's own element is the section. An address that doesn't start with a product and a known surface isn't valid in this profile, and shows as unclassified.

Tier follows the DOM. A dialog that your framework renders outside the screen's element has no addressed ancestor, so it shows as a section.

More on apps: [Apps and PWAs](apps-and-pwas.md).

### The titan profile

For Seguru Titan Foundations. Here the tier is read from the address itself, so it can be checked without a browser.

| Tier | Shape | Example |
|---|---|---|
| Section | `<page>-<section>` | `home-hero` |
| Block | `<page>-<section>-<block-type>-<NN>` | `home-hero-card-01` |
| Element | `<page>-<section>-<element>-<NN>-<instance>-<role>` | `home-hero-heading-01-01-primary` |

- Block types: `card`, `row`, `item`, `tab`, `slide`, `step`, `cell`, `column`, `panel`, `quote`, `entry`.
- Element nouns: `heading`, `text`, `image`, `cta`, `media`, `link`, `wrapper`.
- `NN` and `instance` are two digits.
- The page part may contain hyphens (`about-team-hero`).

Anything that doesn't fit is shown and flagged as unclassified.

### Your own profile

Register a profile when your team has its own grammar. A profile is a plain object:

```js
// stadiaref.setup.js
const acme = {
  name: 'acme',

  // Return 'section', 'block', 'element', or null if the address doesn't fit.
  classify(address, context) {
    if (/^[a-z]+-s\d{2}$/.test(address)) return 'section';
    if (/^[a-z]+-s\d{2}-b\d{2}$/.test(address)) return 'block';
    if (/^[a-z]+-s\d{2}-b\d{2}-[a-z0-9-]+$/.test(address)) return 'element';
    return null;
  },

  // Return a list of problems. An empty list means the address is fine.
  validate(address) {
    return /^(home|about|shop)-/.test(address) ? [] : ['unknown page code'];
  },
};

export default function setup(stadiaref) {
  stadiaref.registerProfile(acme);
  stadiaref.setProfile('acme');
}
```

Point the Astro integration or the Vite plugin at that file. It is only ever loaded on the dev server:

```js
stadiaref({ setup: './stadiaref.setup.js' })
```

If you load StadiaRef with a dynamic import, register inside the same development check, so none of it reaches production:

```js
if (import.meta.env.DEV) {
  import('stadiaref').then(({ default: stadiaref }) => {
    stadiaref.registerProfile(acme);
    stadiaref.init({ profile: 'acme' });
  });
}
```

`context` carries what the caller knows about the element: how many addressed ancestors it has and whether it has addressed descendants. The toolbar always supplies it. Outside a browser it is `undefined` unless the caller passes one. A profile can add rules on top of the core. It can't relax them, and it can't replace a built-in profile.

The same profiles work in Node through `stadiaref/core`, so a CI check and the toolbar always agree. See the [API](api.md#the-core-library).

## Auto-address

With auto-address on, anything without a `data-ref` gets a temporary address built from the page slug, its position and what it is: `about-us-03-h2`.

- It shows with a dashed label marked **AUTO**.
- It changes when the page changes. Don't put one in a ticket you expect to act on next month.
- A real `data-ref` always wins.

Auto-address is for looking around a page nobody has prepared. Real addresses are for work.

## When your tool only lets you add a class

Add a class with the `dataref-` prefix and turn on the class converter:

```html
<section class="dataref-home-plans">…</section>
```

```js
window.stadiarefConfig = { classConverter: true };   // before StadiaRef loads
```

It becomes `data-ref="home-plans"` when StadiaRef starts. Turned on later with `init({ classConverter: true })`, it converts on the next survey, which is the first show if StadiaRef is still hidden. See [Page builders](page-builders.md).

## Addresses in production

Leave them in. A `data-ref` is a plain attribute. It does nothing without StadiaRef loaded and has no cost at runtime. Stripping addresses from a build breaks the link between what a reviewer sees and what's in the code.

If you minify HTML, make sure the minifier keeps `data-*` attributes. Most do by default.

## Using addresses across your work

- **Wireframes.** Address each section in the wireframe. Carry the same values into the build.
- **Briefs and copy docs.** Refer to sections by address. "`home-plans` needs a shorter headline" leaves no room for doubt.
- **Tickets and review notes.** Click to copy from the toolbar, paste into the ticket.
- **AI agents.** Give the agent the address. It can search for the string and edit the right element. See [Working with AI agents](agents.md).
- **Tests.** An address is a stable selector: `page.locator('[data-ref="home-plans-card-02-cta"]')`.
