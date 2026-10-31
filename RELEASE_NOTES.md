# StadiaRef 3.3.0

**Click something. The address card.**

StadiaRef shows each `data-ref` attribute on a page as a label. In 3.3 a click on a label opens a card beside it with everything about that one address, so turning StadiaRef on and clicking is all it takes.

## What's new

- **The address card.** The address and its tier, the element's text, the addresses it sits in and the ones it holds, and **Copy**, **Copy for a brief**, **Parent** and **Show in Tree**. It opens beside the label, flips above when there's no room, and closes on Esc, a click elsewhere or a scroll. It works from the keyboard.
- **Copy for a brief.** One line for a ticket, a message or an agent: the page, the screen width, the address, its tier and its text.
- **Your rows on the card.** `setLookup()` lets a site or app add what it knows about an address, such as lock state, format problems, notes or a link. `onAddress()` adds one action of your own, such as opening a GitHub or Linear issue.
- **Inspect in Pick.** Press P and click anything: its card opens, or the card of the nearest thing with an address.
- **A Tree that makes room.** With `tree: 'push'` the Tree opens as a column on the right and tells the page its width, so nothing is covered.
- **The Tree finds problems.** A Problems tab lists duplicated addresses, addresses that don't fit the profile, and gaps in numbering. The Tree also has a search field and a tier filter.
- **The toolbar in your own chrome.** `dock: 'host'` with `mount: '#selector'` draws the toolbar inside your app's own top bar or panel.
- **A hint with labels off.** Rest the pointer on something and its address appears beside it.
- **Drill-down,** behind `drill: true` while it settles: narrow the view to one section or block, with a breadcrumb.

## Upgrading

A label click now opens the card instead of copying. The card has Copy, and `stadiaref:address-click` still fires when you copy from it (with `source: 'card'`). To keep 3.2's click to copy, set `click: 'copy'` in the config, or choose **Copies the address** under **Clicking a label** in the WordPress settings. Pages still configured through the 2.x `seguruDebugConfig` or `sdtConfig` keep click to copy unless they say otherwise.

If your site or app drew its own card or tooltip on `stadiaref:address-click`, you can drop it and use `setLookup()` to put your information on StadiaRef's card. TypeScript users who narrow `AddressSource` exhaustively get two new values, `'card'` and `'brief'`.

Update the package (`npm install --save-dev stadiaref@3.3.0`) or the WordPress plugin as usual.

The overlay layer for labels, planned for 3.3, moves to 3.4.

The full list of changes is in the [changelog](https://github.com/segurudigital/stadiaref/blob/main/CHANGELOG.md).

## Assets

- `stadiaref.min.js`: the script-tag build
- `stadiaref-wp-v3.3.0.zip`: the WordPress plugin
- `seguru-debug-toolbar-wp-v2.5.1.zip`: the last Seguru Debug Toolbar release, for sites still on 2.x
