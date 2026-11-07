# StadiaRef 3.4.1

**A types fix: `setUser({ id, email })` compiles again.**

3.2.0 made reviewer identity display-only: StadiaRef keeps a user's `name` and `role` and drops everything else. That was right, but the same release also removed `id` and `email` from the `User` type, so TypeScript code that passed them (as the 2.3.0 docs showed) stopped compiling on a minor update.

## What's fixed

- **`init({ user })` and `setUser()` accept `id` and `email` again**, through a new `UserInput` type. Both fields are marked deprecated: they are ignored, and they will be removed in 4.0.
- **Nothing changes at runtime.** StadiaRef still keeps only `name` and `role`. `getUser()` and the `stadiaref:user-change` event still give back `name` and `role` only, and their type (`User`) says so.

## Upgrading

Update the package (`npm install --save-dev stadiaref@3.4.1`) or the WordPress plugin as usual. You can drop `id` and `email` from your `setUser()` calls whenever it suits you; your editor will flag them as deprecated.

The full list of changes is in the [changelog](https://github.com/segurudigital/stadiaref/blob/main/CHANGELOG.md).

## Assets

- `stadiaref.min.js`: the script-tag build
- `stadiaref-wp-v3.4.1.zip`: the WordPress plugin
- `seguru-debug-toolbar-wp-v2.5.1.zip`: the last Seguru Debug Toolbar release, for sites still on 2.x
