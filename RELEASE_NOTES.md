# StadiaRef 3.4.0

**Your page stays yours.**

StadiaRef shows each `data-ref` attribute on a page as a label. Until now those labels were added inside your page's own elements. In 3.4 StadiaRef draws them in a layer of its own, over the page, so it no longer writes into your markup.

## What's new

- **Nothing added to your elements.** Labels, badges and outline frames are drawn in StadiaRef's own layer, placed over each element. No label nodes inside your elements, no `position: relative` on them, no stylesheet in your `<head>`.
- **Re-renders can't drop a label.** A framework can rewrite an element's contents as often as it likes: the label isn't in there.
- **Labels behave as if they were in the page.** They follow scrolling, including inside scroll containers, are clipped by those containers, step aside under your fixed header or tab bar, and sit on top of open modals and popovers.
- **Much faster on big screens.** A page with 1,000 addresses shows in about a third of a second, down from more than three.
- **Drill-down is on.** **Drill in** on the address card narrows the view to one section or block, with a breadcrumb back out. `drill: false` turns it off.

## Upgrading

Nothing to change for most sites. Update the package (`npm install --save-dev stadiaref@3.4.0`) or the WordPress plugin as usual.

If your own tests or tools look for StadiaRef's labels inside your elements, they're now in StadiaRef's shadow root: `#stadiaref-host`'s `shadowRoot`, in `.stadiaref-slot[data-stadiaref-for="<address>"]`. StadiaRef's host now sits at the top of the stacking order, so its labels draw over your own fixed panels.

The full list of changes is in the [changelog](https://github.com/segurudigital/stadiaref/blob/main/CHANGELOG.md).

## Assets

- `stadiaref.min.js`: the script-tag build
- `stadiaref-wp-v3.4.0.zip`: the WordPress plugin
- `seguru-debug-toolbar-wp-v2.5.1.zip`: the last Seguru Debug Toolbar release, for sites still on 2.x
