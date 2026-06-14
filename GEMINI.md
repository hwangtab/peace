# Gemini Project Context — peace

## Overview

`peace` is the Next.js site for Gangjeong Peace Music Camp, published at
[peaceandmusic.net](https://peaceandmusic.net). It is an archive and campaign site with static/ISR
pages, 13-language i18n, structured SEO data, and a small private survey surface for Camp 2026.

## Tech Stack

- Next.js 16 pages router
- React 18 and TypeScript 5.7
- Tailwind CSS
- framer-motion
- next-i18next
- Jest and Testing Library
- next-sitemap

## Important Paths

- `pages/`: Next.js route files
- `src/pages/`: page-level React views
- `src/components/`: reusable UI and domain components
- `src/data/`: TypeScript data modules, including generated timetable data
- `public/data/`: static JSON data
- `public/locales/`: translation namespaces
- `scripts/`: build and maintenance scripts
- `docs/2026캠프 운영/timetable_v7.xlsx`: Camp 2026 timetable source of truth

## Commands

```bash
pnpm install
pnpm dev
pnpm format:check
pnpm lint
pnpm test --runInBand
pnpm i18n:check
pnpm audit
pnpm build
pnpm start
pnpm build:timetable
```

`pnpm build:timetable` regenerates `src/data/timetable-2026.ts` from the private timetable workbook and is local-only.
`pnpm build` runs `next build` and `next-sitemap`.

## Operating Notes

- Use `pnpm`, not npm.
- There is no Express backend and no Create React App build directory.
- The site is a Next.js app, not a React Router SPA.
- Private camp guide/staff/survey pages are `noIndex` and excluded from sitemap output.
- Keep translations at 100% key parity across locales; `pnpm i18n:check` is the gate.
- Do not edit generated timetable data by hand; regenerate from the workbook.
