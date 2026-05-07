#!/usr/bin/env python3
"""Curate per-image alt text for CampGallery thumbnails (18 photos × 13 locales).

CampGallery iterates `camp.images` from camps.ts (9 photos for camp-2023, 9 for
camp-2025). The component now looks up `camp_data.{id}.image_alts.{index}`; if
present it uses that alt, otherwise it falls back to the locale-aware
`gallery.alt_camp` template.

Korean filenames (둘리, 여울과, 지슬, 평화문화셀러, 밤 전쟁을끝내자) gave
high-confidence scene hints. DSC*.webp filenames carry no info — those alt
descriptions are best-effort and intentionally general so they remain accurate
even if the photo content differs slightly.

camp-2026 images are NOT included here:
- `hero-gangjeong-2026.webp` already has `camp.hero_alt`
- 3 poster images have `camp.poster_alt_2026`

Run: `python3 scripts/seo/apply-gallery-image-alts.py`
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List

ROOT = Path('/Users/hwang-gyeongha/peace/public/locales')

# Each list has 9 entries matching the order in src/data/camps.ts.
SCENES: Dict[str, Dict[str, List[str]]] = {
    'camp-2023': {
        # 0 IMG_2465 / 1 둘리목걸이고르는 / 2 밤 전쟁을끝내자 / 3 DSC00451
        # 4 여울과2 / 5 지슬 / 6 평화문화셀러 / 7 DSC00273 / 8 DSC00360
        'ko': [
            '제1회 강정피스앤뮤직캠프 메인 무대 전경',
            '캠프 굿즈 부스에서 수공예 목걸이를 고르는 관객',
            '야간 — 평화의 촛불과 "전쟁을 끝내자" 메시지',
            '강정마을 무대 위 라이브 공연',
            '뮤지션 "여울과" 라이브 공연',
            '뮤지션 "지슬" 무대',
            '강정 평화문화 셀러(벼룩시장) 부스',
            '강정마을 캠프에 모인 관객들',
            '함께 노래하는 관객들',
        ],
        'en': [
            '1st Gangjeong Peace Music Camp main stage',
            'Browsing handmade necklaces at the camp merch booth',
            'Night candle vigil — "End the war" message',
            'Live performance on the Gangjeong stage',
            'Yeoulgwa performing live at the camp',
            'Jiseul performing on stage',
            'Gangjeong peace culture flea market booth',
            'Audience gathered at the Gangjeong camp',
            'Audience singing along',
        ],
        'ja': [
            '第1回カンジョン平和音楽キャンプのメインステージ',
            'キャンプのグッズブースで手作りのネックレスを選ぶ観客',
            '夜の灯火 — 「戦争を終わらせよう」のメッセージ',
            'カンジョン村のステージでのライブ公演',
            'ミュージシャン「ヨウルグァ」のライブ公演',
            'ミュージシャン「ジスル」のステージ',
            'カンジョン平和文化フリーマーケットのブース',
            'カンジョンキャンプに集まった観客',
            '共に歌う観客たち',
        ],
        'zh-Hans': [
            '第一届江汀和平音乐营主舞台',
            '在营地周边商品摊位挑选手工项链的观众',
            '夜晚烛光 — "结束战争"的讯息',
            '江汀村舞台上的现场演出',
            '音乐人"여울과(Yeoulgwa)"现场演出',
            '音乐人"지슬(Jiseul)"舞台',
            '江汀和平文化跳蚤市场摊位',
            '聚集在江汀营地的观众',
            '一同合唱的观众们',
        ],
        'zh-Hant': [
            '第一屆江汀和平音樂營主舞台',
            '在營地周邊商品攤位挑選手工項鍊的觀眾',
            '夜晚燭光 — 「結束戰爭」的訊息',
            '江汀村舞台上的現場演出',
            '音樂人「여울과(Yeoulgwa)」現場演出',
            '音樂人「지슬(Jiseul)」舞台',
            '江汀和平文化跳蚤市場攤位',
            '聚集在江汀營地的觀眾',
            '一同合唱的觀眾們',
        ],
        'es': [
            'Escenario principal del 1.er Gangjeong Peace Music Camp',
            'Eligiendo collares hechos a mano en el puesto del camp',
            'Vigilia nocturna con velas — mensaje "Acabemos con la guerra"',
            'Concierto en vivo en el escenario de Gangjeong',
            'Yeoulgwa actuando en vivo en el camp',
            'Jiseul actuando en el escenario',
            'Mercadillo de cultura por la paz de Gangjeong',
            'Público reunido en el camp de Gangjeong',
            'Público cantando en coro',
        ],
        'fr': [
            'Scène principale du 1er Gangjeong Peace Music Camp',
            'Choix de colliers faits main au stand du camp',
            'Veillée aux bougies — message « Finissons-en avec la guerre »',
            'Concert en direct sur la scène de Gangjeong',
            'Yeoulgwa en concert au camp',
            'Jiseul sur scène',
            'Marché aux puces de la culture de paix de Gangjeong',
            'Public rassemblé au camp de Gangjeong',
            'Public chantant en chœur',
        ],
        'de': [
            'Hauptbühne beim 1. Gangjeong Peace Music Camp',
            'Auswahl handgefertigter Halsketten am Camp-Stand',
            'Kerzenmahnwache nachts — Botschaft „Beendet den Krieg“',
            'Live-Auftritt auf der Bühne in Gangjeong',
            'Yeoulgwa live beim Camp',
            'Jiseul auf der Bühne',
            'Friedenskultur-Flohmarkt von Gangjeong',
            'Publikum versammelt im Gangjeong-Camp',
            'Mitsingendes Publikum',
        ],
        'pt': [
            'Palco principal do 1.º Gangjeong Peace Music Camp',
            'Escolhendo colares artesanais no estande do camp',
            'Vigília à luz de velas — mensagem "Acabemos com a guerra"',
            'Apresentação ao vivo no palco de Gangjeong',
            'Yeoulgwa em apresentação ao vivo no camp',
            'Jiseul em apresentação no palco',
            'Feira de cultura pela paz de Gangjeong',
            'Público reunido no camp de Gangjeong',
            'Público cantando junto',
        ],
        'ru': [
            'Главная сцена 1-го Gangjeong Peace Music Camp',
            'Выбор ручных украшений на сувенирной точке кемпа',
            'Ночное шествие со свечами — «Закончим войну»',
            'Живое выступление на сцене в Канджоне',
            'Yeoulgwa — живое выступление на кемпе',
            'Jiseul на сцене',
            'Барахолка культуры мира в Канджоне',
            'Зрители на кемпе в Канджоне',
            'Зрители подпевают вместе',
        ],
        'id': [
            'Panggung utama Gangjeong Peace Music Camp ke-1',
            'Memilih kalung buatan tangan di stan merchandise kemp',
            'Aksi lilin malam — pesan "Akhiri perang"',
            'Pertunjukan langsung di panggung Gangjeong',
            'Yeoulgwa tampil langsung di kemp',
            'Jiseul tampil di panggung',
            'Bazar budaya perdamaian Gangjeong',
            'Penonton berkumpul di kemp Gangjeong',
            'Penonton bernyanyi bersama',
        ],
        'ar': [
            'المسرح الرئيسي لمخيم كانغجونغ للسلام والموسيقى الأول',
            'اختيار قلائد مصنوعة يدويًا في كشك مشتريات المخيم',
            'وقفة بالشموع ليلاً — رسالة «أنهوا الحرب»',
            'عرض حيّ على مسرح كانغجونغ',
            'فرقة Yeoulgwa في عرض حيّ بالمخيم',
            'فرقة Jiseul على المسرح',
            'سوق ثقافة السلام في كانغجونغ',
            'الجمهور المجتمع في مخيم كانغجونغ',
            'الجمهور يردّد الأغاني معًا',
        ],
        'hi': [
            'पहले गांगजोंग शांति संगीत शिविर का मुख्य मंच',
            'शिविर के स्टॉल पर हाथ से बने हार चुनते दर्शक',
            'रात की मोमबत्ती सभा — "युद्ध समाप्त करो" का संदेश',
            'गांगजोंग के मंच पर लाइव प्रदर्शन',
            'Yeoulgwa का शिविर में लाइव प्रदर्शन',
            'Jiseul का मंच प्रदर्शन',
            'गांगजोंग शांति संस्कृति का बाजार',
            'गांगजोंग शिविर में जुटे दर्शक',
            'साथ गाते हुए दर्शक',
        ],
    },
    'camp-2025': {
        # 0 peacemusic-1 / 1-8 DSC*
        'ko': [
            '제2회 강정피스앤뮤직캠프 메인 컷',
            '강정체육공원 야외 무대 라이브 공연',
            '관객으로 가득 찬 강정체육공원',
            '정전 72주년 평화 메시지를 전하는 무대',
            '제2회 캠프 메인 무대 전경',
            '공연 중인 뮤지션 클로즈업',
            '노래를 따라 부르는 관객들',
            '강정 캠프 야외 무대와 객석',
            '제2회 캠프 마무리 합창',
        ],
        'en': [
            '2nd Gangjeong Peace Music Camp signature shot',
            'Live performance on the Gangjeong Sports Park outdoor stage',
            'Audience filling Gangjeong Sports Park',
            'Stage carrying the 72nd Korean War armistice peace message',
            'Main stage of the 2nd camp',
            'Close-up of musicians performing',
            'Audience singing along',
            'Outdoor stage and audience at the Gangjeong camp',
            'Closing chorus of the 2nd camp',
        ],
        'ja': [
            '第2回カンジョン平和音楽キャンプのメインカット',
            'カンジョン体育公園の野外ステージでのライブ公演',
            'カンジョン体育公園を埋める観客',
            '停戦72周年の平和メッセージを伝えるステージ',
            '第2回キャンプのメインステージ',
            '演奏中のミュージシャンのクローズアップ',
            '一緒に歌う観客たち',
            'カンジョンキャンプの野外ステージと客席',
            '第2回キャンプのフィナーレ合唱',
        ],
        'zh-Hans': [
            '第二届江汀和平音乐营标志性画面',
            '江汀体育公园户外舞台的现场演出',
            '观众挤满江汀体育公园',
            '传递停战72周年和平讯息的舞台',
            '第二届营地的主舞台',
            '演出中的音乐人特写',
            '一起合唱的观众',
            '江汀营地的户外舞台与观众席',
            '第二届营地的收尾合唱',
        ],
        'zh-Hant': [
            '第二屆江汀和平音樂營標誌性畫面',
            '江汀體育公園戶外舞台的現場演出',
            '觀眾擠滿江汀體育公園',
            '傳遞停戰72週年和平訊息的舞台',
            '第二屆營地的主舞台',
            '演出中的音樂人特寫',
            '一起合唱的觀眾',
            '江汀營地的戶外舞台與觀眾席',
            '第二屆營地的收尾合唱',
        ],
        'es': [
            'Imagen principal del 2.º Gangjeong Peace Music Camp',
            'Concierto al aire libre en el Parque Deportivo de Gangjeong',
            'Público llenando el Parque Deportivo de Gangjeong',
            'Escenario con el mensaje de paz por el 72.º armisticio',
            'Escenario principal del 2.º camp',
            'Primer plano de músicos en directo',
            'Público cantando en coro',
            'Escenario al aire libre y público en el camp de Gangjeong',
            'Coro final del 2.º camp',
        ],
        'fr': [
            'Image phare du 2e Gangjeong Peace Music Camp',
            'Concert en plein air au Parc des sports de Gangjeong',
            'Public remplissant le Parc des sports de Gangjeong',
            'Scène portant le message de paix du 72e armistice',
            'Scène principale du 2e camp',
            'Gros plan sur des musiciens en concert',
            'Public chantant en chœur',
            'Scène en plein air et public au camp de Gangjeong',
            'Chœur final du 2e camp',
        ],
        'de': [
            'Schlüsselbild des 2. Gangjeong Peace Music Camp',
            'Live-Konzert auf der Freilichtbühne im Gangjeong Sports Park',
            'Publikum füllt den Gangjeong Sports Park',
            'Bühne mit Friedensbotschaft zum 72. Waffenstillstand',
            'Hauptbühne des 2. Camps',
            'Nahaufnahme musizierender Künstler',
            'Mitsingendes Publikum',
            'Freilichtbühne und Publikum beim Gangjeong-Camp',
            'Schlusschor des 2. Camps',
        ],
        'pt': [
            'Imagem-marca do 2.º Gangjeong Peace Music Camp',
            'Concerto ao ar livre no Parque Esportivo de Gangjeong',
            'Público lotando o Parque Esportivo de Gangjeong',
            'Palco com a mensagem de paz pelos 72 anos do armistício',
            'Palco principal do 2.º camp',
            'Close-up de músicos em apresentação',
            'Público cantando junto',
            'Palco ao ar livre e público no camp de Gangjeong',
            'Coro final do 2.º camp',
        ],
        'ru': [
            'Ключевой кадр 2-го Gangjeong Peace Music Camp',
            'Уличный концерт в Gangjeong Sports Park',
            'Публика заполняет Gangjeong Sports Park',
            'Сцена с посланием мира к 72-й годовщине перемирия',
            'Главная сцена 2-го кемпа',
            'Крупный план выступающих музыкантов',
            'Зрители подпевают вместе',
            'Уличная сцена и зрители на кемпе в Канджоне',
            'Финальный хор 2-го кемпа',
        ],
        'id': [
            'Foto utama Gangjeong Peace Music Camp ke-2',
            'Konser di panggung luar Gangjeong Sports Park',
            'Penonton memenuhi Gangjeong Sports Park',
            'Panggung membawa pesan damai 72 tahun gencatan senjata',
            'Panggung utama kemp ke-2',
            'Close-up musisi yang tampil',
            'Penonton bernyanyi bersama',
            'Panggung luar dan penonton di kemp Gangjeong',
            'Paduan suara penutup kemp ke-2',
        ],
        'ar': [
            'الصورة المميّزة لمخيم كانغجونغ للسلام والموسيقى الثاني',
            'حفل في الهواء الطلق في حديقة كانغجونغ الرياضية',
            'الجمهور يملأ حديقة كانغجونغ الرياضية',
            'مسرح يحمل رسالة السلام في الذكرى الـ72 للهدنة',
            'المسرح الرئيسي للمخيم الثاني',
            'لقطة قريبة لموسيقيين أثناء العزف',
            'الجمهور يردّد الأغاني معًا',
            'المسرح المفتوح والجمهور في مخيم كانغجونغ',
            'الكورال الختامي للمخيم الثاني',
        ],
        'hi': [
            'दूसरे गांगजोंग शांति संगीत शिविर की मुख्य तस्वीर',
            'गांगजोंग खेल पार्क के खुले मंच पर लाइव प्रदर्शन',
            'गांगजोंग खेल पार्क को भरते दर्शक',
            '72वीं युद्धविराम वर्षगांठ का शांति संदेश देता मंच',
            'दूसरे शिविर का मुख्य मंच',
            'प्रदर्शन करते संगीतकारों का क्लोज़-अप',
            'साथ गाते हुए दर्शक',
            'गांगजोंग शिविर का खुला मंच और दर्शक',
            'दूसरे शिविर का समापन समवेत गायन',
        ],
    },
}


def set_dotted(obj: dict, dotted: str, value) -> None:
    parts = dotted.split('.')
    cursor = obj
    for part in parts[:-1]:
        if part not in cursor or not isinstance(cursor[part], dict):
            cursor[part] = {}
        cursor = cursor[part]
    cursor[parts[-1]] = value


def main() -> None:
    locales = sorted({loc for camp in SCENES.values() for loc in camp.keys()})
    for locale in locales:
        path = ROOT / locale / 'translation.json'
        with path.open('r', encoding='utf-8') as fp:
            data = json.load(fp)
        for camp_id, locs in SCENES.items():
            alts = locs.get(locale)
            if not alts:
                continue
            # Store as object {0: ..., 1: ...} so i18next.exists() works with
            # `camp_data.{camp_id}.image_alts.{i}` dot notation.
            image_alts_obj = {str(i): alt for i, alt in enumerate(alts)}
            set_dotted(data, f'camp_data.{camp_id}.image_alts', image_alts_obj)
        with path.open('w', encoding='utf-8') as fp:
            json.dump(data, fp, ensure_ascii=False, indent=2)
            fp.write('\n')
        with path.open('r', encoding='utf-8') as fp:
            json.load(fp)
        print(f'updated {locale}')


if __name__ == '__main__':
    main()
