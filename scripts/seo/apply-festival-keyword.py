#!/usr/bin/env python3
"""Inject "music festival" search-intent keywords across 13 locales for the 2026 camp page.

Why:
- The brand name "강정피스앤뮤직캠프" carries "캠프", not "페스티벌/축제/festival".
- Korean/global searchers looking for "제주 음악 페스티벌", "Jeju music festival" etc.
  were not landing on the camp page because that phrase was absent from title/description/H2.

What this changes:
1. `camp.seo_description_2026` — front-load a "Peace Music Festival in Jeju" phrase per locale.
2. `camp.section_overview_subtitle` — NEW key, a short locale-aware "festival" subtitle for the
   Overview SectionHeader on /camps/2026.

Run: `python3 scripts/seo/apply-festival-keyword.py`
Validation: each translation.json is `json.load`-ed after write.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict

ROOT = Path('/Users/hwang-gyeongha/peace/public/locales')

# Per-locale rewritten/added values. Keys are dotted paths into translation.json.
UPDATES: Dict[str, Dict[str, str]] = {
    'ko': {
        'camp.seo_description_2026': '제주 평화 음악 페스티벌 — 2026년 6월 5–7일 제주 강정마을에서 열리는 제3회 강정피스앤뮤직캠프. 3일간 50팀의 뮤지션이 평화와 연대를 노래합니다. 강정체육공원, 티켓 3만원.',
        'camp.section_overview_subtitle': '제주에서 열리는 평화 음악 페스티벌',
    },
    'en': {
        'camp.seo_description_2026': 'Jeju Peace Music Festival — The 3rd Gangjeong Peace and Music Camp, June 5–7, 2026 at Gangjeong Village, Jeju Island. 50 Korean indie acts across three days of peace music at Gangjeong Sports Park. Tickets ₩30,000.',
        'camp.section_overview_subtitle': "Jeju's peace music festival",
    },
    'ja': {
        'camp.seo_description_2026': '済州平和音楽フェスティバル — 第3回カンジョン平和音楽キャンプ、2026年6月5日〜7日、韓国済州島カンジョン村にて。50組の韓国インディーアーティストが3日間、平和の音楽を奏でます。チケット30,000ウォン。',
        'camp.section_overview_subtitle': '済州で開かれる平和音楽フェスティバル',
    },
    'zh-Hans': {
        'camp.seo_description_2026': '济州和平音乐节 — 第三届江汀和平音乐营，2026年6月5–7日在韩国济州岛江汀村举行。50组韩国独立音乐人，三天和平音乐演出。门票30,000韩元。',
        'camp.section_overview_subtitle': '济州岛的和平音乐节',
    },
    'zh-Hant': {
        'camp.seo_description_2026': '濟州和平音樂節 — 第三屆江汀和平音樂營，2026年6月5–7日在韓國濟州島江汀村舉行。50組韓國獨立音樂人，三天和平音樂演出。票券30,000韓元。',
        'camp.section_overview_subtitle': '濟州島的和平音樂節',
    },
    'es': {
        'camp.seo_description_2026': 'Festival de música por la paz en Jeju — El 3.º Gangjeong Peace and Music Camp, del 5 al 7 de junio de 2026 en la aldea de Gangjeong, Jeju. 50 grupos indie coreanos en tres días de música por la paz. Entradas ₩30.000 KRW.',
        'camp.section_overview_subtitle': 'Festival de música por la paz en Jeju',
    },
    'fr': {
        'camp.seo_description_2026': 'Festival de musique pour la paix à Jeju — Le 3e Gangjeong Peace and Music Camp, du 5 au 7 juin 2026 au village de Gangjeong, île de Jeju. 50 groupes indé coréens, trois jours de musique pour la paix. Billets ₩30 000 KRW.',
        'camp.section_overview_subtitle': 'Festival de musique pour la paix à Jeju',
    },
    'de': {
        'camp.seo_description_2026': 'Friedensmusikfestival auf Jeju — Das 3. Gangjeong Peace and Music Camp, 5.–7. Juni 2026 im Dorf Gangjeong, Insel Jeju. 50 koreanische Indie-Acts, drei Tage Friedensmusik. Tickets ₩30.000 KRW.',
        'camp.section_overview_subtitle': 'Friedensmusikfestival auf Jeju',
    },
    'pt': {
        'camp.seo_description_2026': 'Festival de música pela paz em Jeju — O 3.º Gangjeong Peace and Music Camp, 5–7 de junho de 2026, aldeia de Gangjeong, Jeju. 50 grupos indie coreanos em três dias de música pela paz. Ingressos ₩30.000 KRW.',
        'camp.section_overview_subtitle': 'Festival de música pela paz em Jeju',
    },
    'ru': {
        'camp.seo_description_2026': 'Фестиваль мирной музыки на Чеджу — 3-й Gangjeong Peace and Music Camp, 5–7 июня 2026, деревня Канджон, остров Чеджу. 50 корейских инди-коллективов, три дня музыки мира. Билеты ₩30 000 (KRW).',
        'camp.section_overview_subtitle': 'Фестиваль мирной музыки на Чеджу',
    },
    'id': {
        'camp.seo_description_2026': 'Festival musik perdamaian di Jeju — Gangjeong Peace and Music Camp ke-3, 5–7 Juni 2026 di Desa Gangjeong, Pulau Jeju. 50 grup indie Korea, tiga hari musik perdamaian. Tiket ₩30.000 KRW.',
        'camp.section_overview_subtitle': 'Festival musik perdamaian di Jeju',
    },
    'ar': {
        'camp.seo_description_2026': 'مهرجان موسيقى السلام في جيجو — مخيم كانغجونغ للسلام والموسيقى الثالث، 5–7 يونيو 2026 في قرية كانغجونغ بجزيرة جيجو. 50 فرقة كورية مستقلّة في ثلاثة أيام من موسيقى السلام. التذاكر بـ30,000 وون (KRW).',
        'camp.section_overview_subtitle': 'مهرجان موسيقى السلام في جيجو',
    },
    'hi': {
        'camp.seo_description_2026': 'जेजू शांति संगीत महोत्सव — तीसरा गांगजोंग शांति और संगीत शिविर, 5–7 जून 2026, गांगजोंग गाँव, जेजू द्वीप। 50 कोरियाई इंडी समूह, तीन दिनों की शांति संगीत प्रस्तुति। टिकट ₩30,000 KRW।',
        'camp.section_overview_subtitle': 'जेजू में शांति संगीत महोत्सव',
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
        # Validate roundtrip
        with path.open('r', encoding='utf-8') as fp:
            json.load(fp)
        print(f'updated {locale}')


if __name__ == '__main__':
    main()
