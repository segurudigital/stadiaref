# API

Config, the JavaScript API, events, and the core library.

- [Config](#config)
- [Keys](#keys)
- [JavaScript API](#javascript-api)
- [Events](#events)
- [The core library](#the-core-library)

## Config

Every way of loading StadiaRef takes the same keys. (The WordPress settings page covers labels, start hidden, dock, profile, the class converter and auto-address; set any other key with `window.stadiarefConfig` in your theme.)

| How you loaded it | Where config goes |
|---|---|
| Astro integration | `stadiaref({ … })` in `astro.config.mjs` |
| Vite plugin | `stadiaref({ … })` in `vite.config.js` |
| Dynamic import | `stadiaref.init({ … })` |
| Script tag | `window.stadiarefConfig = { … }` before the tag |
| WordPress | **Settings → StadiaRef** |

| Key | Values | Default | What it does |
|---|---|---|---|
| `profile` | `'generic'`, `'app'`, `'titan'`, or a registered name | `'generic'` | How addresses are sorted into tiers and checked. See [Addressing](addressing.md#profiles) |
| `labels` | `'full'`, `'icons'`, `'off'` | `'full'` | How addresses are drawn |
| `tiers` | Any of `'section'`, `'block'`, `'element'` in an array | all three | Which tiers show. This is the Show control |
| `autoAddress` | `true`, `false` | `false` | Temporary addresses for elements that have none |
| `outline` | `'off'`, `'section'`, `'block'` | `'off'` | Guide outlines |
| `startHidden` | `true`, `false` | `true` | Load hidden until the toggle key is pressed |
| `watch` | `true`, `false` | `true` | Re-survey when the route changes or content mounts |
| `theme` | `'auto'`, `'light'`, `'dark'` | `'auto'`, or the theme last chosen with `setTheme()` in this browser | Toolbar theme |
| `dock` | `'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'`, `'auto'` | `'bottom-right'` | Which corner |
| `dockOffset` | `{ top, right, bottom, left }` in pixels | none | Extra distance from the edges, on top of the device's safe area |
| `keys` | See [Keys](#keys) | See below | Shortcut keys |
| `user` | `{ name, role, id, email }` or `null` | `null` | The identity pill |
| `classConverter` | `true`, `false` | `false` | Turn `dataref-` classes into `data-ref` attributes |
| `pageSlug` | A string | From the URL | The slug auto-address builds on |

The Astro integration and the Vite plugin take one more option, `setup`: the path to a module in your project whose default export receives the API before the first survey. Use it to register a profile or wire up listeners. It is only loaded on the dev server. See [Your own profile](addressing.md#your-own-profile).

Example:

```js
stadiaref.init({
  profile: 'app',
  tiers: ['section', 'block'],
  dock: 'bottom-left',
});
```

When the same key is set in more than one place, the order is: `init()` and the setters, then `window.stadiarefConfig`, then the WordPress settings, then `data-*` attributes on the script tag, then the defaults.

The script tag accepts `data-profile`, `data-labels`, `data-theme`, `data-dock` and `data-hotkey`.

## Keys

```js
stadiaref.init({
  keys: {
    toggle: 'D',     // show or hide everything
    labels: 'L',
    section: '1',
    block: '2',
    element: '3',
    pick: 'P',
    find: '/',
    outline: 'O',
    hide: 'Escape',  // leave Pick or Find, otherwise hide everything
  },
});
```

Set a key to `false` to turn it off. Pass only the keys you want to change.

- Keys match the character typed, so they work on any keyboard layout, including ones where a digit or `/` needs Shift.
- Keys are ignored while the user types in an input, a textarea, a select or an editable element, and when Cmd, Ctrl or Alt is held.
- While a modal dialog belonging to your app is open, StadiaRef leaves Esc to the dialog, unless Pick or Find is open. Then Esc closes that first and the dialog stays.

## JavaScript API

The API is the default export of the package and is also on `window.stadiaref`.

```js
import stadiaref from 'stadiaref';
// or, with a script tag:
const stadiaref = window.stadiaref;
```

Setters called before StadiaRef has finished starting are queued and applied when it is ready. To wait for it:

```js
await stadiaref.ready;   // a promise, resolved once StadiaRef has started
```

`stadiaref:ready` also fires on `window`, but a listener added after start misses it. The promise doesn't have that problem.

### Lifecycle

| Method | What it does |
|---|---|
| `version` | The version string |
| `ready` | A promise that resolves when StadiaRef has started |
| `init(config)` | Apply any [config keys](#config), at any time. `init({ startHidden: false })` after start shows the toolbar |
| `show()` / `hide()` / `toggle()` | Show or hide the toolbar and labels |
| `isVisible()` | `true` or `false` |
| `refresh()` | Survey the screen again now. Rarely needed with `watch` on |

### What is drawn

| Method | What it does |
|---|---|
| `setLabels(mode)` / `getLabels()` | `'full'`, `'icons'` or `'off'` |
| `setTiers(tiers)` / `getTiers()` | An array of `'section'`, `'block'`, `'element'` |
| `setAutoAddress(on)` / `getAutoAddress()` | `true` or `false` |
| `setOutline(mode)` / `getOutline()` | `'off'`, `'section'` or `'block'` |
| `setProfile(name)` / `getProfile()` | Switch profile and re-classify |

```js
stadiaref.setTiers(['element']);   // elements only
stadiaref.setTiers(['section', 'block', 'element']);
stadiaref.setTiers([]);            // no labels
```

### Finding

| Method | What it does |
|---|---|
| `pick()` | Start Pick. `pick(false)` stops it |
| `find(query)` | Open Find with `query`. Returns the matching addresses as an array. `find(false)` closes it |
| `toggleTree()` | Open or close the Tree panel |

### Toolbar

| Method | What it does |
|---|---|
| `setTheme(mode)` / `getTheme()` | Set `'auto'`, `'light'` or `'dark'`. `getTheme()` returns the theme in use |
| `setDock(corner)` / `getDock()` | Move the toolbar |
| `setKeys(keys)` / `getKeys()` | Change shortcut keys |
| `setUser(user)` / `getUser()` | Set or clear the identity pill |

### Addresses and profiles

| Method | What it does |
|---|---|
| `classify(address)` | `'section'`, `'block'`, `'element'` or `'unclassified'`, using the active profile. With a nesting-based profile it looks at the element on the page that carries the address |
| `validate(address)` | `{ valid, problems }`. The problems are sentences for people. Don't match on their wording |
| `registerProfile(profile)` | Add your own profile. See [Addressing](addressing.md#your-own-profile) |

## Events

StadiaRef fires events on `window`.

```js
window.addEventListener('stadiaref:address-click', (event) => {
  const { address, tier, element, source, copied } = event.detail;
  // file a note, open a panel, send it to your tracker
});
```

| Event | When | `detail` |
|---|---|---|
| `stadiaref:ready` | Started and the API is callable | `{ version }` |
| `stadiaref:show` | Toolbar shown | `{}` |
| `stadiaref:hide` | Toolbar hidden | `{}` |
| `stadiaref:address-click` | Someone picked an address to copy | `{ address, tier, element, source, copied }` |
| `stadiaref:address-hover` | The pointer entered a label | `{ address, tier, element }` |
| `stadiaref:address-leave` | The pointer left a label | `{ address, tier, element }` |
| `stadiaref:labels-change` | Label mode changed | `{ labels }` |
| `stadiaref:tiers-change` | The Show control changed | `{ tiers }` |
| `stadiaref:auto-address-change` | Auto-address switched | `{ autoAddress }` |
| `stadiaref:outline-change` | Outline mode changed | `{ outline }` |
| `stadiaref:theme-change` | The theme in use changed | `{ theme, mode }` |
| `stadiaref:user-change` | `setUser()` was called | `{ user }` |

- `address` is the Stadia Address.
- `tier` is `'section'`, `'block'`, `'element'` or `'unclassified'`.
- `element` is the page element that carries the address.
- `source` says where the click came from: `'label'` (a label, a +N row or the address chain), `'pick'`, `'find'` or `'tree'` (a row's copy button).
- `copied` is `true` if the address reached the clipboard. Browsers block the clipboard on pages that aren't served securely, such as a dev server opened from a phone by IP address, so check it if you rely on the copy.

StadiaRef tries the copy and shows its toast before the event fires. It keeps no record of addresses and sends nothing anywhere. The only thing it stores is your theme choice, in the browser's local storage. What happens with an address after that is up to your listener. [Integrations](integrations.md) has worked examples.

## The core library

`stadiaref/core` is the grammar on its own: no DOM, no toolbar. It runs in Node, so a test or a CI check can use the same rules the toolbar does.

```js
import { classify, validate, parse, registerProfile } from 'stadiaref/core';

classify('home-hero-card-01', { profile: 'titan' });
// 'block'

validate('Home_Hero');
// { valid: false, problems: ['uppercase letters', 'underscore'] }

parse('ops-app-jobs-card-02', { profile: 'app' });
// { address: 'ops-app-jobs-card-02', profile: 'app',
//   parts: { product: 'ops', surface: 'app', path: 'jobs-card-02' } }
```

| Function | Returns |
|---|---|
| `validate(address, { profile })` | `{ valid, problems }`. Checks the core rules, then the profile's |
| `classify(address, { profile, context })` | A tier, or `'unclassified'` |
| `parse(address, { profile })` | The address split into the parts the profile defines. For `app`, where the screen ends and the part begins can't be told from the text alone, so the rest comes back as one `path` |
| `registerProfile(profile)` | Adds a profile. The toolbar shares this registry, so a profile registered here is available to it |
| `profiles` | The names of the registered profiles |

`profile` defaults to `'generic'`.

A profile's own `classify()` returns a tier or `null`, and its `validate()` returns a list of problems. These functions wrap that: `null` becomes `'unclassified'`, and the list becomes `{ valid, problems }`.

The `generic` and `app` profiles work tiers out from nesting, so `classify()` needs a `context` for them: `{ depth, hasAddressedChildren }`. Without one it returns `'unclassified'`. The `titan` profile reads the tier from the address and needs no context.

A check that every address in a built page is well-formed and unique:

```js
import { readFileSync } from 'node:fs';
import { validate } from 'stadiaref/core';

const html = readFileSync('dist/index.html', 'utf8');
const addresses = [...html.matchAll(/data-ref="([^"]+)"/g)].map((m) => m[1]);

const seen = new Set();
for (const address of addresses) {
  const { valid, problems } = validate(address, { profile: 'titan' });
  if (!valid) throw new Error(`${address}: ${problems.join(', ')}`);
  if (seen.has(address)) throw new Error(`${address} appears twice`);
  seen.add(address);
}
```

## Names from 2.x

The old global, config keys, methods and events still work through 3.x. [Migrating from 2.x](migrating-from-2.x.md) maps each one to its new name.
