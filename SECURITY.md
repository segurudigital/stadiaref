# Security

## Supported versions

| Version | Supported |
|---|---|
| 3.x | Yes |
| 2.x (Seguru Debug Toolbar) | No. Move to 3.x |

## Reporting a vulnerability

Please don't open a public issue.

Report it privately through GitHub's [private vulnerability reporting](https://github.com/segurudigital/stadiaref/security/advisories/new), or email [hello@seguru.digital](mailto:hello@seguru.digital). Include what you found, how to reproduce it, and what an attacker could do with it.

You'll get a reply within five working days. Once a fix is ready we'll agree a disclosure date with you and credit you in the release notes, unless you'd rather not be named.

## Scope

StadiaRef is a development and review tool. It runs in the browser of the person using it, stores nothing but the theme choice in local storage, and makes no network requests. The WordPress plugin loads it only for signed-in users with the role chosen in its settings, and checks GitHub for its own updates. Reports about any of these are in scope.
