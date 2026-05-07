#!/usr/bin/env python3
"""Add descriptive image alt-text translation keys across 13 locales.

Why:
- Google SEO Starter Guide: "Writing good alt text is quite important." Generic
  alts like the camp's title alone or keyword-stuffed templates underperform
  descriptive alts that explain what the image actually shows.
- Existing alt for the 2026 poster was just `t('camp.title_2026')`; the hero
  background was `camp.title`; the gallery was `${year} ${title} ${seo_keywords} ${index+1}`
  (lightly keyword-stuffy).

What this changes (translation.json default namespace):
- `camp.poster_alt_2026`: descriptive alt for the 2026 poster image.
- `camp.hero_alt`: per-year hero performance scene alt template.

CampGallery is already migrated in code to use the existing `gallery.alt_camp`
key, which is locale-aware and non-stuffy (no script change needed for it).

Run: `python3 scripts/seo/apply-image-alt-text.py`
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict

ROOT = Path('/Users/hwang-gyeongha/peace/public/locales')

UPDATES: Dict[str, Dict[str, str]] = {
    'ko': {
        'camp.poster_alt_2026': '제3회 강정피스앤뮤직캠프 2026 공식 포스터 — 6월 5–7일 제주 강정마을, 51팀 라인업',
        'camp.hero_alt': '{{year}}년 강정피스앤뮤직캠프 공연 현장 사진',
    },
    'en': {
        'camp.poster_alt_2026': 'Official poster of the 3rd Gangjeong Peace Music Camp 2026 — June 5–7, Gangjeong Village, Jeju Island, 51 acts',
        'camp.hero_alt': '{{year}} Gangjeong Peace Music Camp performance scene',
    },
    'ja': {
        'camp.poster_alt_2026': '第3回カンジョン平和音楽キャンプ2026 公式ポスター — 6月5–7日、済州カンジョン村、51組出演',
        'camp.hero_alt': '{{year}}年 カンジョン平和音楽キャンプの公演風景',
    },
    'zh-Hans': {
        'camp.poster_alt_2026': '第三届江汀和平音乐营 2026 官方海报 — 6月5–7日，韩国济州江汀村，51组演出',
        'camp.hero_alt': '{{year}}年江汀和平音乐营演出现场',
    },
    'zh-Hant': {
        'camp.poster_alt_2026': '第三屆江汀和平音樂營 2026 官方海報 — 6月5–7日，韓國濟州江汀村，51組演出',
        'camp.hero_alt': '{{year}}年江汀和平音樂營演出現場',
    },
    'es': {
        'camp.poster_alt_2026': 'Cartel oficial del 3.º Gangjeong Peace Music Camp 2026 — del 5 al 7 de junio, aldea de Gangjeong, Jeju, 51 grupos',
        'camp.hero_alt': 'Concierto del Gangjeong Peace Music Camp {{year}}',
    },
    'fr': {
        'camp.poster_alt_2026': 'Affiche officielle du 3e Gangjeong Peace Music Camp 2026 — du 5 au 7 juin, village de Gangjeong, île de Jeju, 51 groupes',
        'camp.hero_alt': 'Concert du Gangjeong Peace Music Camp {{year}}',
    },
    'de': {
        'camp.poster_alt_2026': 'Offizielles Plakat des 3. Gangjeong Peace Music Camp 2026 — 5.–7. Juni, Dorf Gangjeong, Insel Jeju, 51 Acts',
        'camp.hero_alt': 'Auftritt beim Gangjeong Peace Music Camp {{year}}',
    },
    'pt': {
        'camp.poster_alt_2026': 'Cartaz oficial do 3.º Gangjeong Peace Music Camp 2026 — 5–7 de junho, aldeia de Gangjeong, Jeju, 51 grupos',
        'camp.hero_alt': 'Concerto no Gangjeong Peace Music Camp {{year}}',
    },
    'ru': {
        'camp.poster_alt_2026': 'Официальный постер 3-го Gangjeong Peace Music Camp 2026 — 5–7 июня, деревня Канджон, остров Чеджу, 51 коллектив',
        'camp.hero_alt': 'Концерт Gangjeong Peace Music Camp {{year}}',
    },
    'id': {
        'camp.poster_alt_2026': 'Poster resmi Gangjeong Peace Music Camp ke-3 2026 — 5–7 Juni, Desa Gangjeong, Pulau Jeju, 51 grup',
        'camp.hero_alt': 'Penampilan di Gangjeong Peace Music Camp {{year}}',
    },
    'ar': {
        'camp.poster_alt_2026': 'الملصق الرسمي لمخيم كانغجونغ للسلام والموسيقى الثالث 2026 — 5–7 يونيو، قرية كانغجونغ، جزيرة جيجو، 51 فرقة',
        'camp.hero_alt': 'حفل في مخيم كانغجونغ للسلام والموسيقى {{year}}',
    },
    'hi': {
        'camp.poster_alt_2026': 'तीसरा गांगजोंग शांति संगीत शिविर 2026 का आधिकारिक पोस्टर — 5–7 जून, गांगजोंग गाँव, जेजू द्वीप, 51 समूह',
        'camp.hero_alt': '{{year}} गांगजोंग शांति संगीत शिविर का प्रदर्शन',
    },
}


def set_dotted(obj: dict, dotted: str, value: str) -> None:
    parts = dotted.split('.')
    cursor = obj
    for part in parts[:-1]:
        if part not in cursor or not isinstance(cursor[part], dict):
            cursor[part] = {}
        cursor = cursor[part]
    cursor[parts[-1]] = value


def main() -> None:
    for locale, fields in UPDATES.items():
        path = ROOT / locale / 'translation.json'
        with path.open('r', encoding='utf-8') as fp:
            data = json.load(fp)
        for dotted, value in fields.items():
            set_dotted(data, dotted, value)
        with path.open('w', encoding='utf-8') as fp:
            json.dump(data, fp, ensure_ascii=False, indent=2)
            fp.write('\n')
        with path.open('r', encoding='utf-8') as fp:
            json.load(fp)
        print(f'updated {locale}')


if __name__ == '__main__':
    main()
