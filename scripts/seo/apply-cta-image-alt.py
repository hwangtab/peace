#!/usr/bin/env python3
"""Add `camp.cta_final_image_alt` translation key across 13 locales.

Why:
- The Final CTA background image was a CSS `background-image`, invisible to
  Google Image Search. We migrated it to <Image> with proper alt. The alt
  describes the symbolic candle / "End the war" night scene that recurs
  across the camp series.

Run: `python3 scripts/seo/apply-cta-image-alt.py`
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict

ROOT = Path('/Users/hwang-gyeongha/peace/public/locales')

UPDATES: Dict[str, Dict[str, str]] = {
    'ko': {
        'camp.cta_final_image_alt': '강정피스앤뮤직캠프 야간 — 평화의 촛불과 "전쟁을 끝내자" 메시지',
    },
    'en': {
        'camp.cta_final_image_alt': 'Gangjeong Peace Music Camp at night — peace candles with the message "End the war"',
    },
    'ja': {
        'camp.cta_final_image_alt': 'カンジョン平和音楽キャンプの夜 — 平和の灯火と「戦争を終わらせよう」のメッセージ',
    },
    'zh-Hans': {
        'camp.cta_final_image_alt': '江汀和平音乐营夜晚 — 和平烛光与"结束战争"的讯息',
    },
    'zh-Hant': {
        'camp.cta_final_image_alt': '江汀和平音樂營夜晚 — 和平燭光與「結束戰爭」的訊息',
    },
    'es': {
        'camp.cta_final_image_alt': 'Gangjeong Peace Music Camp de noche — velas por la paz con el mensaje "Acabemos con la guerra"',
    },
    'fr': {
        'camp.cta_final_image_alt': 'Gangjeong Peace Music Camp la nuit — bougies de la paix portant le message « Finissons-en avec la guerre »',
    },
    'de': {
        'camp.cta_final_image_alt': 'Gangjeong Peace Music Camp bei Nacht — Friedenskerzen mit der Botschaft „Beendet den Krieg“',
    },
    'pt': {
        'camp.cta_final_image_alt': 'Gangjeong Peace Music Camp à noite — velas pela paz com a mensagem "Acabemos com a guerra"',
    },
    'ru': {
        'camp.cta_final_image_alt': 'Gangjeong Peace Music Camp ночью — свечи мира с посланием «Закончим войну»',
    },
    'id': {
        'camp.cta_final_image_alt': 'Malam di Gangjeong Peace Music Camp — lilin perdamaian dengan pesan "Akhiri perang"',
    },
    'ar': {
        'camp.cta_final_image_alt': 'مخيم كانغجونغ للسلام والموسيقى ليلاً — شموع السلام برسالة «أنهوا الحرب»',
    },
    'hi': {
        'camp.cta_final_image_alt': 'गांगजोंग शांति संगीत शिविर की रात — शांति की मोमबत्तियाँ और "युद्ध समाप्त करो" का संदेश',
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
