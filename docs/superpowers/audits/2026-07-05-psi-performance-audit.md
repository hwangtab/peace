# PSI/Core Web Vitals 성능 감사·최적화 보고서

날짜: 2026-07-05 · 오케스트레이션: Fable(진단·설계·검증) / 구현: Opus(F1·F2)·Sonnet(F3)
측정: 로컬 Lighthouse 12 모바일 에뮬레이션(슬로우 4G 시뮬레이션) — PSI API 일일 쿼터 소진으로
동등한 랩 데이터를 로컬 수집. CrUX 필드 데이터는 API 키 부재로 미수집(하단 후속 제안 참조).

## 기준선 (6페이지 모바일)

| 페이지 | 점수 | FCP | LCP | 특징 |
|---|---|---|---|---|
| / | 59 | 4.9s | 10.8s | LCP=h1 텍스트, Render Delay 10.2s |
| /gallery | 46 | 4.8s | 12.7s | TBT 560ms |
| /videos | 55 | 8.8s | 14.8s | HTML 590KB (145카드 전체 SSR) |
| /videos/1 | 60 | 5.3s | 12.6s | |
| /camps/2026 | 55 | 6.4s | 14.0s | LCP 이미지 Load Delay 1.4s |
| /album/tracks | 51 | 4.9s | 12.2s | |

공통 프로파일: TBT·CLS는 우수(JS 실행·레이아웃 문제 아님), **네트워크 임계 체인이 병목**.

## 근본원인 3개와 처방

### F1. 폰트 임계경로 (Opus + Fable 후속)
- 진단: 홈 LCP h1(`font-partial`)의 PartialSans(116KB)가 preload 없이 페이지당 1.5MB 폰트와
  대역 경쟁 → 스왑 페인트가 LCP를 10초대로 지연. 이후 재측정에서 preload된 Serif KR
  Bold(508KB)가 이미지 히어로 페이지들의 LCP Load Delay(7~9s)의 주범임도 확인.
- 처방: ① PartialSans를 실사용 글리프 전용 재서브셋(1089→965 글리프, 115→103KB — 수집기가
  코드 주석·CMS 본문을 제외하도록 개선) ② high preload를 밴드 최우선으로 ③ Serif KR Bold
  preload 제거(fold 아래 typo-h2/h3용이라 임계 아님). 커밋 90f41539, 629858d2.

### F2. /videos SSR 비대 (Opus)
- 진단: 145개 카드(유튜브 썸네일 img·srcset) 전체 SSR → HTML 590KB → FCP 8.8s.
- 처방: 갤러리의 sentinel+IntersectionObserver 점진 렌더 패턴 이식 — 첫 12개만 카드 SSR,
  나머지는 초경량 텍스트 링크로 SSR(145개 상세 링크 크롤러 보존, CSS 숨김 없음) 후 스크롤
  도달 시 카드 승격. **HTML 590KB → 195KB (-67%)**. 커밋 e12f9b54.

### F3. LCP 이미지 priority 정합 (Sonnet)
- 진단: camps/2026 포스터는 모바일 실측상 fold 밖(360×640에서 완전히 밖) — priority 추가는
  오히려 손해로 판정. 대신 fold 한참 아래 CampGallery 첫 3장에 잘못 걸린 priority 발견.
- 처방: CampGallery priority 제거(lazy 통일), 포스터 sizes를 실제 컨테이너 폭으로 정정.
  커밋 8171d3a0.

## 결과 (배포 후 재측정)

| 페이지 | 기준선 | 최종 | 비고 |
|---|---|---|---|
| /videos | 55 / FCP 8.8s / LCP 14.8s | **62~69 / 3.2~5.1s / 9.2~10.4s** | 구조 개선 확정적 |
| /gallery | 46 / LCP 12.7s | 48 / LCP 9.8s | |
| / | 59 / FCP 4.9s / LCP 10.8s | **58~78** (4회 반복: 78·63·59·58) | 아래 변동성 참조 |
| /camps/2026 | 55 | 56~61 | |

**측정 변동성 주의**: 로컬 랩 측정은 Vercel 엣지 캐시 상태에 따라 이봉분포를 보인다 — 웜
캐시면 홈 78점/FCP 1.7s/LCP 5.2s, 콜드면 58점/7.0s/10.9s. 기준선도 단일 실행이므로 점수
델타는 지표적 참고치다. 반면 **구조 지표는 확정적**: HTML -395KB(-67%), 임계 폰트 밴드
-508KB, LCP 폰트 -11%+최우선 preload. 실사용자 다수는 웜 캐시를 만나므로 체감은 상단 값에
가깝다.

## 다음 라운드 후보 (이번 스코프 밖)

1. **CrUX 필드 데이터 확보** — PageSpeed API 키를 만들어(`console.cloud.google.com/apis/credentials`)
   `~/.toprank/.env`에 `PAGESPEED_API_KEY`로 저장하면 실사용자 CWV(구글 랭킹 신호의 실제
   근거)를 추적 가능. 랩 변동성 문제도 해소.
2. **폰트 총량 구조 개선** — ko 페이지 즉시 로드 폰트가 여전히 ~1.4MB(SansKR 4웨이트+Serif).
   웨이트 다이어트(500/600을 400/700에 alias) 또는 구글폰트식 슬라이스 서브셋은 디자인
   영향이 있어 별도 결정 필요.
3. **camp2026 잔여** — LCP 13.7s로 개선폭 최소. 페이지 구성(히어로+포스터+타임테이블)이
   무거워 별도 심층 라운드 권장.
4. **fonts:verify CI 연동** — 서브셋 회귀 방지 검증이 수동 실행 전용. CI에 Python 셋업과
   함께 물리는 것 제안(F1 에이전트 조사 결과).
