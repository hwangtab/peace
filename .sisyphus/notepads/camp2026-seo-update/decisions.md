# Decisions

## [2026-03-18] Architecture decisions

### pageContext prop approach
- Add `pageContext?: 'album' | 'camp'` to MusicianDetailContent
- Camp route passes `pageContext="camp"`, album route unchanged
- SEO title/description/keywords change only when pageContext === 'camp'

### Image localization strategy
- All external URLs → /images-webp/musicians/{id}.webp
- IDs 27, 54, 59: files already exist in musicians/ folder, just need data pointer fix
- ID 36: needs copy from camps/2025/DSC00723.webp
- IDs 17,20,25,30,31,32,33,34,39,42,44,45,48,50,52,55,56,58: need download

### SEO suffix translation key
- Key: camp.seo_musician_suffix
- KO: "2026년 6월 5-7일 제주 강정체육공원에서 열리는 제3회 강정피스앤뮤직캠프에 출연합니다."
- EN: "Performing at the 3rd Gangjeong Peace & Music Camp, June 5-7, 2026 at Gangjeong Sports Park, Jeju."

## [2026-03-18] Task 4 implementation decisions

### Camp-only SEO split in shared component
- Title rule when `pageContext === 'camp'`: `${musician.name} — ${t('camp.title_2026')} | ${t('nav.logo')}`
- Description rule when `pageContext === 'camp'`: `${musician.shortDescription} ${t('camp.seo_musician_suffix')}`
- Keywords rule when `pageContext === 'camp'`: 기존 키워드 뒤에 `강정피스앤뮤직캠프, 2026, 강정마을, 평화음악축제` 추가
- Default branch (`undefined` or `'album'`)는 기존 SEO 계산식을 그대로 유지

### Route wiring
- `/pages/camps/2026/musicians/[id].tsx`만 `pageContext="camp"` 전달
- `/pages/album/musicians/[id].tsx`는 수정하지 않고 기존 동작 보존
