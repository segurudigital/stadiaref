# Design

How StadiaRef looks, and why. This is the implementation-level reference for the toolbar, its panels and the labels it draws on the page. The values live in code: colours in [`src/overlay/styles/tokens.js`](../src/overlay/styles/tokens.js), the toolbar and panel CSS in [`src/overlay/styles/shadow.js`](../src/overlay/styles/shadow.js), and the label CSS in [`src/overlay/styles/labels.js`](../src/overlay/styles/labels.js). When this page and the code disagree, the code is right and this page needs fixing.

## Principles

- **Orange is functional.** StadiaRef orange marks what you can act on and where you are: the product icon, active controls, section labels, focus rings. Nothing decorative is orange.
- **The page stays readable.** Labels are small, sit on the element's top-left corner, and step aside (Pick, the overlap solver, `+N` badges) rather than cover content.
- **Every text pair passes 4.5:1.** `test/unit/contrast.test.mjs` computes every text and background pair in `tokens.js`, including translucent backgrounds over the worst page they can sit on. A colour can't change without passing.
- **Nothing loads from the network.** The icon and the logotype are inline SVG; the fonts are the system stacks.
- **The brand is permanent.** The product icon is on screen in whichever chrome is showing, and the logotype sits beside it wherever there is room. No option removes either.

## Type

| Use | Stack | Size |
|---|---|---|
| Toolbar, menus, panels | `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif` | 12px; control keys 10px upper case |
| Addresses, everywhere | `'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace` | 10–12px |

The logotype is outlined from Barlow Bold (SIL Open Font License 1.1), so no font is loaded.

## Colour

### Toolbar and panels

| Token | Light | Dark |
|---|---|---|
| Product orange (icon, dots) | `#EA580C` | `#F97316` |
| Orange that carries text | `#C2410C` | `#FDBA74` |
| Background | `#FFFFFF` | `#27272A` |
| Border | `#E5E7EB` | `#3F3F46` |
| Text | `#111827` | `#F4F4F5` |
| Control key text | `#6B7280` | `#A1A1AA` |
| Active wash | `rgba(234,88,12,0.08)`, border `rgba(234,88,12,0.22)` | `rgba(249,115,22,0.16)`, border `rgba(249,115,22,0.36)` |
| Menu hover | `#F9FAFB` | `rgba(255,255,255,0.06)` |
| Toast and dialog status line | `#FFF7ED` background, `#9A3412` text | `#27272A` background, `#FDBA74` text |

White on `#EA580C` is 3.56:1, which fails for small text, so wherever white text sits on orange, or orange is the text on a light surface, it is `#C2410C` (5.18:1 with white).

Changes made for contrast, measured against the wireframes:

- Menu hover is `#F9FAFB` in light and a 6% white wash in dark, so the grey notes in menus stay at 4.5:1 or more.
- The active option's note and key use the accent colour; the wireframe grey measured 4.40:1 on the active wash.
- The `+N` cluster badge and the block-group badge are opaque (`#FCE8DD` light, `#27272A` dark) instead of a translucent wash.
- The brand tooltip is opaque `#111827`.

### Labels by tier

Each label is a bold tag and the address, in mono 10px, line height 1.3, padding 2px 5px, radius 3px, with a light shadow.

| Tier | Tag | On a light surface | On a dark surface | Hover |
|---|---|---|---|---|
| Section | `SEC` | `#C2410C`, white text | `#F97316`, `#111827` text | `#111827`, white text |
| Block | `BLK` | `rgba(17,24,39,0.92)`, `#FFF7ED` text | `rgba(255,255,255,0.92)`, `#111827` text | `#C2410C`, white text |
| Element | `EL` | white, `#111827` text, `#6B7280` border | `rgba(17,24,39,0.72)`, white text, `rgba(255,255,255,0.6)` border | `#C2410C`, white text |
| Unclassified | `?` | `#FFFBEB`, `#92400E` text, dashed `#B45309` border, no shadow | `rgba(17,24,39,0.72)`, `#FDE68A` text, dashed `#FBBF24` border | `#92400E`, white text |
| Automatic | `AUTO` | the tier's colours with a dashed border | same | same as the tier |

Whether a label uses its light or dark version comes from the background behind its element: StadiaRef walks up to the first opaque background and uses the dark version below 40% relative luminance.

**Icons mode** draws a dot per element carrying the tier's letter (S, B, E, ?) in the tier's colours. The dots are opaque, so the letter keeps its contrast on any page.

## The toolbar

Order, left to right: the brand (icon and logotype, linking to seguru.digital), the user pill when `setUser()` has been called, **Labels**, **Show**, the **AUTO** chip while auto-address is on, **Pick**, **Find**, a divider, **Outline**, **Tree**.

- 6px radius, 4px padding, shadow `0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)`.
- Controls are pills with a 10px upper-case key and a 12px value.
- **Show** reads `Show All ▾`, `Show Sections ▾`, `Show Sec + Blk ▾`, `Show None ▾` and so on, and takes the active wash whenever a tier is hidden. Its menu has a tick box per tier and stays open while you tick.
- The **AUTO** chip is a status, not a button: a dashed 1px border and mono 10px bold text.
- **Pick** and **Find** are toggle buttons with an icon and a word; they take the active wash while on.
- Menus are ARIA menus with arrow-key support; Pick, Find and Tree report their pressed state; every control shows a 2px orange focus ring.

### Docking

The toolbar sits 20px from the corner set by `dock`, plus the device's safe-area inset. If a fixed or sticky element at least 80% of the viewport wide touches the docked edge, such as an app's tab bar, the toolbar sits clear of it. `dockOffset` adds a distance of your own and replaces the detected bar on any side it sets. The toast, the dialog status line, the Find panel and the Tree open 8px beyond the toolbar; the address chain opens at the opposite edge.

### Compact layout

Under 480px wide, or with a coarse pointer, the toolbar is at most the viewport width less its margins and wraps onto more rows, key captions shrink to their shortcut letter, and every control is at least 44px tall. Under 480px the logotype is dropped and the icon stays.

## Panels

- **Find**: a 400px panel beside the toolbar with a labelled search field, a list of matches each tagged by tier, and a status line. A jump scrolls to the element, frames it in orange and dims the rest of the page with one fixed layer that takes no clicks.
- **Pick**: a dark chip (`#111827`, 6px radius) near the pointer with the chain. The section part is on `#F97316`, the block on near-white, the element outlined, separated by `/`, with the shared prefix dropped. A hint line says what a click copies. On touch, a sheet rises from the bottom with the chain, the full address, and Copy address, Parent and Close buttons at least 44px tall.
- **Tree**: every address in document order, tagged by tier, each with a copy button.
- **Address chain**: on hover over a label, the label's ancestors, each copyable.
- **Dialog status line**: "Dialog opened. Showing the N addresses inside it.", above the toolbar, with `role="status"`.

## In Astro's Dev Toolbar

StadiaRef is an app with the product icon. Its panel is dark, to sit with Astro's own: `#13151A` background, `#343841` border, 12px radius. It has the brand row (icon, logotype, version), the AUTO chip while auto-address is on, Labels (one of three), Show (three independent toggles), Outline (one of three), the address count, and Pick, Find and Tree. The selected segment is `#F97316` with `#111827` text. The floating toolbar isn't drawn while the panel is there; everything else is, in StadiaRef's own corner, clear of Astro's bar.

## Motion

Short and functional: the toast fades and slides in over 150ms, the brand tooltip fades in 120ms, and the touch sheet rises in 180ms. Menus and panels open without animation. Under `prefers-reduced-motion: reduce` the sheet doesn't animate.
