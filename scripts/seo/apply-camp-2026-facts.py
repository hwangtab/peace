#!/usr/bin/env python3
"""Sync 2026 camp facts (51 acts, paid tickets via Tumblbug) across 13 locales.

Memory of record (camps.ts + Tumblbug page):
- 51 participating acts (NOT 54)
- Paid admission, ticketed via https://tumblbug.com/gpmc3 (NOT free)

This script rewrites the affected translation keys with locale-aware copy.
Run validation by `json.load`-ing each file after write.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Callable, Dict, List

ROOT = Path('/Users/hwang-gyeongha/peace/public/locales')
TUMBLBUG = 'tumblbug.com/gpmc3'
PRICE_KRW = 30000  # 1인 1일 기준 텀블벅 일반 티켓가

# Per-locale fully-rewritten values for the keys that mention act-count or admission policy.
# Keys are dotted paths into translation.json. List indices use [n] notation.
UPDATES: Dict[str, Dict[str, str]] = {
    # =======================================================================
    # KOREAN (canonical source of truth)
    # =======================================================================
    'ko': {
        'camp.description_2026': '2026년 6월 5일(금)부터 7일(일)까지, 제주 서귀포시 강정체육공원에서 제3회 강정피스앤뮤직캠프가 열립니다. 정전 73주년을 맞이하는 올해, 캠프는 처음으로 2박 3일 규모로 확대되어 51팀의 음악가가 참여합니다. 한반도의 군사기지화와 전쟁 위기가 심화되는 지금, 강정마을에서 시작된 평화의 노래는 더 크고 단단한 연대로 이어지고 있습니다. "노래하자, 춤추자, 전쟁을 끝내자!"라는 슬로건 아래, 다양한 장르의 뮤지션들이 음악으로 반전과 평화의 메시지를 전합니다. 티켓은 텀블벅(tumblbug.com/gpmc3)에서 판매 중입니다.',
        'camp.expected_2026': '음악가 51팀 출연 확정',
        'camp.seo_title_2026': '제3회 강정피스앤뮤직캠프 2026 · 6.5–7 · 제주 강정마을 · 51팀',
        'camp.seo_description_2026': '2026년 6월 5–7일 제주 강정마을에서 열리는 제3회 강정피스앤뮤직캠프. 3일간 51팀의 뮤지션이 평화와 연대를 노래합니다. 강정체육공원, 텀블벅 티켓 3만원(tumblbug.com/gpmc3).',
        'camp.timeline_2026_title': '제3회 캠프 (51팀)',
        'gangjeong_story.timeline_2026_title': '제3회 캠프 (51팀)',
        'camp_data.camp-2026.description': '2026년 6월 5일(금)부터 7일(일)까지, 제주 서귀포시 강정체육공원에서 제3회 강정피스앤뮤직캠프가 열립니다. 정전 73주년을 맞이하는 올해, 캠프는 처음으로 2박 3일 규모로 확대되어 51팀의 음악가가 참여합니다. 한반도의 군사기지화와 전쟁 위기가 심화되는 지금, 강정마을에서 시작된 평화의 노래는 더 크고 단단한 연대로 이어지고 있습니다. "노래하자, 춤추자, 전쟁을 끝내자!"라는 슬로건 아래, 다양한 장르의 뮤지션들이 음악으로 반전과 평화의 메시지를 전합니다. 티켓은 텀블벅(tumblbug.com/gpmc3)에서 판매 중입니다.',
        'structured_data.howto_step3_name': '텀블벅 티켓 예매',
        'structured_data.howto_step3_text': '텀블벅(tumblbug.com/gpmc3)에서 티켓을 예매하면 캠프 운영을 후원할 수 있습니다.',
        'structured_data.howto_step4_name': '강정체육공원 입장',
        'structured_data.howto_step4_text': '강정체육공원에 도착하여 예매한 티켓으로 입장합니다.',
        'camp_faq_2026.a1': '2026년 6월 5일(금)부터 7일(일)까지 3일간 강정마을에서 열립니다. 51팀의 뮤지션이 참여하는 평화음악 페스티벌입니다.',
        'camp_faq_2026.a3': '유료입니다. 티켓 3만원이며 텀블벅 크라우드펀딩(tumblbug.com/gpmc3)에서 판매 중입니다. 수익은 행사 운영과 평화 운동 연대에 사용됩니다.',
        'camp_faq_2026.a4': '텀블벅 크라우드펀딩(tumblbug.com/gpmc3)에서 티켓을 구매하면 캠프 운영을 직접 후원하는 효과가 있습니다. 추가 후원은 굿즈 구매 등으로 가능합니다.',
        'camp_faq_2026.a5': '51팀의 한국 인디 뮤지션이 참여합니다. 윤선애, 정진석, 최상돈, 김동산과 블루이웃, 임정득, 태히언, HANASH, TAGI 등 장르를 아우르는 평화음악가들이 무대에 섭니다.',
        'faqs.items[3].a': '록, 포크, 재즈, 일렉트로닉 등 다양한 장르의 뮤지션이 참여합니다. 2026년 캠프에는 51팀의 뮤지션이 출연 확정되었습니다.',
        'faqs.items[4].a': '강정피스앤뮤직캠프는 텀블벅(tumblbug.com/gpmc3)에서 티켓 3만원에 판매하는 유료 행사입니다. 수익은 행사 운영과 평화 연대 활동에 사용됩니다.',
        'faqs.items[8].a': '네, 강정피스앤뮤직캠프는 가족 모두가 함께할 수 있는 야외 축제입니다. 어린이 동반 입장 안내는 텀블벅(tumblbug.com/gpmc3) 티켓 페이지에서 확인하세요.',
    },

    # =======================================================================
    # ENGLISH
    # =======================================================================
    'en': {
        'camp.description_2026': 'The 3rd Gangjeong Peace Music Camp will be held from June 5 (Fri) to June 7 (Sun), 2026, at Gangjeong Sports Park in Seogwipo, Jeju. Marking the 73rd anniversary of the Korean War armistice, the camp expands for the first time into a 3-day, 2-night format with 51 acts. As militarization and the threat of war intensify on the Korean Peninsula, the song of peace that began in Gangjeong Village grows into a stronger and wider solidarity. Under the slogan "Let\'s sing, let\'s dance, end the war!", musicians from diverse genres deliver messages of peace and anti-war through music. Tickets are on sale at tumblbug.com/gpmc3.',
        'camp.expected_2026': '51 acts confirmed',
        'camp.seo_title_2026': '3rd Gangjeong Peace Music Camp 2026 · Jun 5–7 · Jeju · 51 Acts',
        'camp.seo_description_2026': 'The 3rd Gangjeong Peace and Music Camp — June 5–7, 2026 at Gangjeong Village, Jeju Island. 51 Korean indie acts across three days of peace music at Gangjeong Sports Park. Tickets ₩30,000 via Tumblbug (tumblbug.com/gpmc3).',
        'camp.timeline_2026_title': '3rd Camp (51 acts)',
        'gangjeong_story.timeline_2026_title': '3rd Camp (51 acts)',
        'camp_data.camp-2026.description': 'The 3rd Gangjeong Peace Music Camp will be held from June 5 (Fri) to June 7 (Sun), 2026, at Gangjeong Sports Park in Seogwipo, Jeju. Marking the 73rd anniversary of the Korean War armistice, the camp expands for the first time into a 3-day, 2-night format with 51 acts. As militarization and the threat of war intensify on the Korean Peninsula, the song of peace that began in Gangjeong Village grows into a stronger and wider solidarity. Under the slogan "Let\'s sing, let\'s dance, end the war!", musicians from diverse genres deliver messages of peace and anti-war through music. Tickets are on sale at tumblbug.com/gpmc3.',
        'structured_data.howto_step3_name': 'Get your Tumblbug ticket',
        'structured_data.howto_step3_text': 'Buy a ticket through Tumblbug crowdfunding (tumblbug.com/gpmc3); your purchase directly supports the camp.',
        'structured_data.howto_step4_name': 'Enter Gangjeong Sports Park',
        'structured_data.howto_step4_text': 'Arrive at Gangjeong Sports Park and enter with the Tumblbug ticket you purchased.',
        'camp_faq_2026.a1': 'June 5–7, 2026, a three-day peace music festival in Gangjeong Village with 51 acts.',
        'camp_faq_2026.a3': 'Yes — admission is ticketed. Tickets are ₩30,000 (KRW) via Tumblbug crowdfunding (tumblbug.com/gpmc3); proceeds fund the festival and peace solidarity work.',
        'camp_faq_2026.a4': 'Buying a ticket on Tumblbug (tumblbug.com/gpmc3) directly supports the camp. You can also help by buying merchandise on site.',
        'camp_faq_2026.a5': '51 Korean indie artists across genres including Yun Sunae, Jeong Jinseok, Choi Sangdon, Kim Dongsan & Blue Neighbors, Lim Jeongdeuk, Taehyeon, HANASH, and TAGI.',
        'faqs.items[3].a': 'Musicians from various genres such as rock, folk, jazz, and electronic will participate. In the 2026 camp, 51 acts have been confirmed to perform.',
        'faqs.items[4].a': 'The Gangjeong Peace and Music Camp is a ticketed festival; tickets are ₩30,000 (KRW) via Tumblbug (tumblbug.com/gpmc3). Proceeds fund the festival and peace solidarity work.',
        'faqs.items[8].a': 'Yes, the Gangjeong Peace and Music Camp is a family-friendly outdoor festival. For details on bringing children, see the Tumblbug ticket page (tumblbug.com/gpmc3).',
    },

    # =======================================================================
    # JAPANESE
    # =======================================================================
    'ja': {
        'camp.description_2026': '2026年6月5日（金）から7日（日）まで、済州島西帰浦市の江汀体育公園にて第3回江汀ピース＆ミュージックキャンプが開催されます。停戦73周年を迎える今年、キャンプは初めて2泊3日規模に拡大し、51組のミュージシャンが参加します。朝鮮半島の軍事基地化と戦争の危機が深まる今、江汀村から始まった平和の歌はより大きく確かな連帯へとつながっています。「歌おう、踊ろう、戦争を終わらせよう！」というスローガンのもと、多様なジャンルのミュージシャンが音楽で反戦と平和のメッセージを届けます。チケットはtumblbug.com/gpmc3で販売中です。',
        'camp.expected_2026': '51組の出演が確定',
        'camp.seo_title_2026': '第3回カンジョン平和音楽キャンプ 2026 · 6/5–7 · 済州 · 51組',
        'camp.seo_description_2026': '第3回カンジョン平和音楽キャンプ — 2026年6月5日〜7日、韓国済州島カンジョン村にて。51組の韓国インディーアーティストが3日間、平和の音楽を奏でます。チケット30,000ウォンはtumblbug.com/gpmc3で販売中。',
        'camp.timeline_2026_title': '第3回キャンプ（51組）',
        'gangjeong_story.timeline_2026_title': '第3回キャンプ（51組）',
        'camp_data.camp-2026.description': '2026年6月5日（金）から7日（日）まで、済州島西帰浦市の江汀体育公園にて第3回江汀ピース＆ミュージックキャンプが開催されます。停戦73周年を迎える今年、キャンプは初めて2泊3日規模に拡大し、51組のミュージシャンが参加します。朝鮮半島の軍事基地化と戦争の危機が深まる今、江汀村から始まった平和の歌はより大きく確かな連帯へとつながっています。「歌おう、踊ろう、戦争を終わらせよう！」というスローガンのもと、多様なジャンルのミュージシャンが音楽で反戦と平和のメッセージを届けます。チケットはtumblbug.com/gpmc3で販売中です。',
        'structured_data.howto_step3_name': 'tumblbugでチケットを購入',
        'structured_data.howto_step3_text': 'tumblbug.com/gpmc3のクラウドファンディングからチケットを購入することで、キャンプ運営を直接支援できます。',
        'structured_data.howto_step4_name': '江汀体育公園へ入場',
        'structured_data.howto_step4_text': '江汀体育公園に到着し、tumblbugで購入したチケットで入場します。',
        'camp_faq_2026.a1': '2026年6月5日から7日までの3日間、カンジョン村で開催される51組参加の平和音楽フェスティバルです。',
        'camp_faq_2026.a3': '有料です。チケットは30,000ウォンで、tumblbug.com/gpmc3のクラウドファンディングで販売されています。収益はフェスティバル運営と平和運動への連帯活動に使われます。',
        'camp_faq_2026.a4': 'tumblbug.com/gpmc3でチケットを購入することが、キャンプ運営への直接的な支援になります。会場でのグッズ購入もサポートになります。',
        'camp_faq_2026.a5': '51組の韓国インディーアーティスト。Yun Sunae、Jeong Jinseok、Choi Sangdon、Kim Dongsan & Blue Neighbors、Lim Jeongdeuk、Taehyeon、HANASH、TAGIなど多様なジャンル。',
        'faqs.items[3].a': 'ロック、フォーク、ジャズ、エレクトロニックなど多様なジャンルのミュージシャンが参加します。2026年キャンプでは51組のミュージシャンの出演が確定しています。',
        'faqs.items[4].a': '江汀ピース＆ミュージックキャンプはtumblbug.com/gpmc3でチケットを30,000ウォンで販売する有料イベントです。収益はフェスティバル運営と平和連帯活動に使われます。',
        'faqs.items[8].a': 'はい、江汀ピース＆ミュージックキャンプはご家族で楽しめる屋外フェスティバルです。お子様の入場についてはtumblbug.com/gpmc3のチケットページをご確認ください。',
    },

    # =======================================================================
    # SPANISH
    # =======================================================================
    'es': {
        'camp.description_2026': 'El 3.º Gangjeong Peace Music Camp se celebrará del 5 (vie.) al 7 (dom.) de junio de 2026 en el Parque Deportivo de Gangjeong, Seogwipo, Jeju. En el 73.º aniversario del armisticio de la Guerra de Corea, el campamento se amplía por primera vez a un formato de tres días y dos noches con 51 grupos. Mientras se intensifica la militarización y la amenaza de guerra en la península coreana, el canto de paz nacido en la aldea de Gangjeong se transforma en una solidaridad más fuerte y amplia. Bajo el lema "¡Cantemos, bailemos, acabemos con la guerra!", músicos de géneros diversos comparten mensajes de paz y antibelicismo. Las entradas están a la venta en tumblbug.com/gpmc3.',
        'camp.expected_2026': '51 grupos confirmados',
        'camp.seo_title_2026': '3.º Gangjeong Peace Music Camp 2026 · 5–7 jun · Jeju · 51 grupos',
        'camp.seo_description_2026': 'El 3.º Gangjeong Peace and Music Camp — del 5 al 7 de junio de 2026 en la aldea de Gangjeong, Jeju. 51 grupos indie coreanos en tres días de música por la paz. Entradas ₩30.000 KRW en Tumblbug (tumblbug.com/gpmc3).',
        'camp.timeline_2026_title': '3.º Camp (51 grupos)',
        'gangjeong_story.timeline_2026_title': '3.º Camp (51 grupos)',
        'camp_data.camp-2026.description': 'El 3.º Gangjeong Peace Music Camp se celebrará del 5 (vie.) al 7 (dom.) de junio de 2026 en el Parque Deportivo de Gangjeong, Seogwipo, Jeju. En el 73.º aniversario del armisticio de la Guerra de Corea, el campamento se amplía por primera vez a un formato de tres días y dos noches con 51 grupos. Mientras se intensifica la militarización y la amenaza de guerra en la península coreana, el canto de paz nacido en la aldea de Gangjeong se transforma en una solidaridad más fuerte y amplia. Bajo el lema "¡Cantemos, bailemos, acabemos con la guerra!", músicos de géneros diversos comparten mensajes de paz y antibelicismo. Las entradas están a la venta en tumblbug.com/gpmc3.',
        'structured_data.howto_step3_name': 'Compra tu entrada en Tumblbug',
        'structured_data.howto_step3_text': 'Compra una entrada mediante el crowdfunding en tumblbug.com/gpmc3; tu compra apoya directamente al campamento.',
        'structured_data.howto_step4_name': 'Entra al Parque Deportivo de Gangjeong',
        'structured_data.howto_step4_text': 'Llega al Parque Deportivo de Gangjeong y entra con la entrada de Tumblbug que compraste.',
        'camp_faq_2026.a1': 'Del 5 al 7 de junio de 2026, un festival de música por la paz de tres días en la aldea de Gangjeong con 51 grupos.',
        'camp_faq_2026.a3': 'Sí, hay entrada. Las entradas cuestan ₩30.000 KRW y se venden mediante el crowdfunding de Tumblbug (tumblbug.com/gpmc3); los ingresos sostienen el festival y el trabajo de solidaridad por la paz.',
        'camp_faq_2026.a4': 'Comprar una entrada en Tumblbug (tumblbug.com/gpmc3) apoya directamente al campamento. También puedes ayudar comprando merchandising en el lugar.',
        'camp_faq_2026.a5': '51 artistas indie coreanos de diversos géneros, incluyendo Yun Sunae, Jeong Jinseok, Choi Sangdon, Kim Dongsan & Blue Neighbors, Lim Jeongdeuk, Taehyeon, HANASH y TAGI.',
        'faqs.items[3].a': 'Participarán músicos de diversos géneros como rock, folk, jazz y electrónica. En el campamento de 2026, hay 51 grupos confirmados.',
        'faqs.items[4].a': 'El Gangjeong Peace and Music Camp es un festival con entrada de pago; las entradas cuestan ₩30.000 KRW y se venden en Tumblbug (tumblbug.com/gpmc3). Los ingresos financian el festival y el trabajo de solidaridad por la paz.',
        'faqs.items[8].a': 'Sí, el Gangjeong Peace and Music Camp es un festival al aire libre apto para familias. Para detalles sobre la entrada de menores, consulta la página de Tumblbug (tumblbug.com/gpmc3).',
    },

    # =======================================================================
    # FRENCH
    # =======================================================================
    'fr': {
        'camp.description_2026': 'Le 3e Gangjeong Peace Music Camp se tiendra du 5 (ven.) au 7 (dim.) juin 2026 au Parc sportif de Gangjeong, à Seogwipo, sur l\'île de Jeju. Pour le 73e anniversaire de l\'armistice de la guerre de Corée, le camp s\'étend pour la première fois sur trois jours et deux nuits avec 51 groupes. Alors que la militarisation et la menace de guerre s\'intensifient sur la péninsule coréenne, le chant de paix né au village de Gangjeong se mue en une solidarité plus forte et plus large. Sous le slogan « Chantons, dansons, mettons fin à la guerre ! », des musicien·ne·s de genres variés livrent des messages antimilitaristes et de paix. Les billets sont en vente sur tumblbug.com/gpmc3.',
        'camp.expected_2026': '51 groupes confirmés',
        'camp.seo_title_2026': '3e Gangjeong Peace Music Camp 2026 · 5–7 juin · Jeju · 51 groupes',
        'camp.seo_description_2026': 'Le 3e Gangjeong Peace and Music Camp — du 5 au 7 juin 2026 au village de Gangjeong, île de Jeju. 51 groupes indé coréens, trois jours de musique pour la paix. Billets ₩30 000 KRW sur Tumblbug (tumblbug.com/gpmc3).',
        'camp.timeline_2026_title': '3e Camp (51 groupes)',
        'gangjeong_story.timeline_2026_title': '3e Camp (51 groupes)',
        'camp_data.camp-2026.description': 'Le 3e Gangjeong Peace Music Camp se tiendra du 5 (ven.) au 7 (dim.) juin 2026 au Parc sportif de Gangjeong, à Seogwipo, sur l\'île de Jeju. Pour le 73e anniversaire de l\'armistice de la guerre de Corée, le camp s\'étend pour la première fois sur trois jours et deux nuits avec 51 groupes. Alors que la militarisation et la menace de guerre s\'intensifient sur la péninsule coréenne, le chant de paix né au village de Gangjeong se mue en une solidarité plus forte et plus large. Sous le slogan « Chantons, dansons, mettons fin à la guerre ! », des musicien·ne·s de genres variés livrent des messages antimilitaristes et de paix. Les billets sont en vente sur tumblbug.com/gpmc3.',
        'structured_data.howto_step3_name': 'Achetez votre billet sur Tumblbug',
        'structured_data.howto_step3_text': 'Achetez un billet via le financement participatif sur tumblbug.com/gpmc3 ; votre achat soutient directement le camp.',
        'structured_data.howto_step4_name': 'Entrez au Parc sportif de Gangjeong',
        'structured_data.howto_step4_text': 'Arrivez au Parc sportif de Gangjeong et entrez avec le billet Tumblbug que vous avez acheté.',
        'camp_faq_2026.a1': 'Du 5 au 7 juin 2026, un festival de musique pour la paix de trois jours dans le village de Gangjeong avec 51 groupes.',
        'camp_faq_2026.a3': 'Oui, l\'entrée est payante. Les billets coûtent ₩30 000 KRW et sont vendus via le financement participatif Tumblbug (tumblbug.com/gpmc3) ; les recettes financent le festival et le travail de solidarité pour la paix.',
        'camp_faq_2026.a4': 'Acheter un billet sur Tumblbug (tumblbug.com/gpmc3) soutient directement le camp. Vous pouvez aussi aider en achetant des produits dérivés sur place.',
        'camp_faq_2026.a5': '51 artistes indé coréens de divers genres, dont Yun Sunae, Jeong Jinseok, Choi Sangdon, Kim Dongsan & Blue Neighbors, Lim Jeongdeuk, Taehyeon, HANASH et TAGI.',
        'faqs.items[3].a': 'Des musicien·ne·s de divers genres — rock, folk, jazz, électronique — participeront. Pour le camp 2026, 51 groupes sont confirmés.',
        'faqs.items[4].a': 'Le Gangjeong Peace and Music Camp est un festival payant ; les billets coûtent ₩30 000 KRW et sont vendus sur Tumblbug (tumblbug.com/gpmc3). Les recettes financent le festival et la solidarité pour la paix.',
        'faqs.items[8].a': 'Oui, le Gangjeong Peace and Music Camp est un festival en plein air ouvert aux familles. Pour les modalités d\'entrée des enfants, consultez la page Tumblbug (tumblbug.com/gpmc3).',
    },

    # =======================================================================
    # GERMAN
    # =======================================================================
    'de': {
        'camp.description_2026': 'Das 3. Gangjeong Peace Music Camp findet vom 5. (Fr.) bis 7. (So.) Juni 2026 im Gangjeong Sports Park in Seogwipo, Jeju, statt. Zum 73. Jahrestag des Waffenstillstands im Koreakrieg erweitert sich das Camp erstmals auf ein Drei-Tage-, Zwei-Nächte-Format mit 51 Acts. Während Militarisierung und Kriegsgefahr auf der koreanischen Halbinsel zunehmen, wächst das im Dorf Gangjeong begonnene Friedenslied zu einer stärkeren, umfassenderen Solidarität. Unter dem Motto „Singen wir, tanzen wir, beenden wir den Krieg!" tragen Musiker:innen verschiedener Genres Friedens- und Antikriegsbotschaften vor. Tickets gibt es auf tumblbug.com/gpmc3.',
        'camp.expected_2026': '51 Acts bestätigt',
        'camp.seo_title_2026': '3. Gangjeong Peace Music Camp 2026 · 5.–7. Juni · Jeju · 51 Acts',
        'camp.seo_description_2026': 'Das 3. Gangjeong Peace and Music Camp — 5.–7. Juni 2026 im Dorf Gangjeong, Insel Jeju. 51 koreanische Indie-Acts, drei Tage Friedensmusik. Tickets ₩30.000 KRW bei Tumblbug (tumblbug.com/gpmc3).',
        'camp.timeline_2026_title': '3. Camp (51 Acts)',
        'gangjeong_story.timeline_2026_title': '3. Camp (51 Acts)',
        'camp_data.camp-2026.description': 'Das 3. Gangjeong Peace Music Camp findet vom 5. (Fr.) bis 7. (So.) Juni 2026 im Gangjeong Sports Park in Seogwipo, Jeju, statt. Zum 73. Jahrestag des Waffenstillstands im Koreakrieg erweitert sich das Camp erstmals auf ein Drei-Tage-, Zwei-Nächte-Format mit 51 Acts. Während Militarisierung und Kriegsgefahr auf der koreanischen Halbinsel zunehmen, wächst das im Dorf Gangjeong begonnene Friedenslied zu einer stärkeren, umfassenderen Solidarität. Unter dem Motto „Singen wir, tanzen wir, beenden wir den Krieg!" tragen Musiker:innen verschiedener Genres Friedens- und Antikriegsbotschaften vor. Tickets gibt es auf tumblbug.com/gpmc3.',
        'structured_data.howto_step3_name': 'Tumblbug-Ticket kaufen',
        'structured_data.howto_step3_text': 'Kaufe ein Ticket über das Crowdfunding auf tumblbug.com/gpmc3 — dein Kauf unterstützt das Camp direkt.',
        'structured_data.howto_step4_name': 'Eintritt in den Gangjeong Sports Park',
        'structured_data.howto_step4_text': 'Komm zum Gangjeong Sports Park und betritt das Gelände mit deinem Tumblbug-Ticket.',
        'camp_faq_2026.a1': 'Vom 5. bis 7. Juni 2026, ein dreitägiges Friedensmusikfestival im Dorf Gangjeong mit 51 Acts.',
        'camp_faq_2026.a3': 'Ja — der Eintritt ist kostenpflichtig. Tickets kosten ₩30.000 KRW und werden über das Tumblbug-Crowdfunding (tumblbug.com/gpmc3) verkauft; die Erlöse finanzieren das Festival und die Friedensarbeit.',
        'camp_faq_2026.a4': 'Mit dem Kauf eines Tickets auf Tumblbug (tumblbug.com/gpmc3) unterstützt du das Camp direkt. Vor Ort kannst du zusätzlich Merchandise kaufen.',
        'camp_faq_2026.a5': '51 koreanische Indie-Acts verschiedener Genres, darunter Yun Sunae, Jeong Jinseok, Choi Sangdon, Kim Dongsan & Blue Neighbors, Lim Jeongdeuk, Taehyeon, HANASH und TAGI.',
        'faqs.items[3].a': 'Musiker:innen verschiedener Genres wie Rock, Folk, Jazz und Elektronik nehmen teil. Für das Camp 2026 sind 51 Acts bestätigt.',
        'faqs.items[4].a': 'Das Gangjeong Peace and Music Camp ist ein ticketpflichtiges Festival; Tickets kosten ₩30.000 KRW und werden über Tumblbug (tumblbug.com/gpmc3) verkauft. Die Erlöse finanzieren das Festival und die Friedensarbeit.',
        'faqs.items[8].a': 'Ja, das Gangjeong Peace and Music Camp ist ein familienfreundliches Open-Air-Festival. Hinweise zum Eintritt mit Kindern findest du auf der Tumblbug-Ticketseite (tumblbug.com/gpmc3).',
    },

    # =======================================================================
    # PORTUGUESE
    # =======================================================================
    'pt': {
        'camp.description_2026': 'O 3.º Gangjeong Peace Music Camp acontece de 5 (sex.) a 7 (dom.) de junho de 2026, no Parque Esportivo de Gangjeong, em Seogwipo, Jeju. No 73.º aniversário do armistício da Guerra da Coreia, o acampamento se expande pela primeira vez para um formato de três dias e duas noites com 51 grupos. Enquanto a militarização e a ameaça de guerra se intensificam na península coreana, o canto pela paz que começou na aldeia de Gangjeong se transforma em uma solidariedade mais forte e ampla. Sob o lema "Cantemos, dancemos, acabemos com a guerra!", músicos de gêneros diversos entregam mensagens pela paz e contra a guerra. Ingressos à venda em tumblbug.com/gpmc3.',
        'camp.expected_2026': '51 grupos confirmados',
        'camp.seo_title_2026': '3.º Gangjeong Peace Music Camp 2026 · 5–7 jun · Jeju · 51 grupos',
        'camp.seo_description_2026': 'O 3.º Gangjeong Peace and Music Camp — 5–7 de junho de 2026, aldeia de Gangjeong, Jeju. 51 grupos indie coreanos em três dias de música pela paz. Ingressos ₩30.000 KRW no Tumblbug (tumblbug.com/gpmc3).',
        'camp.timeline_2026_title': '3.º Camp (51 grupos)',
        'gangjeong_story.timeline_2026_title': '3.º Camp (51 grupos)',
        'camp_data.camp-2026.description': 'O 3.º Gangjeong Peace Music Camp acontece de 5 (sex.) a 7 (dom.) de junho de 2026, no Parque Esportivo de Gangjeong, em Seogwipo, Jeju. No 73.º aniversário do armistício da Guerra da Coreia, o acampamento se expande pela primeira vez para um formato de três dias e duas noites com 51 grupos. Enquanto a militarização e a ameaça de guerra se intensificam na península coreana, o canto pela paz que começou na aldeia de Gangjeong se transforma em uma solidariedade mais forte e ampla. Sob o lema "Cantemos, dancemos, acabemos com a guerra!", músicos de gêneros diversos entregam mensagens pela paz e contra a guerra. Ingressos à venda em tumblbug.com/gpmc3.',
        'structured_data.howto_step3_name': 'Compre seu ingresso no Tumblbug',
        'structured_data.howto_step3_text': 'Compre um ingresso pelo crowdfunding em tumblbug.com/gpmc3 — sua compra apoia diretamente o acampamento.',
        'structured_data.howto_step4_name': 'Entre no Parque Esportivo de Gangjeong',
        'structured_data.howto_step4_text': 'Chegue ao Parque Esportivo de Gangjeong e entre com o ingresso comprado no Tumblbug.',
        'camp_faq_2026.a1': 'De 5 a 7 de junho de 2026, um festival de música pela paz de três dias na aldeia de Gangjeong com 51 grupos.',
        'camp_faq_2026.a3': 'Sim — a entrada é paga. Os ingressos custam ₩30.000 KRW e são vendidos pelo crowdfunding Tumblbug (tumblbug.com/gpmc3); a receita financia o festival e o trabalho de solidariedade pela paz.',
        'camp_faq_2026.a4': 'Comprar um ingresso no Tumblbug (tumblbug.com/gpmc3) apoia diretamente o acampamento. Você também pode ajudar comprando produtos no local.',
        'camp_faq_2026.a5': '51 artistas indie coreanos de vários gêneros, incluindo Yun Sunae, Jeong Jinseok, Choi Sangdon, Kim Dongsan & Blue Neighbors, Lim Jeongdeuk, Taehyeon, HANASH e TAGI.',
        'faqs.items[3].a': 'Participarão músicos de diversos gêneros como rock, folk, jazz e eletrônica. No acampamento de 2026, há 51 grupos confirmados.',
        'faqs.items[4].a': 'O Gangjeong Peace and Music Camp é um festival pago; os ingressos custam ₩30.000 KRW e são vendidos pelo Tumblbug (tumblbug.com/gpmc3). A receita financia o festival e o trabalho de solidariedade pela paz.',
        'faqs.items[8].a': 'Sim, o Gangjeong Peace and Music Camp é um festival ao ar livre adequado para famílias. Para informações sobre a entrada de crianças, consulte a página do Tumblbug (tumblbug.com/gpmc3).',
    },

    # =======================================================================
    # RUSSIAN
    # =======================================================================
    'ru': {
        'camp.description_2026': '3-й Gangjeong Peace Music Camp пройдёт с 5 (пт.) по 7 (вс.) июня 2026 года в спортивном парке Канджон в Согвипо на острове Чеджу. К 73-й годовщине перемирия в Корейской войне фестиваль впервые расширен до формата «три дня — две ночи» и соберёт 51 коллектив. На фоне усиления милитаризации и угрозы войны на Корейском полуострове песня мира, начавшаяся в деревне Канджон, превращается в более крепкую и широкую солидарность. Под лозунгом «Пойте, танцуйте, покончим с войной!» музыканты разных жанров несут антивоенное и мирное послание. Билеты — на tumblbug.com/gpmc3.',
        'camp.expected_2026': 'Подтверждён 51 коллектив',
        'camp.seo_title_2026': '3-й Gangjeong Peace Music Camp 2026 · 5–7 июня · Чеджу · 51 коллектив',
        'camp.seo_description_2026': '3-й Gangjeong Peace and Music Camp — 5–7 июня 2026, деревня Канджон, остров Чеджу. 51 корейский инди-коллектив, три дня музыки мира. Билеты ₩30 000 (KRW) на Tumblbug (tumblbug.com/gpmc3).',
        'camp.timeline_2026_title': '3-й Camp (51 коллектив)',
        'gangjeong_story.timeline_2026_title': '3-й Camp (51 коллектив)',
        'camp_data.camp-2026.description': '3-й Gangjeong Peace Music Camp пройдёт с 5 (пт.) по 7 (вс.) июня 2026 года в спортивном парке Канджон в Согвипо на острове Чеджу. К 73-й годовщине перемирия в Корейской войне фестиваль впервые расширен до формата «три дня — две ночи» и соберёт 51 коллектив. На фоне усиления милитаризации и угрозы войны на Корейском полуострове песня мира, начавшаяся в деревне Канджон, превращается в более крепкую и широкую солидарность. Под лозунгом «Пойте, танцуйте, покончим с войной!» музыканты разных жанров несут антивоенное и мирное послание. Билеты — на tumblbug.com/gpmc3.',
        'structured_data.howto_step3_name': 'Купить билет на Tumblbug',
        'structured_data.howto_step3_text': 'Купите билет через краудфандинг на tumblbug.com/gpmc3 — покупка напрямую поддерживает фестиваль.',
        'structured_data.howto_step4_name': 'Вход в спортивный парк Канджон',
        'structured_data.howto_step4_text': 'Приезжайте в спортивный парк Канджон и проходите по билету, приобретённому на Tumblbug.',
        'camp_faq_2026.a1': 'С 5 по 7 июня 2026 года — трёхдневный фестиваль музыки мира в деревне Канджон с участием 51 коллектива.',
        'camp_faq_2026.a3': 'Да, вход по билетам. Билет стоит ₩30 000 (KRW) и продаётся через краудфандинг Tumblbug (tumblbug.com/gpmc3); выручка идёт на проведение фестиваля и поддержку движения за мир.',
        'camp_faq_2026.a4': 'Покупка билета на Tumblbug (tumblbug.com/gpmc3) — это прямая поддержка фестиваля. Также можно купить мерч на месте.',
        'camp_faq_2026.a5': '51 корейский инди-коллектив разных жанров, в том числе Yun Sunae, Jeong Jinseok, Choi Sangdon, Kim Dongsan & Blue Neighbors, Lim Jeongdeuk, Taehyeon, HANASH и TAGI.',
        'faqs.items[3].a': 'Будут участвовать музыканты разных жанров — рок, фолк, джаз, электроника. На фестивале 2026 года подтверждён 51 коллектив.',
        'faqs.items[4].a': 'Gangjeong Peace and Music Camp — фестиваль с входом по билетам; билет стоит ₩30 000 (KRW) и продаётся на Tumblbug (tumblbug.com/gpmc3). Средства идут на фестиваль и работу за мир.',
        'faqs.items[8].a': 'Да, Gangjeong Peace and Music Camp — семейный фестиваль на открытом воздухе. Условия посещения с детьми смотрите на странице билетов на Tumblbug (tumblbug.com/gpmc3).',
    },

    # =======================================================================
    # ARABIC
    # =======================================================================
    'ar': {
        'camp.description_2026': 'يُقام مخيم كانغجونغ للسلام والموسيقى الثالث من 5 (الجمعة) إلى 7 (الأحد) يونيو 2026 في حديقة كانغجونغ الرياضية بمدينة سوغويبو في جزيرة جيجو. في الذكرى الثالثة والسبعين لهدنة الحرب الكورية، يتوسّع المخيم لأول مرة إلى ثلاثة أيام وليلتين، بمشاركة 51 فرقة. في ظلّ تصاعد العسكرة وخطر الحرب في شبه الجزيرة الكورية، تتحوّل أغنية السلام التي بدأت في قرية كانغجونغ إلى تضامن أوسع وأقوى. تحت شعار «لِنُغنِّ، لنرقص، لنُنهِ الحرب!»، يُقدّم موسيقيّون من أنواع متعدّدة رسائل سلام ومناهضة للحرب. التذاكر متاحة على tumblbug.com/gpmc3.',
        'camp.expected_2026': '51 فرقة مؤكّدة',
        'camp.seo_title_2026': 'مخيم كانغجونغ للسلام والموسيقى الثالث 2026 · 5–7 يونيو · جيجو · 51 فرقة',
        'camp.seo_description_2026': 'مخيم كانغجونغ للسلام والموسيقى الثالث — 5–7 يونيو 2026 في قرية كانغجونغ بجزيرة جيجو. 51 فرقة كورية مستقلّة في ثلاثة أيام من موسيقى السلام. التذاكر بـ30,000 وون (KRW) عبر Tumblbug (tumblbug.com/gpmc3).',
        'camp.timeline_2026_title': 'المخيم الثالث (51 فرقة)',
        'gangjeong_story.timeline_2026_title': 'المخيم الثالث (51 فرقة)',
        'camp_data.camp-2026.description': 'يُقام مخيم كانغجونغ للسلام والموسيقى الثالث من 5 (الجمعة) إلى 7 (الأحد) يونيو 2026 في حديقة كانغجونغ الرياضية بمدينة سوغويبو في جزيرة جيجو. في الذكرى الثالثة والسبعين لهدنة الحرب الكورية، يتوسّع المخيم لأول مرة إلى ثلاثة أيام وليلتين، بمشاركة 51 فرقة. في ظلّ تصاعد العسكرة وخطر الحرب في شبه الجزيرة الكورية، تتحوّل أغنية السلام التي بدأت في قرية كانغجونغ إلى تضامن أوسع وأقوى. تحت شعار «لِنُغنِّ، لنرقص، لنُنهِ الحرب!»، يُقدّم موسيقيّون من أنواع متعدّدة رسائل سلام ومناهضة للحرب. التذاكر متاحة على tumblbug.com/gpmc3.',
        'structured_data.howto_step3_name': 'احجز تذكرتك على Tumblbug',
        'structured_data.howto_step3_text': 'اشترِ تذكرة عبر التمويل الجماعي على tumblbug.com/gpmc3 — شراؤك يدعم المخيم مباشرة.',
        'structured_data.howto_step4_name': 'الدخول إلى حديقة كانغجونغ الرياضية',
        'structured_data.howto_step4_text': 'توجّه إلى حديقة كانغجونغ الرياضية وادخل عبر تذكرة Tumblbug التي اشتريتها.',
        'camp_faq_2026.a1': 'من 5 إلى 7 يونيو 2026، مهرجان موسيقى سلام لمدّة ثلاثة أيام في قرية كانغجونغ بمشاركة 51 فرقة.',
        'camp_faq_2026.a3': 'نعم، الدخول بالتذاكر. سعر التذكرة 30,000 وون (KRW)، وتُباع عبر التمويل الجماعي على Tumblbug (tumblbug.com/gpmc3)؛ تُموّل العائدات المهرجان وأنشطة التضامن من أجل السلام.',
        'camp_faq_2026.a4': 'شراء تذكرة عبر Tumblbug (tumblbug.com/gpmc3) يدعم المخيم مباشرة. يمكن أيضاً دعم المخيم بشراء المنتجات في الموقع.',
        'camp_faq_2026.a5': '51 فناناً كورياً مستقلاً من أنواع متعدّدة، بما في ذلك Yun Sunae وJeong Jinseok وChoi Sangdon وKim Dongsan & Blue Neighbors وLim Jeongdeuk وTaehyeon وHANASH وTAGI.',
        'faqs.items[3].a': 'يشارك موسيقيّون من أنواع متعدّدة كالروك والفولك والجاز والإلكترونيك. في مخيم 2026 تأكّدت مشاركة 51 فرقة.',
        'faqs.items[4].a': 'مخيم كانغجونغ للسلام والموسيقى مهرجان بتذاكر؛ سعر التذكرة 30,000 وون (KRW) وتُباع عبر Tumblbug (tumblbug.com/gpmc3). تُموّل العائدات المهرجان وأنشطة السلام.',
        'faqs.items[8].a': 'نعم، مخيم كانغجونغ للسلام والموسيقى مهرجان عائلي في الهواء الطلق. لتفاصيل دخول الأطفال راجعوا صفحة تذاكر Tumblbug (tumblbug.com/gpmc3).',
    },

    # =======================================================================
    # CHINESE (Simplified)
    # =======================================================================
    'zh-Hans': {
        'camp.description_2026': '2026年6月5日（周五）至7日（周日），第三届江汀和平音乐营将在济州岛西归浦市江汀体育公园举办。值此停战73周年之际，音乐营首次扩展为三天两夜的规模，共有51组音乐人参与。在朝鲜半岛军事化和战争威胁加剧的当下，源自江汀村的和平之歌正汇聚成更强大、更坚实的团结力量。在"唱起来，跳起来，结束战争！"的口号下，多种音乐风格的音乐人通过音乐传递反战与和平的讯息。门票现已在tumblbug.com/gpmc3发售。',
        'camp.expected_2026': '已确认51组演出',
        'camp.seo_title_2026': '第三届江汀和平音乐营 2026 · 6月5–7日 · 济州 · 51组',
        'camp.seo_description_2026': '第三届江汀和平音乐营 — 2026年6月5–7日在韩国济州岛江汀村举行。51组韩国独立音乐人，三天和平音乐演出。门票30,000韩元，通过Tumblbug（tumblbug.com/gpmc3）发售。',
        'camp.timeline_2026_title': '第三届营地（51组）',
        'gangjeong_story.timeline_2026_title': '第三届营地（51组）',
        'camp_data.camp-2026.description': '2026年6月5日（周五）至7日（周日），第三届江汀和平音乐营将在济州岛西归浦市江汀体育公园举办。值此停战73周年之际，音乐营首次扩展为三天两夜的规模，共有51组音乐人参与。在朝鲜半岛军事化和战争威胁加剧的当下，源自江汀村的和平之歌正汇聚成更强大、更坚实的团结力量。在"唱起来，跳起来，结束战争！"的口号下，多种音乐风格的音乐人通过音乐传递反战与和平的讯息。门票现已在tumblbug.com/gpmc3发售。',
        'structured_data.howto_step3_name': '在Tumblbug购买门票',
        'structured_data.howto_step3_text': '通过tumblbug.com/gpmc3的众筹购票，您的购票将直接支持音乐营。',
        'structured_data.howto_step4_name': '进入江汀体育公园',
        'structured_data.howto_step4_text': '到达江汀体育公园，凭在Tumblbug购买的门票入场。',
        'camp_faq_2026.a1': '2026年6月5日至7日，为期三天的和平音乐节，在江汀村举行，共51组音乐人参加。',
        'camp_faq_2026.a3': '需要购票。门票为30,000韩元，通过Tumblbug众筹（tumblbug.com/gpmc3）发售；收入用于音乐节运营和和平团结活动。',
        'camp_faq_2026.a4': '通过Tumblbug（tumblbug.com/gpmc3）购票即直接支持音乐营。您也可以在现场购买周边商品来支持。',
        'camp_faq_2026.a5': '51组韩国独立音乐人，涵盖多种风格，包括Yun Sunae、Jeong Jinseok、Choi Sangdon、Kim Dongsan & Blue Neighbors、Lim Jeongdeuk、Taehyeon、HANASH和TAGI。',
        'faqs.items[4].a': '江汀和平音乐营是凭票入场的活动；门票为30,000韩元，通过Tumblbug（tumblbug.com/gpmc3）发售。收入用于音乐节运营和和平团结活动。',
    },

    # =======================================================================
    # CHINESE (Traditional)
    # =======================================================================
    'zh-Hant': {
        'camp.description_2026': '2026年6月5日（週五）至7日（週日），第三屆江汀和平音樂營將在濟州島西歸浦市江汀體育公園舉辦。值此停戰73週年之際，音樂營首次擴展為三天兩夜的規模，共有51組音樂人參與。在朝鮮半島軍事化和戰爭威脅加劇的當下，源自江汀村的和平之歌正匯聚成更強大、更堅實的團結力量。在「唱起來，跳起來，結束戰爭！」的口號下，多種音樂風格的音樂人透過音樂傳遞反戰與和平的訊息。票券現已於tumblbug.com/gpmc3發售。',
        'camp.expected_2026': '已確認51組演出',
        'camp.seo_title_2026': '第三屆江汀和平音樂營 2026 · 6月5–7日 · 濟州 · 51組',
        'camp.seo_description_2026': '第三屆江汀和平音樂營 — 2026年6月5–7日在韓國濟州島江汀村舉行。51組韓國獨立音樂人，三天和平音樂演出。票券30,000韓元，透過Tumblbug（tumblbug.com/gpmc3）販售。',
        'camp.timeline_2026_title': '第三屆營地（51組）',
        'gangjeong_story.timeline_2026_title': '第三屆營地（51組）',
        'camp_data.camp-2026.description': '2026年6月5日（週五）至7日（週日），第三屆江汀和平音樂營將在濟州島西歸浦市江汀體育公園舉辦。值此停戰73週年之際，音樂營首次擴展為三天兩夜的規模，共有51組音樂人參與。在朝鮮半島軍事化和戰爭威脅加劇的當下，源自江汀村的和平之歌正匯聚成更強大、更堅實的團結力量。在「唱起來，跳起來，結束戰爭！」的口號下，多種音樂風格的音樂人透過音樂傳遞反戰與和平的訊息。票券現已於tumblbug.com/gpmc3發售。',
        'structured_data.howto_step3_name': '於Tumblbug購買票券',
        'structured_data.howto_step3_text': '透過tumblbug.com/gpmc3的群眾募資購票，您的購票將直接支持音樂營。',
        'structured_data.howto_step4_name': '進入江汀體育公園',
        'structured_data.howto_step4_text': '到達江汀體育公園，憑於Tumblbug購買的票券入場。',
        'camp_faq_2026.a1': '2026年6月5日至7日，為期三天的和平音樂節，在江汀村舉行，共51組音樂人參加。',
        'camp_faq_2026.a3': '需要購票。票券為30,000韓元，透過Tumblbug群眾募資（tumblbug.com/gpmc3）販售；收入用於音樂節營運和和平連帶活動。',
        'camp_faq_2026.a4': '透過Tumblbug（tumblbug.com/gpmc3）購票即直接支持音樂營。您也可以在現場購買周邊商品來支持。',
        'camp_faq_2026.a5': '51組韓國獨立音樂人，涵蓋多種風格，包括Yun Sunae、Jeong Jinseok、Choi Sangdon、Kim Dongsan & Blue Neighbors、Lim Jeongdeuk、Taehyeon、HANASH和TAGI。',
        'faqs.items[3].a': '搖滾、民謠、爵士、電子等多種流派的音樂人將參加。2026年音樂營已確認51組音樂人參演。',
        'faqs.items[4].a': '江汀和平音樂營是憑票入場的活動；票券為30,000韓元，透過Tumblbug（tumblbug.com/gpmc3）販售。收入用於音樂節營運和和平連帶活動。',
        'faqs.items[8].a': '可以，江汀和平音樂營是適合全家參與的戶外節日。兒童入場詳情請參閱Tumblbug票券頁（tumblbug.com/gpmc3）。',
    },

    # =======================================================================
    # HINDI
    # =======================================================================
    'hi': {
        'camp.description_2026': '5 जून (शुक्रवार) से 7 जून (रविवार), 2026 तक, सेओग्विपो, जेजू स्थित गांगजोंग खेल पार्क में तीसरा गांगजोंग शांति संगीत शिविर आयोजित होगा। कोरियाई युद्ध युद्धविराम की 73वीं वर्षगांठ पर, शिविर पहली बार तीन दिन और दो रातों के स्वरूप में विस्तार पाते हुए 51 कलाकार समूहों को साथ लाएगा। कोरियाई प्रायद्वीप पर बढ़ते सैन्यीकरण और युद्ध के ख़तरे के बीच, गांगजोंग गाँव से उठा शांति का गीत और मज़बूत और व्यापक एकजुटता में बदल रहा है। "चलो गाएँ, चलो नाचें, युद्ध ख़त्म करें!" के नारे के तहत विविध शैलियों के संगीतकार युद्ध-विरोधी और शांति का संदेश देंगे। टिकट tumblbug.com/gpmc3 पर उपलब्ध हैं।',
        'camp.expected_2026': '51 समूह पुष्ट',
        'camp.seo_title_2026': 'तीसरा गांगजोंग शांति संगीत शिविर 2026 · 5–7 जून · जेजू · 51 समूह',
        'camp.seo_description_2026': 'तीसरा गांगजोंग शांति और संगीत शिविर — 5–7 जून 2026, गांगजोंग गाँव, जेजू द्वीप। 51 कोरियाई इंडी समूह, तीन दिनों की शांति संगीत प्रस्तुति। टिकट ₩30,000 KRW, Tumblbug (tumblbug.com/gpmc3) पर।',
        'camp.timeline_2026_title': 'तीसरा शिविर (51 समूह)',
        'gangjeong_story.timeline_2026_title': 'तीसरा शिविर (51 समूह)',
        'camp_data.camp-2026.description': '5 जून (शुक्रवार) से 7 जून (रविवार), 2026 तक, सेओग्विपो, जेजू स्थित गांगजोंग खेल पार्क में तीसरा गांगजोंग शांति संगीत शिविर आयोजित होगा। कोरियाई युद्ध युद्धविराम की 73वीं वर्षगांठ पर, शिविर पहली बार तीन दिन और दो रातों के स्वरूप में विस्तार पाते हुए 51 कलाकार समूहों को साथ लाएगा। कोरियाई प्रायद्वीप पर बढ़ते सैन्यीकरण और युद्ध के ख़तरे के बीच, गांगजोंग गाँव से उठा शांति का गीत और मज़बूत और व्यापक एकजुटता में बदल रहा है। "चलो गाएँ, चलो नाचें, युद्ध ख़त्म करें!" के नारे के तहत विविध शैलियों के संगीतकार युद्ध-विरोधी और शांति का संदेश देंगे। टिकट tumblbug.com/gpmc3 पर उपलब्ध हैं।',
        'structured_data.howto_step3_name': 'Tumblbug पर टिकट ख़रीदें',
        'structured_data.howto_step3_text': 'tumblbug.com/gpmc3 की क्राउडफंडिंग से टिकट ख़रीदें — आपकी ख़रीद सीधे शिविर का समर्थन करती है।',
        'structured_data.howto_step4_name': 'गांगजोंग खेल पार्क में प्रवेश',
        'structured_data.howto_step4_text': 'गांगजोंग खेल पार्क पहुँचें और Tumblbug से ख़रीदी गई टिकट के साथ प्रवेश करें।',
        'camp_faq_2026.a1': '5 से 7 जून 2026 तक, गांगजोंग गाँव में 51 समूहों के साथ तीन दिवसीय शांति संगीत महोत्सव।',
        'camp_faq_2026.a3': 'हाँ, टिकट से प्रवेश है। टिकट की क़ीमत ₩30,000 KRW है और इसे Tumblbug क्राउडफंडिंग (tumblbug.com/gpmc3) पर बेचा जाता है; आय उत्सव और शांति एकजुटता गतिविधियों के लिए उपयोग होती है।',
        'camp_faq_2026.a4': 'Tumblbug (tumblbug.com/gpmc3) से टिकट ख़रीदना सीधे शिविर का समर्थन है। आप स्थल पर सामग्री ख़रीदकर भी मदद कर सकते हैं।',
        'camp_faq_2026.a5': 'विविध शैलियों के 51 कोरियाई इंडी कलाकार, जिनमें Yun Sunae, Jeong Jinseok, Choi Sangdon, Kim Dongsan & Blue Neighbors, Lim Jeongdeuk, Taehyeon, HANASH और TAGI शामिल हैं।',
        'faqs.items[3].a': 'रॉक, फ़ोक, जैज़ और इलेक्ट्रॉनिक जैसी विभिन्न शैलियों के संगीतकार भाग लेंगे। 2026 शिविर के लिए 51 समूह पुष्ट हैं।',
        'faqs.items[4].a': 'गांगजोंग शांति और संगीत शिविर एक टिकट-आधारित उत्सव है; टिकट ₩30,000 KRW में Tumblbug (tumblbug.com/gpmc3) पर बेचे जाते हैं। आय उत्सव और शांति कार्य के लिए है।',
        'faqs.items[8].a': 'हाँ, गांगजोंग शांति और संगीत शिविर परिवार-अनुकूल खुले-में होने वाला उत्सव है। बच्चों के प्रवेश की जानकारी के लिए Tumblbug टिकट पृष्ठ (tumblbug.com/gpmc3) देखें।',
    },

    # =======================================================================
    # INDONESIAN
    # =======================================================================
    'id': {
        'camp.description_2026': 'Gangjeong Peace Music Camp ke-3 berlangsung dari 5 (Jum.) hingga 7 (Min.) Juni 2026 di Taman Olahraga Gangjeong, Seogwipo, Jeju. Memperingati 73 tahun gencatan senjata Perang Korea, kamp untuk pertama kalinya berkembang menjadi format tiga hari dua malam dengan 51 grup. Di tengah meningkatnya militerisasi dan ancaman perang di Semenanjung Korea, lagu perdamaian yang lahir di Desa Gangjeong tumbuh menjadi solidaritas yang lebih kuat dan luas. Di bawah slogan "Mari bernyanyi, mari menari, akhiri perang!", musisi dari beragam genre menyampaikan pesan perdamaian dan anti-perang. Tiket dijual di tumblbug.com/gpmc3.',
        'camp.expected_2026': '51 grup terkonfirmasi',
        'camp.seo_title_2026': 'Gangjeong Peace Music Camp ke-3 2026 · 5–7 Juni · Jeju · 51 grup',
        'camp.seo_description_2026': 'Gangjeong Peace and Music Camp ke-3 — 5–7 Juni 2026 di Desa Gangjeong, Pulau Jeju. 51 grup indie Korea, tiga hari musik perdamaian. Tiket ₩30.000 KRW via Tumblbug (tumblbug.com/gpmc3).',
        'camp.timeline_2026_title': 'Camp ke-3 (51 grup)',
        'gangjeong_story.timeline_2026_title': 'Camp ke-3 (51 grup)',
        'camp_data.camp-2026.description': 'Gangjeong Peace Music Camp ke-3 berlangsung dari 5 (Jum.) hingga 7 (Min.) Juni 2026 di Taman Olahraga Gangjeong, Seogwipo, Jeju. Memperingati 73 tahun gencatan senjata Perang Korea, kamp untuk pertama kalinya berkembang menjadi format tiga hari dua malam dengan 51 grup. Di tengah meningkatnya militerisasi dan ancaman perang di Semenanjung Korea, lagu perdamaian yang lahir di Desa Gangjeong tumbuh menjadi solidaritas yang lebih kuat dan luas. Di bawah slogan "Mari bernyanyi, mari menari, akhiri perang!", musisi dari beragam genre menyampaikan pesan perdamaian dan anti-perang. Tiket dijual di tumblbug.com/gpmc3.',
        'structured_data.howto_step3_name': 'Beli tiket di Tumblbug',
        'structured_data.howto_step3_text': 'Beli tiket melalui crowdfunding di tumblbug.com/gpmc3 — pembelian Anda langsung mendukung kamp.',
        'structured_data.howto_step4_name': 'Masuk ke Taman Olahraga Gangjeong',
        'structured_data.howto_step4_text': 'Tiba di Taman Olahraga Gangjeong dan masuk dengan tiket Tumblbug yang sudah dibeli.',
        'camp_faq_2026.a1': '5–7 Juni 2026, festival musik perdamaian tiga hari di Desa Gangjeong dengan 51 grup.',
        'camp_faq_2026.a3': 'Ya, masuk dengan tiket. Tiket berharga ₩30.000 KRW dan dijual melalui crowdfunding Tumblbug (tumblbug.com/gpmc3); hasil penjualan mendanai festival dan kerja solidaritas perdamaian.',
        'camp_faq_2026.a4': 'Membeli tiket di Tumblbug (tumblbug.com/gpmc3) langsung mendukung kamp. Anda juga bisa membantu dengan membeli merchandise di lokasi.',
        'camp_faq_2026.a5': '51 artis indie Korea dari berbagai genre, termasuk Yun Sunae, Jeong Jinseok, Choi Sangdon, Kim Dongsan & Blue Neighbors, Lim Jeongdeuk, Taehyeon, HANASH, dan TAGI.',
        'faqs.items[3].a': 'Musisi dari berbagai genre seperti rock, folk, jazz, dan elektronik akan tampil. Untuk kamp 2026, 51 grup telah dikonfirmasi.',
        'faqs.items[4].a': 'Gangjeong Peace and Music Camp adalah festival berbayar; tiket berharga ₩30.000 KRW dan dijual via Tumblbug (tumblbug.com/gpmc3). Hasilnya mendanai festival dan kerja solidaritas perdamaian.',
        'faqs.items[8].a': 'Ya, Gangjeong Peace and Music Camp adalah festival luar ruang yang ramah keluarga. Untuk informasi masuknya anak-anak, lihat halaman tiket Tumblbug (tumblbug.com/gpmc3).',
    },
}


# ---------------------------------------------------------------------------
# Path resolution helpers
# ---------------------------------------------------------------------------

def set_dotted(data: dict, dotted: str, value) -> None:
    """Set a value at a dotted path. Supports list indices via 'name[idx]'."""
    parts = dotted.split('.')
    cursor = data
    for i, part in enumerate(parts):
        is_last = i == len(parts) - 1
        # Detect 'items[3]' style
        if '[' in part and part.endswith(']'):
            name, idx_str = part.split('[', 1)
            idx = int(idx_str[:-1])
            container = cursor[name] if name else cursor
            if is_last:
                container[idx] = value
            else:
                cursor = container[idx]
        else:
            if is_last:
                cursor[part] = value
            else:
                cursor = cursor[part]


def set_faq_item(data: dict, index: int, field: str, value: str) -> None:
    items = data['faqs']['items']
    if index >= len(items):
        return
    items[index][field] = value


def apply_locale(locale: str) -> List[str]:
    """Apply updates for a single locale. Returns list of skipped keys."""
    path = ROOT / locale / 'translation.json'
    with path.open('r', encoding='utf-8') as f:
        data = json.load(f)

    updates = UPDATES.get(locale, {})
    skipped = []
    for dotted, value in updates.items():
        try:
            if dotted.startswith('faqs.items['):
                # 'faqs.items[3].a' -> index=3, field='a'
                bracket = dotted.index('[')
                close = dotted.index(']')
                idx = int(dotted[bracket + 1:close])
                field = dotted[close + 2:]  # skip ']' and '.'
                set_faq_item(data, idx, field, value)
            else:
                set_dotted(data, dotted, value)
        except (KeyError, IndexError, TypeError) as exc:
            skipped.append(f'{dotted}: {exc}')

    with path.open('w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')

    # Validate JSON re-loads
    with path.open('r', encoding='utf-8') as f:
        json.load(f)

    return skipped


def main() -> None:
    for locale in sorted(UPDATES.keys()):
        skipped = apply_locale(locale)
        suffix = f' (skipped: {skipped})' if skipped else ''
        print(f'updated: {locale}{suffix}')

    # Sanity check: scan all locales for residual stale phrases
    print('\n--- Residual stale-phrase scan ---')
    stale_patterns = [
        '54팀', '54 teams', '54 acts', '54 Acts', '54組', '54 grupos',
        '54 équipes', '54 Bands', '54 Acts',
        '무료 입장', '무료입장', '무료로 입장', '무료로 즐길', '무료로 누구나',
        'Free admission', 'free admission', 'free and open', 'enter for free',
        'entrada gratuita', 'Entrada gratuita', 'entrez gratuitement',
        'kostenlos und öffentlich', 'kostenlos eintreten', 'kostenlos ein',
        'masuk gratis', 'Masuk gratis', 'entre gratuitamente', 'entrada livre',
        '入場無料', '無料で入場', '無料で楽しめ', '無料で一般公開', '無料でご入場',
        '免费入场', '免費入場', 'дохода', 'бесплатный', 'Бесплатный',
        'मुफ़्त', 'مجاني', 'مجاناً',
        'voluntary contributions, not ticket', 'не продажей билетов',
        'no por venta de entradas', 'pas par la vente de billets',
        'nicht durch Ticketverkäuf', 'não por vendas de ingressos',
        'bukan penjualan tiket', 'टिकट बिक्री से नहीं',
        'チケット販売ではなく', '不靠门票销售', '不靠門票銷售', 'ليس على مبيعات التذاكر',
    ]
    for locale_dir in sorted(ROOT.iterdir()):
        if not locale_dir.is_dir():
            continue
        text = (locale_dir / 'translation.json').read_text(encoding='utf-8')
        hits = [p for p in stale_patterns if p in text]
        if hits:
            print(f'  {locale_dir.name}: {hits}')


if __name__ == '__main__':
    main()
