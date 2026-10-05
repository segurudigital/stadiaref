# Page builders

StadiaRef works with any page builder that outputs HTML. It reads `data-ref` attributes from the page after it loads, so it doesn't matter how they got into the markup: Gutenberg, Elementor, Bricks, Oxygen, Breakdance, hand-written PHP or anything else.

Two features make addressing a builder site faster: the **class-to-ref converter** and **auto-address**. Both are off by default. In WordPress, turn them on under **Settings → StadiaRef → Page builders**. Anywhere else, use the `classConverter` and `autoAddress` [config keys](api.md#config).

## The class-to-ref converter

Every page builder, free tiers included, lets you add a CSS class to an element. The converter turns a class into an address.

1. Turn on the class-to-ref converter.
2. In your builder, add a class such as `dataref-home-hero` to an element.
3. StadiaRef removes the `dataref-` prefix and sets `data-ref="home-hero"` on that element when the page loads.

No code, no `functions.php` edits and no Pro tier needed.

- An element that already has a `data-ref` attribute keeps it. An authored attribute always wins.
- If an element has more than one `dataref-` class, the first one is used.
- The converter is the one thing StadiaRef does before you first show it: it runs when the page loads, so the addresses are there for your own scripts too. Everything else waits until you press **D**.
- The address after the prefix should follow the [rules](addressing.md#the-rules): lower-case letters, digits and single hyphens.

Where to type the class:

| Builder | Where |
|---|---|
| Elementor (Free or Pro) | Advanced → CSS Classes |
| Bricks | Style → CSS Classes |
| Oxygen | Advanced → CSS Classes |
| Breakdance | Settings → CSS Classes |
| Gutenberg | Block → Advanced → Additional CSS class(es) |

## Auto-address

Auto-address gives every section, block and element that has no address a temporary one, so you can point at anything on a page that hasn't been addressed yet.

1. Turn on auto-address.
2. StadiaRef finds the sections, blocks and elements on the page and gives each one without an address a temporary address from the page slug, a number and what the element is.
3. A page at `/about-us/` gets addresses such as `about-us-01-section`, `about-us-02-h2` and `about-us-03-p`.

Temporary addresses show with a dashed **AUTO** label, and an **AUTO** chip appears on the toolbar while auto-address is on. Use **Show** on the toolbar (keys **1**, **2** and **3**) to choose which tiers you see.

- An authored address always wins: auto-address never changes an element that has a `data-ref`, whether it was typed in the builder or set by the class converter.
- A temporary address stays the same for as long as the page is open, and a number is never reused, but it can change when the page is reloaded or its content changes. Use temporary addresses for quick feedback; give the parts people mention often a real address.
- Temporary addresses never change the tier of an authored address. Tiers are worked out from authored addresses only.

What auto-address looks for:

| Tier | Elements |
|---|---|
| Sections | Top-level containers: `.e-con` (Elementor), `section.brxe-section` and top-level `.brxe-container` (Bricks), `.ct-section` (Oxygen), `.breakdance-section`, and `<section>` directly inside `<body>`, `<main>` or the theme's content wrapper |
| Blocks | Nested containers and widgets: nested `.e-con`, Elementor widgets, Bricks blocks and divs, Oxygen columns and divs, Breakdance columns, Gutenberg blocks such as `.wp-block-group` and `.wp-block-columns`, and `<article>`, `<aside>`, `<nav>` |
| Elements | Content: headings, paragraphs, images, video, links, buttons, form fields, forms, tables, lists, figures, and the builders' content widgets |

Only modern Elementor flexbox containers (`.e-con`) are recognised. Legacy `.elementor-section` and `.elementor-column` aren't.

The page slug comes from the URL:

| URL | Slug |
|---|---|
| `example.com/` | `home` |
| `example.com/about-us/` | `about-us` |
| `example.com/services/web-design/` | `services-web-design` |

Set your own with the `pageSlug` config key.

## Adding `data-ref` directly

Most builders let you add a custom attribute. This needs neither feature turned on.

### Elementor Pro

1. Select the container or widget.
2. Open the **Advanced** tab and scroll to **Custom Attributes**.
3. Enter `data-ref|home-hero`. The pipe separates the name from the value; put each attribute on its own line.

Elementor Free has no custom attributes. Use the class converter.

### Bricks

1. Select the element.
2. Open **Style → Attributes** and click **+**.
3. Set **Name** to `data-ref` and **Value** to the address.

Bricks can fill attribute values from dynamic data, so you can keep addresses in a custom field.

### Oxygen (3.5 and later)

1. Select the element.
2. Open **Advanced → Attributes** and click **Add Attribute**.
3. Set the name to `data-ref` and the value to the address.

Earlier Oxygen versions have no custom attributes. Use the class converter.

### Breakdance

Select the element, then add an attribute named `data-ref` under its attribute settings.

### Gutenberg

Wrap each section in a Group block and add `data-ref` through a custom attributes plugin, or edit the block's HTML. The class converter works on every block through **Advanced → Additional CSS class(es)**.

## Rolling it out on a site

- **Fastest:** turn on auto-address. Every part of every page has an address straight away. The names are generic, but they work for feedback on the day.
- **Better names:** turn on the class converter and add `dataref-` classes on the pages people review most.
- **Both:** auto-address covers everything, and classes give the important parts lasting names.
- **Attributes only:** turn both off and add `data-ref` in each builder. The most control and the most work.

## Tips

- **Address what people mention.** Sections first, then the cards, buttons, forms and images people will point at. [Addressing](addressing.md) has the naming patterns.
- **Check a missing label.** If something has no label, view the page source and check the `data-ref` attribute is in the rendered HTML.
- **Content that loads later** (lazy loading, infinite scroll, AJAX pagination) is picked up automatically: StadiaRef watches the page and labels new content within a frame. `window.stadiaref?.refresh()` still forces a survey if you need one.
