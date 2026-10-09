# Using the toolbar

Everything the toolbar does, control by control.

## Show and hide

StadiaRef loads hidden. Press **D** to show the toolbar and the labels. Press **D** again to hide them.

**Esc** leaves Pick or Find if one of them is open. With neither open, it hides everything in one press.

Starting hidden keeps screenshots, client demos and automated browser sessions clean. To show it on load instead, set `startHidden: false` in the [config](api.md#config).

## The toolbar

From left to right:

| Control | What it does |
|---|---|
| **StadiaRef** | The mark and name. Always there |
| **Labels** | How addresses are drawn on the page |
| **Show** | Which tiers are drawn |
| **AUTO** | A small dashed chip. It appears only while auto-address is on |
| **Pick** | Point at something to get its address |
| **Find** | Go to an address you already have |
| **Outline** | Frames and guides around sections and blocks |
| **Tree** | A list of every address on the screen |

Under `astro dev` the same controls live in a panel inside Astro's Dev Toolbar. On a narrow screen the toolbar wraps onto extra rows and the controls grow for touch.

## Labels (L)

| Mode | What you see | Good for |
|---|---|---|
| **Full** | The address written out on every element | Review, QA, copying addresses |
| **Icons** | A small dot. Hover it to read the address | Looking at the design with addresses close at hand |
| **Off** | Nothing on the page. The toolbar stays | Checking the page itself |

Labels are coded by tier so you can tell them apart at a glance:

| Tier | Label |
|---|---|
| Section | Solid lime, marked **SEC** |
| Block | Dark, marked **BLK** |
| Element | Light with a border, marked **EL** |
| Temporary (auto-address) | Dashed border, marked **AUTO** |
| Doesn't fit the profile | Dashed amber, marked **?** |

On a dark part of the page each label switches to a version that reads against it.

**Click any label to copy its address.** A toast confirms what was copied.

When labels would overlap, StadiaRef staggers them and draws a thin line back to the element. Where there still isn't room, the extra labels fold into a **+N** badge. Hover the badge to see the list and click a row to copy it.

Labels inside anything hidden, such as a closed menu or an inactive tab, stay hidden until it opens.

## Show (1, 2, 3)

The Show button opens a menu with a tick box for each tier: sections, blocks, elements. Tick any mix.

- **1** switches sections on or off.
- **2** switches blocks.
- **3** switches elements.

The button turns lime whenever a tier is hidden, so you can see at a glance that you aren't looking at everything. With nothing ticked, no labels show and the button reads None.

Some useful settings:

| You want | Tick |
|---|---|
| A map of the page | Sections only |
| The structure, without the detail | Sections and blocks |
| One button among many | Elements only |
| Everything | All three |

## Three ways to find one address

A dense screen can carry fifty addresses or more. These get you to the one you want.

### You know roughly where it is: Show

Cut down to one tier and read the labels.

### You can see it: Pick (P)

Press **P** or click **Pick**. The labels step aside. Move the pointer over the page and one chip follows it, showing the section, block and element under the pointer. Click to copy the address of the element under the pointer. To take the block or the section instead, press the up arrow to step up a level first. The down arrow steps back.

Press **P** again or **Esc** to leave Pick.

On a touch screen, tap the thing you want. A sheet slides up with the same three parts, **Copy address**, and **Parent** to step up a level.

### You have the address: Find (/)

Press **/** or click **Find**. Type or paste an address and press **Enter**. The page scrolls to it, highlights it and dims everything else.

Find searches every address on the screen, including tiers that Show is hiding. While a dialog is open it looks inside the dialog. It matches part of an address too. Type `card-06` and it lists every address that contains it. **Enter** jumps to the first match, the arrow keys move through the list, and **Esc** closes Find.

## Outline (O)

| Mode | What you see |
|---|---|
| **Off** | No guides |
| **Sections** | A lime frame, edged in dark green, around each section wrapper |
| **Blocks** | Section frames, plus a lighter dashed guide around each block container |

Outline frames the page's structure, whether or not it has addresses: section wrappers are `<section>` elements directly inside `<body>`, `<main>` or the content area, and page-builder sections (Elementor, Bricks, Oxygen, Breakdance); block containers are `<article>`, `<aside>`, `<nav>`, Gutenberg blocks and page-builder columns and widgets. [Page builders](page-builders.md#auto-address) lists them.

Outline is useful on its own with labels off. It shows where one section ends and the next begins, and which wrappers overlap.

## Tree

The Tree button opens a panel listing every address on the screen in page order, indented by nesting and tagged by tier.

- Hover a row to highlight the element on the page.
- Click a row to scroll to it.
- Click the copy button on a row to copy without moving.

The Tree is the clean view when a screen is too dense to read from labels.

## The address chain

Hover a label and a small panel opens at the opposite edge (at the top if the toolbar is at the bottom), on the toolbar's side, showing where the element sits: its section, then its block, then the element itself. Each row copies on click. Pin the panel to keep it open.

## Auto-address

Auto-address gives a temporary address to anything without a `data-ref`. It is a setting, not a toolbar control: turn it on in the [config](api.md#config) or in the WordPress plugin settings.

While it is on, the **AUTO** chip shows on the toolbar and temporary addresses carry a dashed **AUTO** label. They are worked out from the page slug and position, so they change when the page does. See [Addressing](addressing.md#auto-address).

## Keys

| Key | Action |
|---|---|
| **D** | Show or hide the toolbar and labels |
| **L** | Cycle Labels: Off, Icons, Full |
| **1** **2** **3** | Switch sections, blocks, elements |
| **P** | Pick |
| **/** | Find |
| **O** | Cycle Outline: Off, Sections, Blocks |
| **Esc** | Leave Pick or Find. With neither open, hide everything |

Keys do nothing while you are typing in a field, and nothing when Cmd, Ctrl or Alt is held. While one of your app's own modal dialogs is open, Esc is left to the dialog. Every key can be changed or turned off. See the [API](api.md#keys).

## Theme and position

The toolbar follows the operating system's light or dark setting, and a `dark` class on `<html>` if your site uses one. Pin it with `theme: 'light'` or `theme: 'dark'`.

It docks bottom-right by default. Use `dock` to move it to another corner, or `dock: 'auto'` to let it pick a corner that nothing else is using.

## Who is looking

If the host page knows who is signed in, it can show their name and role in the toolbar. See [Integrations](integrations.md).
