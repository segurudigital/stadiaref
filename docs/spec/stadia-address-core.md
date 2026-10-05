# Stadia Address core spec

**Version 1.0** · October 2026 · Published with StadiaRef 3.0

A **Stadia Address** is a short, stable name for a part of a screen, carried in an HTML `data-ref` attribute:

```html
<section data-ref="home-plans">…</section>
```

This spec defines what a valid address is, how addresses are sorted into tiers, and what a **profile** must do to add its own grammar on top. StadiaRef implements it in `stadiaref/core`; any other tool can implement it from this page.

The key words **must**, **must not**, **should** and **may** are used as in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119). Sections marked *guidance* are advice, not requirements.

- [1. Terms](#1-terms)
- [2. Carrying an address](#2-carrying-an-address)
- [3. The core rules](#3-the-core-rules)
- [4. Rules for a screen](#4-rules-for-a-screen)
- [5. Tiers](#5-tiers)
- [6. Nesting context](#6-nesting-context)
- [7. Profiles](#7-profiles)
- [8. The built-in profiles](#8-the-built-in-profiles)
- [9. Results](#9-results)
- [10. Examples](#10-examples)
- [11. Versioning](#11-versioning)

## 1. Terms

| Term | Meaning |
|---|---|
| **Address** | The value of a `data-ref` attribute |
| **Carrier** | An element that has a `data-ref` attribute |
| **Screen** | One rendered document, or one view of a single-page app, as a person sees it at one moment |
| **Segment** | A run of characters between hyphens. `home-plans-card-02` has the segments `home`, `plans`, `card` and `02` |
| **Tier** | Where a part sits in the screen: `section`, `block` or `element` |
| **Profile** | A named grammar that decides an address's tier and adds checks of its own |
| **Authored address** | An address written by a person or a build step into the markup |
| **Automatic address** | An address a tool gives an element that has none, for the length of a page view (see [2](#2-carrying-an-address)) |

## 2. Carrying an address

1. An address is carried in the `data-ref` attribute of an HTML element. The attribute value is the address exactly: tools **must not** trim it, change its case or otherwise rewrite it before checking it.
2. An element carries at most one address.
3. A tool that gives an element an automatic address **must** mark it as automatic on the element, so other tools can tell it apart from an authored one. StadiaRef uses the attribute `data-stadiaref-auto` for this.
4. Automatic addresses **must** follow the core rules ([3](#3-the-core-rules)). They are never counted as ancestors or descendants when working out nesting ([6](#6-nesting-context)).

## 3. The core rules

Every profile applies these rules. A profile **may** add rules of its own. It **must not** relax these.

An address is valid under the core rules when it matches this grammar ([ABNF](https://www.rfc-editor.org/rfc/rfc5234)):

```abnf
address = segment *( "-" segment )
segment = 1*( %x61-7A / DIGIT )   ; a-z and 0-9
```

and is no more than **160 characters** long. In words:

1. Only lower-case letters `a`–`z`, digits `0`–`9` and hyphens.
2. Not empty.
3. No hyphen at the start or the end.
4. No two hyphens in a row.
5. At most 160 characters.

Upper-case letters, underscores, spaces, dots, slashes, accented letters and every other character are invalid. An address that passes these rules is safe, as it is, in a URL, a CSS attribute selector, a file name and a search box.

## 4. Rules for a screen

These rules need the whole screen, so the core can't check them from an address alone. A tool that sees the whole screen **should** check them.

1. **Unique.** Two carriers on the same screen **must not** carry the same address. A duplicate doesn't make either address invalid: tools **should** report it and keep treating both as valid.
2. **Stable** *(guidance).* An address names the thing, not its position or its look. It should stay the same when the thing moves, is restyled, or goes from wireframe to production.
3. **Readable** *(guidance).* Someone should be able to read an address and know roughly where the thing is. Starting a child's address with its parent's address helps, but isn't required.

## 5. Tiers

| Tier | What it is |
|---|---|
| `section` | A major band of the screen: a hero, a pricing table, a footer. In an app, the screen itself |
| `block` | A self-contained unit inside a section: a card, a row, a form |
| `element` | A single thing: a heading, a button, an image, a field |

When an address is invalid, or valid but its profile can't place it, its result is **`unclassified`**. `unclassified` is a result, not a tier: nothing is written to be unclassified.

## 6. Nesting context

Some profiles take the tier from where the carrier sits rather than from the address. They are given a **nesting context**:

| Field | Type | Meaning |
|---|---|---|
| `depth` | integer ≥ 0 | How many ancestors of the carrier are carriers of authored addresses |
| `hasAddressedChildren` | boolean | Whether any descendant of the carrier is a carrier of an authored address |

1. Only authored addresses count, in both fields. Giving elements automatic addresses therefore never changes the tier of an authored address.
2. Ancestors and descendants are taken in the DOM tree. An element rendered outside its visual parent, such as a dialog appended to `<body>`, has no addressed ancestor.
3. The context of an address that isn't on the screen is undefined. A nesting-based profile given no context returns no tier.
4. Nesting changes as content mounts, so tools **should** work tiers out again whenever the screen changes.

## 7. Profiles

A profile is an object with these members:

| Member | Required | Contract |
|---|---|---|
| `name` | yes | A non-empty string. Unique among registered profiles |
| `classify(address, context)` | yes | Returns `'section'`, `'block'`, `'element'`, or `null` when it can't place the address. Only called for addresses that pass every check in `validate` |
| `validate(address)` | no | Returns a list of problems, as strings. An empty list means the profile has no objection. Only called for addresses that pass the core rules |
| `parse(address)` | no | Returns an object with the parts the profile defines, or `null` |

1. A profile's checks are added to the core rules. A profile **must not** accept an address the core rules reject.
2. Profiles are kept in a **registry**. Registering a name that is already taken **must** fail, so a built-in profile can't be replaced.
3. A tool told to use a name that isn't registered for a screen **should** fall back to `generic` with a warning, and switch to the named profile once it is registered. Asking the operations in [9](#9-results) for a profile that isn't registered is an error.
4. One registry serves every part of a tool. In StadiaRef, a profile registered through `stadiaref/core` is the same profile the toolbar uses.

## 8. The built-in profiles

Three profiles are built in. `generic` is the default.

### 8.1 `generic`

- **Valid:** any address that passes the core rules. No further checks.
- **Tier, from nesting:**

  | Context | Tier |
  |---|---|
  | `depth` is 0 | `section` |
  | `depth` > 0 and `hasAddressedChildren` | `block` |
  | `depth` > 0 and no addressed children | `element` |
  | no context | none (`unclassified`) |

- **Parse:** `{ segments }`, the address split on hyphens.

### 8.2 `app`

For web apps and PWAs. Shape: `[product]-[surface]-[screen]-[part]`.

- **Product:** the first segment.
- **Surface:** one of the surfaces below, right after the product. Two-segment surfaces are matched first, so `ops-wp-admin-users` has the surface `wp-admin`, not `wp`.

  `app`, `pwa`, `mobile`, `wp-admin`, `wp-frontend`, `shopify-admin`, `shopify-storefront`

- **Valid:** passes the core rules, and starts with a product followed by a known surface.
- **Tier:** from nesting, exactly as `generic`, for a valid address.
- **Parse:** `{ product, surface, path }`. Where the screen ends and the part begins can't be told from the text, so everything after the surface comes back as one `path`, which may be empty.

### 8.3 `titan`

The tier is read from the address itself, so it can be checked without a page. The page part of the address may itself contain hyphens, so the tier is decided from the last segments. The checks run in this order, and the first that matches wins:

| Order | Tier | The address must have | Its last segments must be |
|---|---|---|---|
| 1 | `element` | at least 6 segments | an element noun, then two digits, then two digits, then a segment that is not all digits |
| 2 | `block` | at least 4 segments | a block type, then two digits |
| 3 | `section` | at least 2 segments | a segment that is not all digits |

Anything else is `unclassified`.

- **Block types:** `card`, `row`, `item`, `tab`, `slide`, `step`, `cell`, `column`, `panel`, `quote`, `entry`.
- **Element nouns:** `heading`, `text`, `image`, `cta`, `media`, `link`, `wrapper`.
- **Two digits** means exactly two, such as `01` or `12`; `1` and `001` don't match.

| Tier | Shape | Example |
|---|---|---|
| `section` | `<page>-<section>` | `home-hero` |
| `block` | `<page>-<section>-<block-type>-<NN>` | `home-hero-card-01` |
| `element` | `<page>-<section>-<element>-<NN>-<instance>-<role>` | `home-hero-heading-01-01-primary` |

- **Valid:** passes the core rules, and places in one of the three tiers. An address that can't be placed is invalid under this profile ("doesn't match the Titan grammar").
- **Parse:**
  - element: `{ tier, prefix, element, number, instance, role }`, where `prefix` is everything before the element noun.
  - block: `{ tier, prefix, blockType, number }`.
  - section: `{ tier, segments }`.

## 9. Results

A conforming implementation exposes these operations, each taking an optional profile name that defaults to `generic`:

| Operation | Result |
|---|---|
| `validate(address)` | `{ valid, problems }`. The core rules are checked first. Only when they pass is the profile's `validate` asked. `valid` is true when the combined list is empty |
| `classify(address, context)` | `'section'`, `'block'`, `'element'` or `'unclassified'`. An address that fails `validate` is `'unclassified'`, and so is one the profile's `classify` returns `null` for |
| `parse(address)` | `{ address, profile, parts }`. `parts` is `null` when the address fails `validate` |

Problems are short descriptions for people. Their wording is not part of this spec, and tools **must not** depend on it.

## 10. Examples

Validity under each built-in profile, and the tier under `titan`. (Under `generic` and `app` the tier depends on nesting; see [8.1](#81-generic).)

| Address | Core rules | `generic` | `app` | `titan` |
|---|---|---|---|---|
| `home-hero` | valid | valid | invalid | section |
| `home-hero-card-01` | valid | valid | invalid | block |
| `home-hero-heading-01-01-primary` | valid | valid | invalid | element |
| `about-team-hero` | valid | valid | invalid | section |
| `home` | valid | valid | invalid | unclassified |
| `hero-card-01` | valid | valid | invalid | unclassified |
| `home-hero-card-1` | valid | valid | invalid | unclassified |
| `home-hero-heading-01-01-02` | valid | valid | invalid | unclassified |
| `2024` | valid | valid | invalid | unclassified |
| `ops-app-jobs` | valid | valid | valid | section |
| `ops-app-jobs-card-02` | valid | valid | valid | block |
| `ops-pwa` | valid | valid | valid | section |
| `site-wp-admin-settings` | valid | valid | valid | section |
| `shop-shopify-storefront-cart` | valid | valid | valid | section |
| `Home-Hero` | invalid | invalid | invalid | unclassified |
| `home_hero` | invalid | invalid | invalid | unclassified |
| `home hero` | invalid | invalid | invalid | unclassified |
| `home--hero` | invalid | invalid | invalid | unclassified |
| `-home` | invalid | invalid | invalid | unclassified |
| `home-` | invalid | invalid | invalid | unclassified |

Tiers from nesting, under `generic` or `app`:

```html
<section data-ref="home-plans">                           <!-- section: depth 0 -->
  <article data-ref="home-plans-card-02">                 <!-- block: depth 1, has addressed children -->
    <button data-ref="home-plans-card-02-cta">…</button>  <!-- element: depth 2, none inside -->
  </article>
</section>
```

## 11. Versioning

This spec is versioned on its own. A minor version may add built-in surfaces, block types, element nouns or profiles. A change that makes a valid address invalid, or changes the tier of a valid address under a built-in profile, needs a major version.
