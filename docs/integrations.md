# Integrations

StadiaRef is built to sit alongside other tools on the page: review sidebars, feedback widgets, devtools panels. It exposes enough for a host to keep it in step with its own theme and sign-in state, and to hear when someone clicks an address.

Three patterns cover most cases, and the address card takes two more: your own rows on it, and your own action. Each works against any host. The [API](api.md) has the full reference.

## 1. Send clicked addresses to your own tool

`stadiaref:address-click` fires whenever someone copies an address: from the card, from Pick or a label with `click: 'copy'`, from Find or from the Tree. To hear the card open and close, listen for `stadiaref:card`.

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

## 4. Your rows on the address card

Since 3.3 a label click opens StadiaRef's [address card](using-the-toolbar.md#the-address-card). A host that drew its own card or tooltip on `stadiaref:address-click` can drop it and add what it knows to StadiaRef's card instead, with [`setLookup()`](api.md#the-address-card):

```js
window.stadiaref?.setLookup(async (address) => {
  const entry = await registry.lookup(address);   // your own data
  if (!entry) return [{ label: 'Registry', value: 'Not in the registry', tone: 'warn' }];
  return [
    { label: 'Lock', value: entry.locked ? 'Locked' : 'Draft', tone: entry.locked ? 'ok' : 'warn' },
    ...entry.problems.map((p) => ({ label: 'Format', value: p, tone: 'error' })),
    { label: 'Notes', value: String(entry.notes.length), tone: 'muted' },
    { label: 'Spec', value: 'Open', href: entry.specUrl },
  ];
});
```

Values are shown as text, never HTML, and only `http`, `https` and `mailto` links are kept.

## 5. Your action on the address card: `onAddress`

`onAddress(fn, label)` adds one button to every card. A click calls `fn(address, context)`. StadiaRef still stores nothing and sends nothing; what `fn` does is up to you.

| `context` field | What it is |
|---|---|
| `tier` | `'section'`, `'block'`, `'element'` or `'unclassified'` |
| `element` | The page element |
| `text` | Its text, first 140 characters |
| `chain` | The addresses above it, outermost first |
| `tag` | Its tag name, lower case |
| `url`, `title` | The page's URL and title |
| `viewport` | `{ width, height }` |
| `brief` | The one-line brief that **Copy for a brief** copies |

A GitHub issue, prefilled:

```js
window.stadiaref?.onAddress((address, ctx) => {
  const url = new URL('https://github.com/your-org/your-repo/issues/new');
  url.searchParams.set('title', `[${address}] `);
  url.searchParams.set('body', [
    `Address: \`${address}\` (${ctx.tier})`,
    `Inside: ${ctx.chain.join(' / ') || 'nothing'}`,
    `Page: ${ctx.url} at ${ctx.viewport.width}px`,
    ctx.text ? `Text: "${ctx.text}"` : '',
  ].filter(Boolean).join('\n'));
  window.open(url, '_blank', 'noopener');
}, 'Open an issue');
```

A Linear issue, prefilled (Linear's `linear.app/new` link takes `title` and `description`; add `team` to choose the team):

```js
window.stadiaref?.onAddress((address, ctx) => {
  const url = new URL('https://linear.app/new');
  url.searchParams.set('title', `[${address}] `);
  url.searchParams.set('description', `\`${address}\` (${ctx.tier}) on ${ctx.url}\n\n${ctx.brief}`);
  window.open(url, '_blank', 'noopener');
}, 'Linear issue');
```

`onAddress(null)` removes the button. A throw in `fn` is caught and logged.

## 2. Show who is reviewing

If the host knows who is signed in, show it in the toolbar. StadiaRef never reads cookies or tokens. The host tells it.

```js
function syncUser() {
  const session = getHostSession();   // your own auth state
  window.stadiaref?.setUser(
    session?.user
      ? { name: session.user.displayName, role: session.user.role }
      : null
  );
}

syncUser();                                            // calls made before StadiaRef starts are queued
window.addEventListener('stadiaref:ready', syncUser);  // in case StadiaRef loads after this code
hostAuth.subscribe(syncUser);
```

Other tools on the page can follow along with `stadiaref:user-change`. StadiaRef
keeps only the display fields `name` and `role`; it discards IDs, email
addresses and any other fields. Those display fields are visible to every
script on the page, so use a pseudonym when a real name is unnecessary.

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
