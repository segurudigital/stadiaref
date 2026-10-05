# Integrations

StadiaRef is built to sit alongside other tools on the page: review sidebars, feedback widgets, devtools panels. It exposes enough for a host to keep it in step with its own theme and sign-in state, and to hear when someone clicks an address.

Three patterns cover most cases. Each works against any host. The [API](api.md) has the full reference.

## 1. Send clicked addresses to your own tool

`stadiaref:address-click` fires whenever someone copies an address: from a label, from Pick, from Find or from the Tree.

```js
window.addEventListener('stadiaref:address-click', (event) => {
  const { address, tier, element, source, copied } = event.detail;

  feedbackPanel.addNote({
    address,                      // the stable key for the note
    tier,                         // 'section' | 'block' | 'element' | 'unclassified'
    url: location.href,
    preview: element.textContent.trim().slice(0, 120),
  });
});
```

Notes:

- **Key your notes on `address`.** It is stable across reloads, deploys and environments. The `element` reference is only good until the next navigation.
- **StadiaRef has already tried to copy the address** and shown its toast by the time your listener runs. `copied` tells you whether the clipboard accepted it.
- **StadiaRef keeps no record of addresses** and never sends one anywhere. Whatever happens next is your listener's job: open a panel, post to your tracker, file a GitHub issue.
- **Hover works the same way.** `stadiaref:address-hover` and `stadiaref:address-leave` let you preview a note before anyone clicks.

Filing a GitHub issue from a click:

```js
window.addEventListener('stadiaref:address-click', async ({ detail }) => {
  const title = `[${detail.address}] `;
  const body = `Address: \`${detail.address}\`\nPage: ${location.href}\n\n`;
  const url = new URL('https://github.com/your-org/your-repo/issues/new');
  url.searchParams.set('title', title);
  url.searchParams.set('body', body);
  window.open(url, '_blank', 'noopener');
});
```

## 2. Show who is reviewing

If the host knows who is signed in, show it in the toolbar. StadiaRef never reads cookies or tokens. The host tells it.

```js
function syncUser() {
  const session = getHostSession();   // your own auth state
  window.stadiaref?.setUser(
    session?.user
      ? { name: session.user.displayName, role: session.user.role, id: session.user.id }
      : null
  );
}

syncUser();                                            // calls made before StadiaRef starts are queued
window.addEventListener('stadiaref:ready', syncUser);  // in case StadiaRef loads after this code
hostAuth.subscribe(syncUser);
```

Other tools on the page can follow along with `stadiaref:user-change`.

## 3. Keep the theme in step

By default the toolbar follows the operating system and a `dark` class on `<html>`. Most hosts need nothing more.

If your host keeps its theme somewhere else, drive StadiaRef from it:

```js
function syncTheme() {
  window.stadiaref?.setTheme(getHostTheme());   // 'light' | 'dark' | 'auto'
}

syncTheme();
window.addEventListener('stadiaref:ready', syncTheme);
hostThemeStore.subscribe(syncTheme);
```

Or let StadiaRef follow the system and tell everything else when it flips:

```js
window.addEventListener('stadiaref:theme-change', (event) => {
  document.documentElement.dataset.theme = event.detail.theme;   // 'light' | 'dark'
});
```

The theme setting only affects the toolbar and its panels. Labels on the page choose light or dark on their own, from the background they sit on.

## Putting it together: a review sidebar

A preview page with a docked sidebar where reviewers leave notes uses all three:

1. The host's theme toggle calls `setTheme()`.
2. After sign-in the host calls `setUser()`, so the reviewer sees their name next to the tools.
3. The host listens for `stadiaref:address-click` and adds a note keyed on the address.

Two more things make it tidy:

- **Move out of the way.** If the sidebar is on the right, start StadiaRef with `dock: 'bottom-left'`.
- **Hide together.** Call `window.stadiaref?.hide()` from the host's own "hide tools" control so everything clears in one action.

All of this lives in the host, written against the public API and events.

## Where to put this code

StadiaRef isn't in your production build, so code that talks to it has to cope with it being absent.

- **Best:** put it in a [setup module](addressing.md#your-own-profile). The Astro integration and the Vite plugin load that file on the dev server only, and hand it the API.
- **Otherwise:** guard every call with `window.stadiaref?.`, as the examples above do. Event listeners need no guard. They never fire when StadiaRef isn't there.

## Your own keys

If the host has keyboard shortcuts of its own, rebind StadiaRef's so they don't clash:

```js
window.stadiaref?.init({ keys: { toggle: 'V', outline: false } });
```

See [Keys](api.md#keys).
