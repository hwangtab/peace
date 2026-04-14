# Issues

## [2026-03-18] Known issues

### SEOHelmet getFullUrl() bug
- External imageUrl → getFullUrl() prepends domain → double URL (e.g., https://peaceandmusic.nethttps://bugsm.co.kr/...)
- Resolution: localizing all images fixes this automatically

### IDs 27, 54, 59 — files exist but data points to camps/ path
- musicians/27.webp EXISTS but musicians.ts still has /images-webp/camps/2026/sight.jpeg
- musicians/54.webp EXISTS but musicians.ts still has camps path
- musicians/59.webp EXISTS but musicians.ts still has camps path
- Task 3 must update these pointers even though files already exist

### ID 36 — file does NOT exist yet
- musicians/36.webp does NOT exist
- Task 2 must copy from camps/2025/DSC00723.webp → musicians/36.webp

## [2026-03-18] Task 4 verification caveat

### JSON LSP diagnostics unavailable in current environment
- `lsp_diagnostics` for `translation.json` files failed because configured `biome` LSP is not installed (`Command not found: biome`).
- Type safety was still validated with `npx tsc --noEmit` (PASS, 0 errors), and TSX changed files had clean LSP diagnostics.

## [2026-03-18] Task 3 verification note

### JSON diagnostics still blocked
- `public/data/musicians.json` also cannot be checked with `lsp_diagnostics` until `biome` is installed.
- For this task, JSON validity was covered by `node` require-based verification and a full `npm run build` pass instead.
