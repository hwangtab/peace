#!/usr/bin/env python3
"""Fill missing FAQ items 6–15 in zh-Hans/faqs.json + fix outdated item 3.

Why:
- zh-Hans 만 items 6 개 (다른 12 로케일은 16). i18next fallbackLng=ko 비활성화
  전제 조건으로 13 로케일 키 parity 확보가 필요.
- items[3] (장르/라인업 답변) 도 구버전 "50–60组/32组" 으로 남아있어 50팀 기준으로 수정.

Run: `python3 scripts/seo/fix-zh-hans-faqs.py`
"""
from __future__ import annotations

import json
from pathlib import Path

PATH = Path('/Users/hwang-gyeongha/peace/public/locales/zh-Hans/faqs.json')

# items 6–15: Korean canonical 을 simplified Chinese 로 번역
NEW_ITEMS_6_15 = [
    {
        'q': '江汀村在哪里？怎么去？',
        'a': '江汀村位于济州岛西归浦市南海岸。从济州机场可乘公交（约90分钟）、出租车（约60分钟）或租车前往。从西归浦市内出发约15分钟。',
    },
    {
        'q': '可以住宿或露营吗？',
        'a': '营地内没有专门的住宿设施，但江汀村及西归浦市附近有民宿、宾馆、酒店等多种选择。建议提前预订住宿。',
    },
    {
        'q': '儿童可以参加吗？',
        'a': '是的，江汀和平音乐营是全家可以一起享受的户外节庆。儿童入场详情请查看官方预订页面。',
    },
    {
        'q': '怎样作为志愿者参与？',
        'a': '有意担任志愿者的朋友请通过Instagram（@peace_music_in_gangjeong）私信，或发送邮件至gpmc0625@gmail.com咨询。',
    },
    {
        'q': '6月济州的天气怎么样？',
        'a': '6月的济州处于梅雨季前夕，平均气温20~25度，气候温暖。可能会有阵雨，建议准备雨衣或雨伞。',
    },
    {
        'q': '在哪里可以购买专辑？',
        'a': '《To You in a Distant Place Whose Name I Don\'t Know》专辑可在Naver智能商店（smartstore.naver.com/peaceandmusic）购买。',
    },
    {
        'q': '我想了解江汀村的和平运动历史。',
        'a': '江汀村自2007年决定建设海军基地以来，约20年间一直是和平运动的象征。2012年联合国教科文组织生物圈保护区的구럼비岩石被爆破，村庄于2015年获得了Sean MacBride国际和平奖。村民们已坚持每天和平祈祷7000多天。',
    },
    {
        'q': '我想以音乐人身份申请演出。',
        'a': '希望参演的音乐人请通过Instagram（@peace_music_in_gangjeong）或邮件（gpmc0625@gmail.com）联系。策划团队审核后会与您联系。',
    },
    {
        'q': '残障人士可以参加吗？',
        'a': '江汀和平音乐营努力让所有人都能参加。由于户外活动场地的特性，行动可能受限，请提前发邮件至gpmc0625@gmail.com咨询，我们将尽力提供支持。',
    },
    {
        'q': '我想支持音乐营。',
        'a': '购票是对音乐营最直接的支持。此外，在Naver智能商店购买周边商品或音乐专辑也对营地的持续举办有很大帮助。',
    },
]


def main() -> None:
    with PATH.open('r', encoding='utf-8') as fp:
        data = json.load(fp)

    items = data.get('items', [])
    assert len(items) >= 6, f'expected ≥6 base items, got {len(items)}'

    # items[3] (장르/라인업) 구버전 수정 — 51팀 기준
    items[3]['a'] = '摇滚、民谣、爵士、电子等多种流派的音乐人将参加。2026年音乐营已确认50组音乐人参演。'

    # items 6–15 추가 (idempotent: 이미 존재하면 덮어쓰기)
    while len(items) < 6 + len(NEW_ITEMS_6_15):
        items.append({})
    for i, new in enumerate(NEW_ITEMS_6_15):
        items[6 + i] = new

    data['items'] = items[:16]  # 16개로 트림

    with PATH.open('w', encoding='utf-8') as fp:
        json.dump(data, fp, ensure_ascii=False, indent=2)
        fp.write('\n')

    # validate
    with PATH.open('r', encoding='utf-8') as fp:
        reloaded = json.load(fp)
    assert len(reloaded['items']) == 16
    print(f'updated zh-Hans/faqs.json — {len(reloaded["items"])} items, items[3] 50팀 기준 갱신')


if __name__ == '__main__':
    main()
