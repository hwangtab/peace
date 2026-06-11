# peace

강정 피스앤뮤직캠프 공식 아카이브/홍보 사이트입니다. 운영 도메인은
[peaceandmusic.net](https://peaceandmusic.net)이며, Next.js pages router 기반으로 정적/ISR
페이지와 다국어 콘텐츠를 제공합니다.

## Stack

- Next.js 16, React 18, TypeScript 5
- Tailwind CSS, framer-motion
- next-i18next, 13 locales
- Jest, Testing Library
- next-sitemap, JSON-LD structured data

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm test --runInBand
pnpm i18n:check
pnpm audit
pnpm build
pnpm start
```

`pnpm build` runs `next build` and then `next-sitemap`. Production preview uses
`pnpm start` after a successful build.

## Content And Data

- Static data lives under `public/data/*.json`.
- Translations live under `public/locales/<locale>/*.json`.
- Camp 2026 timetable source is `docs/2026캠프 운영/timetable_v7.xlsx`.
- Regenerate timetable data with `pnpm build:timetable`.
- Private guide/staff/survey surfaces are `noIndex` and excluded from sitemap generation.

## Quality Gates

Before shipping, run:

```bash
pnpm format:check
pnpm lint
pnpm test --runInBand
pnpm i18n:check
pnpm audit
pnpm build
```

These gates are mirrored in `.github/workflows/ci.yml`.
