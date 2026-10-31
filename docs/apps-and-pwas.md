# Apps and PWAs

StadiaRef treats an app screen the same way it treats a page. This guide covers the parts that are specific to apps: screens that change without a reload, dialogs, touch, and installed PWAs.

Install it first with the guide for your stack: [Vite](install/vite.md), [Next.js](install/nextjs.md) or [another framework](install/other-frameworks.md).

## Addresses for an app

Use the `app` profile and this shape:

```text
[product]-[surface]-[screen]-[part]
```

| Piece | What it is | Examples |
|---|---|---|
| product | A short code for the product | `ops`, `shop`, `crm` |
| surface | Where it runs | `app`, `pwa`, `mobile`, `wp-admin`, `shopify-admin` |
| screen | The screen, with enough of the path to be clear | `jobs`, `settings-users-roles` |
| part | Anything inside the screen | `card-02`, `card-02-status`, `dialog-edit` |

```jsx
<main data-ref="ops-app-jobs">
  <article data-ref="ops-app-jobs-card-02">
    <span data-ref="ops-app-jobs-card-02-status">In progress</span>
  </article>
</main>
```

```js
stadiaref.init({ profile: 'app' });
```

Tiers come from nesting, the same as the `generic` profile, so the screen's own element is the section. Full rules are in [Addressing](addressing.md#the-app-profile).

For lists rendered from data, build the address from something stable. Use the record's position in the design or its role. Don't use a database id that changes between environments.

## Screens that change without a reload

StadiaRef watches the screen. When your router navigates, or new content mounts after a fetch, it re-surveys and labels what's new. Labels for content that has gone are removed.

You don't call anything. `refresh()` still exists for the rare case where you want to force a survey:

```js
window.stadiaref.refresh();
```

To turn the watching off, for example while profiling:

```js
stadiaref.init({ watch: false });
```

## Dialogs, sheets and menus

When a modal opens, the labels behind it are no use and get in the way. StadiaRef narrows to the dialog: only addresses inside it show, and a short status line tells you how many there are. Close the dialog and the screen's labels come back.

While the modal is open the toolbar moves inside it. A modal makes the rest of the page unreachable, and that would include the toolbar. Esc is left to your dialog while it is open, so closing it doesn't hide StadiaRef as well.

A modal is detected when it is a `<dialog>` opened with `showModal()`, or an element with `role="dialog"` (or `alertdialog`) and `aria-modal="true"`. If your dialogs use neither, add the role and `aria-modal`. That is also what a screen reader needs to treat it as a modal.

Labels inside closed menus, collapsed panels and inactive tabs stay hidden until the container opens, so a label never sits on top of something you can't see.

Give the dialog its own address so it is easy to refer to:

```jsx
<dialog data-ref="ops-app-jobs-dialog-edit">
  <input data-ref="ops-app-jobs-dialog-edit-field-customer" />
</dialog>
```

A dialog that your framework renders at the end of `<body>`, outside the screen's element, has no addressed ancestor. It shows as a section.

## The toolbar in your app bar

A fixed toolbar in a corner can sit over an app's own controls. `dock: 'host'` with `mount: '<selector>'` draws it inside an element of your app instead, inline, such as a slot in the top bar. See [Toolbar in your own chrome](api.md#toolbar-in-your-own-chrome).

## Making room for the Tree

In an app the Tree covering the screen gets in the way. Set `tree: 'push'` and give the app shell the room StadiaRef asks for:

```css
.app-shell { margin-right: var(--stadiaref-tree-w, 0); }
```

The property is `0px` while the Tree is shut, so the shell is unchanged until someone opens it. `stadiaref:tree` carries the same width for layouts that are set in code. See [Tree push mode](api.md#tree-push-mode).

## Touch

A phone has no hover and small labels are hard to tap. On a touch screen:

- The toolbar's controls are at least 44px. The same happens on any screen narrower than 480px.
- **Pick** works by tapping. Tap the thing you want and a sheet slides up with its section, block and element, a **Copy address** button, and **Parent** to step up one level.

## Installed PWAs

- The toolbar keeps clear of the notch and the home indicator. It uses the safe-area insets the device reports.
- If your app has a tab bar fixed to the bottom, StadiaRef docks above it. It finds full-width bars fixed to the edge it is docked on.

If it guesses wrong, set the offset yourself:

```js
stadiaref.init({
  dock: 'bottom-right',
  dockOffset: { bottom: 72 }, // pixels above the bottom edge
});
```

## Apps in a web view

A web view renders the DOM, so StadiaRef works in one. That covers Capacitor and similar wrappers.

What the web view loads decides whether StadiaRef is there. A normal device build loads your production web build, which doesn't contain it. When you point the web view at your dev server for live reload (in Capacitor, the `server.url` setting), the Vite plugin or your dev-only import brings StadiaRef along.

To open the toolbar on a device with no keyboard, start it visible:

```js
stadiaref.init({ startHidden: false });
```

## What it can't do

StadiaRef reads the DOM. It can't see native views: screens built with SwiftUI, Jetpack Compose, React Native or Flutter. If part of your app is native and part is a web view, it covers the web view part.

## Your DOM stays yours

Since 3.4 StadiaRef draws labels, badges and outline frames in a layer of its own, inside its shadow root, placed over each element's box. Nothing is appended to your elements and no style is changed on them, so:

- **A re-render can't drop a label.** Your framework can rewrite an element's contents as often as it likes; the label isn't in there.
- **Hydration isn't disturbed,** shown or hidden. While StadiaRef is hidden it adds nothing at all; the host is added when you first press **D**. What it does write, it is asked to: `data-ref` on elements when auto-address or the class converter is on, and `data-stadiaref-*` attributes on `<html>`.

Labels follow their elements when the page or a scroll container scrolls, the window is resized, or an element changes size, at most once per frame. An element that is animated with a transform is followed when the animation ends.

They behave as if they were still inside the page:

- **Clipped by scroll containers.** A label is cut off by the same scrolling or `overflow: hidden` ancestors as its element, and goes once the element is scrolled out of view.
- **Under your fixed UI, they step aside.** Labels draw over the page, so a label whose element has scrolled under a fixed or sticky header, tab bar or banner hides until the element comes out. Other overlaps, such as a link stretched over a card, leave the label alone.
- **Over popovers and modals.** While a modal dialog or a popover is open, StadiaRef moves into it, so the labels of what it shows are drawn on top of it.

A page with 1,000 addresses surveys in about a third of a second, and a scroll places every label within a frame.

## Clashing shortcut keys

Apps often have their own keyboard shortcuts. Every StadiaRef key can be changed or turned off:

```js
stadiaref.init({
  keys: {
    toggle: 'V',   // was D
    pick: false,   // turn a key off
  },
});
```

Keys are ignored while you type in a field and when Cmd, Ctrl or Alt is held. See the [API](api.md#keys).
