# Working with AI agents

Addresses are as useful to an AI coding agent as they are to a person. "Change the heading in `home-plans-card-02`" gives an agent an exact string to search for.

This page has two things:

1. A prompt that gets an agent to install StadiaRef and address a project.
2. How to hand addresses to an agent day to day.

## The rollout prompt

Paste everything in the block below into Claude Code, Cursor, Codex or any other coding agent, then tell it which project and which pages or screens to work on. The prompt carries the rules, so the agent doesn't need to read this repo.

````text
You are adding StadiaRef to this project and giving its screens addresses.

StadiaRef is a developer tool that shows `data-ref` attributes as labels on the page. The value of a `data-ref` is called a Stadia Address. Docs: https://github.com/segurudigital/stadiaref

## Rules that don't bend

1. Addresses are lower-case letters, numbers and hyphens. Nothing else.
2. Every address is unique on its screen.
3. An address never changes once written. If the project already has `data-ref` attributes, keep every one exactly as it is. Don't rename, renumber or "tidy" them.
4. StadiaRef must not ship to production. Load it for development only, using the method for this stack below.
5. Don't edit the StadiaRef script or copy it into the project. Install the package.

## Step 1: install StadiaRef for this stack

Work out the stack from the project files, then use the matching method.

Astro (astro.config.*):
  npm install --save-dev stadiaref
  In astro.config: import stadiaref from 'stadiaref/astro' and add stadiaref() to integrations.

Vite single-page app (vite.config.*, no server framework):
  npm install --save-dev stadiaref
  In vite.config: import stadiaref from 'stadiaref/vite' and add stadiaref() to plugins.

Next.js:
  npm install --save-dev stadiaref
  Add a client component that, inside useEffect, runs
    if (process.env.NODE_ENV === 'development') { import('stadiaref'); }
  and render it once in the root layout. Keep the import inside the if block.

SvelteKit, Nuxt, Remix, other bundled frameworks:
  npm install --save-dev stadiaref
  Import 'stadiaref' in the browser only, inside a check the bundler resolves at build time (dev from $app/environment, import.meta.dev, import.meta.env.DEV).

Static HTML or wireframes:
  <script src="https://cdn.jsdelivr.net/npm/stadiaref@3/dist/stadiaref.min.js" defer></script>
  Only in wireframes or non-production templates.

WordPress:
  Don't add a script tag to the theme. Tell the user to install the StadiaRef plugin. Your job is the addresses in the theme templates.

## Step 2: choose the profile

- Marketing site or content site: profile 'generic' (the default, no config needed).
- Web app or PWA: profile 'app'.
- The project's docs say it is a Seguru Titan Foundation: profile 'titan', and follow that project's own address rules instead of the patterns below.

Pass the profile in the integration or plugin options, or with stadiaref.init({ profile }).

## Step 3: write the addresses

Tiers: a section is a major band of the screen. A block is a unit inside it (a card, a row, a form, a dialog). An element is a single thing (a heading, a button, an image, a field).

generic profile, websites:
  section   [page]-[section]                 home-plans
  block     [page]-[section]-[part]          home-plans-card-02
  element   [page]-[section]-[part]-[role]   home-plans-card-02-cta

  - page matches the URL: home, about, services-web-design.
  - section says what the band is: hero, plans, testimonials, footer.
  - Name by role, never by tag or position: heading, cta-primary, image. Never h2, button-1, third.
  - Number repeated things with two digits: card-01, card-02.

app profile, apps and PWAs:
  [product]-[surface]-[screen]-[part]
  ops-app-jobs / ops-app-jobs-card-02 / ops-app-jobs-card-02-status
  - Ask the user for the product code if the project doesn't make it obvious.
  - surface is one of: app, pwa, mobile, wp-admin, wp-frontend, shopify-admin, shopify-storefront.
  - Give dialogs and sheets their own address: ops-app-jobs-dialog-edit.

What to address, in this order:
  1. Every section of every screen you were asked to cover.
  2. Blocks inside each section.
  3. Elements people will point at: headings, body copy blocks, buttons and links styled as buttons, images, form fields, nav items, list items when the list is content.

Skip wrappers that exist only for layout, and individual paragraphs inside one block of copy.

Reusable components must not hard-code an address. Make the component pass `data-ref` (or its rest props) through to its root element, and set the address where the component is used.

For lists rendered from data, build the address from the parent address plus a stable two-digit index or a stable key. Never use a database id.

## Step 4: check your work

- Run the dev server. StadiaRef starts hidden. Press D to show it.
- No address appears twice on a screen. Check with:
    grep -rhoE 'data-ref="[^"]+"' <rendered output or source> | sort | uniq -d
- Every address is lower-case with hyphens only.
- Every pre-existing address is unchanged (compare with git diff).
- Run a production build and confirm the toolbar is not in the output. Search for its marker:
    grep -rl "data-stadiaref-root" <build output dir> || echo clean

## Report back

1. One paragraph: which screens you addressed and roughly how many addresses.
2. A list of places where you had to guess a name. These need a human to confirm.
3. The files you changed.

Don't paste the diff.
````

### Notes on the prompt

- Rule 3 is the one that matters most. Agents like to tidy. An address that changes breaks every ticket and note that used it.
- If your project has its own grammar, register a [profile](addressing.md#your-own-profile) and replace Step 3 with your rules.
- The prompt asks for a list of guesses. Read it. Section names are a judgement call and worth two minutes of your time.

## Handing addresses to an agent

Once a project is addressed, the loop is short:

1. Open the screen, press **D**, click the label of the thing you want changed. The address is on your clipboard.
2. Paste it into your request: "In `ops-app-jobs-card-02-status`, show the due date next to the status."
3. The agent searches the codebase for the string and edits that element.

A few habits help:

- **Give the address, then the change.** The address answers "where". Your sentence only has to answer "what".
- **Use Pick for one-offs and Find to check.** After the agent reports back, paste the address into **Find** to jump to it and see the result.
- **Several changes, several addresses.** A list of "address: change" lines is easy for an agent to work through and easy for you to tick off.

## Agents that browse

An agent driving a browser can read addresses straight from the DOM. StadiaRef doesn't need to be visible. For an agent that works from screenshots, show the toolbar with labels set to Full so the addresses are in the image:

```js
window.stadiaref.show();
window.stadiaref.setLabels('full');
```

StadiaRef starts hidden so that screenshots taken by people and agents are clean unless someone asks for labels.
