# Install: Next.js

Next.js doesn't use Vite, so you load StadiaRef with one small client component. The import sits behind a development check, which means the production build drops it.

Works with the App Router and the Pages Router.

## 1. Install

```bash
npm install --save-dev stadiaref
```

## 2. Add the component

```tsx
// app/stadiaref.tsx
'use client';

import { useEffect } from 'react';

export function StadiaRef() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('stadiaref').then(({ default: stadiaref }) => {
        stadiaref.init({ profile: 'app' });
      });
    }
  }, []);

  return null;
}
```

Next.js replaces `process.env.NODE_ENV` at build time. In a production build the condition is a constant `false`, so the bundler removes the whole block and StadiaRef never reaches your users. Keep the `import()` inside the `if` block. An early `return` above it doesn't give the bundler the same guarantee.

## 3. Render it once

**App Router**

```tsx
// app/layout.tsx
import { StadiaRef } from './stadiaref';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <StadiaRef />
      </body>
    </html>
  );
}
```

**Pages Router**

Put the same component at `components/stadiaref.tsx`, then:

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { StadiaRef } from '../components/stadiaref';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <StadiaRef />
    </>
  );
}
```

## 4. Run the dev server and press D

```bash
npm run dev
```

## 5. Add addresses

`data-ref` works on any element, in server and client components alike.

```tsx
export default function JobsPage() {
  return (
    <main data-ref="ops-app-jobs">
      <JobCard data-ref="ops-app-jobs-card-01" />
    </main>
  );
}

// Spread the rest props so each use of the component can pass its own address.
function JobCard(props: React.ComponentProps<'article'>) {
  return <article {...props}>…</article>;
}
```

## Showing it on a staging build

A staging deploy is a production build, so the check above keeps StadiaRef out of it. If you want it on staging for your own team, add your own flag:

```tsx
if (
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_STADIAREF === '1'
) {
  import('stadiaref').then(({ default: stadiaref }) => {
    stadiaref.init({ profile: 'app' });
  });
}
```

Set `NEXT_PUBLIC_STADIAREF=1` when you build for staging. Two things change once you add a flag like this:

- Move `stadiaref` from `devDependencies` to `dependencies`, because the staging build needs it installed.
- A build made without the flag may still contain StadiaRef as a separate chunk that is never requested. If you need the production output to be free of it entirely, set `NEXT_PUBLIC_STADIAREF=0` for production builds so the condition is a constant, then check the output. See [Keeping StadiaRef out of production](../keep-it-out-of-production.md).

## Things to know

- **Server rendering.** Importing `stadiaref` on the server does nothing. It only starts in a browser.
- **Route changes.** StadiaRef re-surveys the screen on every navigation, including soft navigations. You don't need to call `refresh()`.
- **Signed-in reviewer.** If your app knows who is looking, show it in the toolbar with `stadiaref.setUser({ name, role })`. See [Integrations](../integrations.md).
- **Your own shortcut keys.** If your app already uses **D** or another StadiaRef key, rebind it: `stadiaref.init({ keys: { toggle: 'V' } })`. See the [API](../api.md#keys).
