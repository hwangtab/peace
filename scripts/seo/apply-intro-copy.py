#!/usr/bin/env python3
"""Apply language-specific SEO intro copy to all 13 locale translation files.

Each page receives a structurally identical block (eyebrow / heading / p1-p3)
but with language-aware framing (historical, geographic, or movement-level
context relevant to the reader), so Google/AI crawlers see unique textual
substance on each alternate URL instead of near-identical translations.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict

ROOT = Path('/Users/hwang-gyeongha/peace/public/locales')

# Flat (page, field) -> {locale: text}
# Page keys: 'press', 'videos', 'gallery', 'album_musicians'
# Fields: eyebrow, heading, p1, p2, p3

COPY: Dict[str, Dict[str, Dict[str, str]]] = {
    # =======================================================================
    # PRESS
    # =======================================================================
    'press': {
        'eyebrow': {
            'ko': '언론 아카이브',
            'en': 'Press archive',
            'ja': 'プレスアーカイブ',
            'zh-Hans': '媒体档案',
            'zh-Hant': '媒體檔案',
            'es': 'Archivo de prensa',
            'fr': 'Archives de presse',
            'de': 'Pressearchiv',
            'pt': 'Arquivo de imprensa',
            'ru': 'Архив прессы',
            'ar': 'أرشيف الصحافة',
            'hi': 'प्रेस संग्रह',
            'id': 'Arsip pers',
        },
        'heading': {
            'ko': '강정에서 울린 평화음악을 기록한 언론들',
            'en': 'How the world reported a small village that sang for peace',
            'ja': '済州・江汀の平和音楽を伝えた日韓メディアの記録',
            'zh-Hans': '媒体如何记录江汀村的和平音乐运动',
            'zh-Hant': '媒體如何記錄江汀村的和平音樂運動',
            'es': 'Así cubrió la prensa la música de paz en Gangjeong',
            'fr': "Comment la presse a couvert le festival de paix de Gangjeong",
            'de': 'Wie Redaktionen über das Friedensmusik-Camp in Gangjeong berichten',
            'pt': 'Como a imprensa cobriu a música pela paz em Gangjeong',
            'ru': 'Как пресса пишет о мирной музыке в деревне Канджон',
            'ar': 'كيف غطّت الصحافة موسيقى السلام في قرية كانغجونغ',
            'hi': 'गंगजियोंग के शांति संगीत को मीडिया ने कैसे दर्ज किया',
            'id': 'Bagaimana media mencatat musik perdamaian di Desa Gangjeong',
        },
        'p1': {
            'ko': '강정피스앤뮤직캠프는 2007년부터 해군기지 건설에 저항해 온 제주 강정마을에서 매년 열리는 독립 음악 축제입니다. 이 아카이브는 2023년 첫 캠프 이후 한국 일간지, 독립 웹진, 국제 평화 매체가 남긴 기사를 한곳에 모은 기록입니다.',
            'en': 'The Gangjeong Peace and Music Camp is an annual independent festival in Gangjeong, a small village on Jeju Island that has resisted naval base construction since 2007. This archive gathers reporting from Korean dailies, independent music webzines, and international peace outlets that have covered the camp since its first edition in 2023.',
            'ja': '江汀ピース・アンド・ミュージック・キャンプは、2007年から海軍基地建設に抵抗してきた済州島・江汀村で毎年開かれる独立系音楽フェスティバルです。このアーカイブは、2023年の初回以降、韓国の日刊紙、独立系ウェブマガジン、国際平和メディアが残した記事をまとめた記録です。',
            'zh-Hans': '江汀和平音乐营是自2007年以来反对海军基地建设的济州江汀村每年举办的独立音乐节。本档案收录了2023年首届以来，韩国日报、独立音乐网站以及国际和平媒体所留下的报道。',
            'zh-Hant': '江汀和平音樂營是自2007年起反對海軍基地建設的濟州江汀村每年舉辦的獨立音樂節。本檔案收錄了2023年首屆以來，韓國日報、獨立音樂網站以及國際和平媒體所留下的報導。',
            'es': 'El Campamento de Paz y Música de Gangjeong es un festival independiente anual en Gangjeong, una pequeña aldea en la isla de Jeju que se opone a la construcción de una base naval desde 2007. Este archivo reúne la cobertura de diarios coreanos, webzines independientes y medios internacionales de paz desde la primera edición en 2023.',
            'fr': "Le Gangjeong Peace and Music Camp est un festival indépendant annuel à Gangjeong, un village de l'île de Jeju qui résiste à la construction d'une base navale depuis 2007. Ces archives rassemblent la couverture des quotidiens coréens, des webzines musicaux indépendants et de médias internationaux de paix depuis la première édition en 2023.",
            'de': 'Das Gangjeong Peace and Music Camp ist ein jährliches, unabhängiges Festival in Gangjeong, einem Dorf auf Jeju, das sich seit 2007 gegen den Bau eines Marinestützpunkts wehrt. Dieses Archiv bündelt die Berichterstattung koreanischer Tageszeitungen, unabhängiger Musikmagazine und internationaler Friedensmedien seit der ersten Ausgabe 2023.',
            'pt': 'O Gangjeong Peace and Music Camp é um festival independente anual em Gangjeong, uma pequena aldeia na Ilha de Jeju que resiste à construção de uma base naval desde 2007. Este arquivo reúne a cobertura de diários coreanos, webzines independentes e meios internacionais de paz desde a primeira edição em 2023.',
            'ru': 'Gangjeong Peace and Music Camp — ежегодный независимый фестиваль в деревне Канджон на острове Чеджу, которая с 2007 года сопротивляется строительству военно-морской базы. Этот архив собирает публикации корейских ежедневных изданий, независимых музыкальных веб-журналов и международных изданий мирного движения с первого издания фестиваля в 2023 году.',
            'ar': 'مخيم كانغجونغ للسلام والموسيقى مهرجان مستقلّ سنوي في كانغجونغ، وهي قرية صغيرة بجزيرة جيجو تقاوم بناء قاعدة بحرية منذ عام 2007. يجمع هذا الأرشيف تغطيات الصحف اليومية الكورية والمجلات الموسيقية المستقلّة والمنابر الدولية المعنية بحركات السلام منذ الدورة الأولى عام 2023.',
            'hi': 'गंगजियोंग पीस एंड म्यूज़िक कैंप जेजू द्वीप के गंगजियोंग गाँव में हर वर्ष आयोजित होने वाला स्वतंत्र संगीत उत्सव है; यह गाँव 2007 से नौसैनिक अड्डे के निर्माण का विरोध कर रहा है। यह संग्रह 2023 के पहले संस्करण से अब तक कोरियाई दैनिकों, स्वतंत्र संगीत वेब पत्रिकाओं और अंतरराष्ट्रीय शांति मीडिया की रिपोर्टिंग को एक जगह लाता है।',
            'id': 'Gangjeong Peace and Music Camp adalah festival independen tahunan di Desa Gangjeong, sebuah desa kecil di Pulau Jeju yang sejak 2007 menolak pembangunan pangkalan angkatan laut. Arsip ini mengumpulkan liputan dari harian Korea, webzine musik independen, dan media perdamaian internasional sejak edisi pertama pada 2023.',
        },
        'p2': {
            'ko': '한국어 기사는 4·3 이후 제주의 역사적 맥락과 마을 공동체의 서사를 깊이 다루는 반면, 일본어·영어 보도는 오키나와·괌·필리핀 등 동아시아 기지 문제와 연결 짓는 시선이 두드러집니다. 각 카드를 누르면 해당 매체의 원문 기사로 이동합니다.',
            'en': 'Korean-language pieces tend to dig into Jeju\'s post-4·3 history and village-level storytelling, while Japanese and English coverage frames the camp alongside other East Asian base struggles in Okinawa, Guam, and the Philippines. Each card opens the original article on the publisher\'s own site.',
            'ja': '韓国語の記事は「4・3事件」以降の済州の歴史や村のコミュニティの物語に深く入り込む傾向があり、日本語・英語の報道は沖縄・グアム・フィリピンなど東アジアの基地問題と結びつけて読み解く視点が目立ちます。各カードをタップすると、発行元のサイトで原文が読めます。',
            'zh-Hans': '韩文报道多深入挖掘济州四·三事件以来的历史与村落叙事；日文与英文报道则常将江汀与冲绳、关岛、菲律宾等东亚基地议题连结在一起。点击任一卡片即可前往原发布媒体阅读全文。',
            'zh-Hant': '韓文報導多深入挖掘濟州四‧三事件以來的歷史與村落敘事；日文與英文報導則常將江汀與沖繩、關島、菲律賓等東亞基地議題連結在一起。點擊任一卡片即可前往原發布媒體閱讀全文。',
            'es': 'Los artículos en coreano suelen profundizar en la historia de Jeju posterior al 4·3 y en la narrativa comunitaria, mientras que la cobertura en japonés e inglés sitúa al campamento junto a otras luchas contra bases militares en Okinawa, Guam y Filipinas. Cada tarjeta abre el artículo original en el sitio del medio.',
            'fr': "Les articles en coréen creusent souvent l'histoire de Jeju après le 4·3 et les récits du village, tandis que la couverture en japonais et anglais relie le camp aux autres luttes contre les bases militaires en Asie de l'Est — Okinawa, Guam, Philippines. Chaque carte ouvre l'article original sur le site de l'éditeur.",
            'de': 'Koreanische Texte vertiefen häufig die Geschichte Jejus nach dem 4.·3.-Massaker und die Erzählung der Dorfgemeinschaft, während englische und japanische Berichte das Camp neben anderen ostasiatischen Basiskonflikten (Okinawa, Guam, Philippinen) verorten. Ein Klick auf eine Karte öffnet den Originalartikel auf der Seite der Redaktion.',
            'pt': 'Os textos em coreano costumam aprofundar-se na história de Jeju após o 4·3 e na narrativa comunitária do vilarejo, enquanto a cobertura em japonês e inglês situa o campamento ao lado de outras lutas contra bases militares no Leste Asiático — Okinawa, Guam e Filipinas. Cada card abre o artigo original no site do veículo.',
            'ru': 'Материалы на корейском языке углубляются в историю Чеджу после событий 4·3 и рассказ о жизни самой деревни, а англо- и японоязычные публикации ставят лагерь в один ряд с протестами против военных баз в Окинаве, Гуаме и на Филиппинах. Клик по карточке открывает оригинал статьи на сайте издания.',
            'ar': 'تميل المقالات الكورية إلى التعمّق في تاريخ جيجو بعد مذبحة 4·3 وسرديات المجتمع القروي، بينما تضع التغطيات الإنكليزية واليابانية المخيّم إلى جانب صراعات القواعد العسكرية في أوكيناوا وغوام والفلبين. يؤدّي النقر على أي بطاقة إلى فتح المقال الأصلي في موقع الناشر.',
            'hi': 'कोरियाई भाषा की रिपोर्टें जेजू के 4·3 नरसंहार के बाद के इतिहास और गाँव समुदाय के विवरण में गहराई से उतरती हैं; जबकि अंग्रेज़ी और जापानी कवरेज ओकिनावा, गुआम और फ़िलीपीन्स के सैन्य अड्डों के संघर्षों के साथ इसे जोड़कर देखती है। किसी भी कार्ड पर क्लिक करने पर मूल लेख प्रकाशक की साइट पर खुलेगा।',
            'id': 'Tulisan berbahasa Korea cenderung menyelami sejarah Jeju pascaperistiwa 4·3 dan kisah komunitas desa, sementara liputan Inggris dan Jepang mengaitkan kamp ini dengan pergulatan pangkalan militer lain di Okinawa, Guam, dan Filipina. Setiap kartu membuka artikel asli di situs penerbitnya.',
        },
        'p3': {
            'ko': '매년 축제 전후로 기사 수가 급증하며, 관련 링크들은 섭외된 뮤지션 라인업·크라우드펀딩 성과·공연 현장 사진을 기록해 둡니다. 필터 버튼으로 연도·이벤트 단위로 좁혀 볼 수 있습니다.',
            'en': 'Coverage spikes around each festival window and the links below preserve lineups, crowdfunding milestones, and on-site photography for future reference. Use the filter chips to narrow results by year or event.',
            'ja': '毎年フェスティバルの前後に記事数が急増し、リンク先は出演者ラインナップ、クラウドファンディングの成果、公演の現場写真を残しています。フィルターで年度・イベント別に絞り込めます。',
            'zh-Hans': '每届音乐营前后的报道数量都会激增；链接里保存了当届阵容、群众募资成果与现场照片。可使用筛选按钮按年份或活动缩小结果。',
            'zh-Hant': '每屆音樂營前後的報導數量都會激增；連結裡保存了當屆陣容、群眾募資成果與現場照片。可使用篩選按鈕按年份或活動縮小結果。',
            'es': 'La cobertura aumenta en torno a cada edición y los enlaces preservan el cartel artístico, los hitos de financiación colectiva y la fotografía del terreno. Utiliza los filtros para acotar por año o evento.',
            'fr': "La couverture s'intensifie autour de chaque édition, et les liens ci-dessous conservent la programmation, les étapes du financement participatif et les photos du terrain. Utilisez les filtres pour affiner par année ou par événement.",
            'de': 'Rund um jede Ausgabe steigt die Berichterstattung sprunghaft an; die Links unten bewahren Line-ups, Crowdfunding-Meilensteine und Festivalfotos. Filter-Chips grenzen die Auswahl nach Jahr oder Event ein.',
            'pt': 'A cobertura dispara em torno de cada edição e os links abaixo preservam line-ups, marcos de financiamento coletivo e registros fotográficos. Use os filtros para recortar por ano ou evento.',
            'ru': 'Пик публикаций приходится на период проведения каждого фестиваля; ссылки сохраняют лайн-апы, этапы краудфандинга и фотохронику. Используйте фильтры, чтобы ограничить выборку годом или мероприятием.',
            'ar': 'يتصاعد حجم التغطية حول كلّ دورة، وتحفظ الروابط أدناه قوائم المشاركين، ومحطّات التمويل الجماعي، وصور الموقع. استخدم مرشّحات التصفية لحصر النتائج حسب السنة أو الفعالية.',
            'hi': 'हर संस्करण के आसपास कवरेज तेज़ी से बढ़ती है; यहाँ दिए गए लिंक उस वर्ष की लाइन-अप, क्राउडफंडिंग उपलब्धियों और मौके पर खींची गई तस्वीरों को संजोए रखते हैं। वर्ष या आयोजन के अनुसार छँटाई के लिए फ़िल्टर बटनों का उपयोग करें।',
            'id': 'Liputan memuncak di sekitar tiap edisi festival; tautan-tautan berikut menyimpan susunan pengisi acara, capaian pendanaan kolektif, dan foto-foto di lokasi. Gunakan tombol filter untuk menyaring berdasarkan tahun atau acara.',
        },
    },

    # =======================================================================
    # VIDEOS
    # =======================================================================
    'videos': {
        'eyebrow': {
            'ko': '영상 아카이브',
            'en': 'Video archive',
            'ja': '映像アーカイブ',
            'zh-Hans': '影像档案',
            'zh-Hant': '影像檔案',
            'es': 'Archivo audiovisual',
            'fr': "Archives vidéo",
            'de': 'Videoarchiv',
            'pt': 'Arquivo de vídeos',
            'ru': 'Видеоархив',
            'ar': 'أرشيف الفيديو',
            'hi': 'वीडियो संग्रह',
            'id': 'Arsip video',
        },
        'heading': {
            'ko': '강정에서 울린 목소리를 담은 공연 영상들',
            'en': 'Live performances from a village that refused to stay silent',
            'ja': '抵抗の声を記録した江汀のライブ映像',
            'zh-Hans': '来自江汀——一个不愿沉默的村落——的现场演出影像',
            'zh-Hant': '來自江汀——一個不願沉默的村落——的現場演出影像',
            'es': 'Actuaciones en vivo desde una aldea que se negó a callar',
            'fr': "Concerts filmés dans un village qui refuse de se taire",
            'de': 'Live-Auftritte aus einem Dorf, das nicht schweigen will',
            'pt': 'Apresentações ao vivo de uma aldeia que se recusou a calar',
            'ru': 'Живые выступления из деревни, которая отказалась молчать',
            'ar': 'حفلات حية من قرية رفضت الصمت',
            'hi': 'एक ऐसे गाँव की लाइव प्रस्तुतियाँ जिसने चुप रहने से इनकार कर दिया',
            'id': 'Penampilan langsung dari sebuah desa yang menolak diam',
        },
        'p1': {
            'ko': '이 페이지의 영상들은 대부분 강정마을과 전국의 소규모 공간에서 진행된 라이브 녹화 자료입니다. 상업 페스티벌과 달리 카메라는 단 한두 대, 음향은 현장 PA, 관객은 해군기지를 바라보며 춤을 춥니다.',
            'en': 'Most clips gathered here are field recordings from Gangjeong village and small spaces across Korea. Unlike commercial festivals, the cameras are one or two, the sound is raw PA, and the audience often dances while facing a naval base just beyond the stage.',
            'ja': 'ここに集めた映像の多くは、江汀村や全国の小さな会場で記録されたフィールド映像です。商業フェスと異なり、カメラは1〜2台、音響は現場PA、観客は海軍基地を背景に踊り続けます。',
            'zh-Hans': '此处收录的影像多为在江汀村及韩国各地小型空间录制的现场记录。与商业音乐节不同，镜头只有一两台、声音来自现场PA，观众常在海军基地的视线中起舞。',
            'zh-Hant': '此處收錄的影像多為在江汀村及韓國各地小型空間錄製的現場記錄。與商業音樂節不同，鏡頭只有一兩台、聲音來自現場PA，觀眾常在海軍基地的視線中起舞。',
            'es': 'La mayoría de estos clips son grabaciones de campo en Gangjeong y en espacios pequeños por toda Corea. A diferencia de los festivales comerciales, hay una o dos cámaras, el sonido sale de un PA de directo y el público baila frente a una base naval visible desde el escenario.',
            'fr': "La plupart de ces captations sont des enregistrements de terrain réalisés à Gangjeong et dans de petites salles à travers la Corée. Loin des festivals commerciaux, une ou deux caméras seulement, le son direct de la façade PA, et un public qui danse face à une base navale toute proche.",
            'de': 'Die Clips hier sind überwiegend Feldaufnahmen aus Gangjeong und kleinen Spielstätten in ganz Korea. Anders als auf kommerziellen Festivals gibt es nur ein oder zwei Kameras, der Ton kommt direkt von der Live-PA, und das Publikum tanzt oft im Angesicht des angrenzenden Marinestützpunkts.',
            'pt': 'A maior parte destes vídeos são registros de campo feitos em Gangjeong e em pequenos espaços por toda a Coreia. Diferente de festivais comerciais, há uma ou duas câmeras, o som vem da PA ao vivo e o público dança com a base naval visível ao fundo do palco.',
            'ru': 'Большинство клипов здесь — полевые записи из Канджона и небольших площадок по всей Корее. В отличие от коммерческих фестивалей камер одна-две, звук — с живого PA, а зрители часто танцуют прямо напротив военно-морской базы.',
            'ar': 'معظم هذه المقاطع تسجيلات ميدانية من قرية كانغجونغ ومن فضاءات صغيرة في أرجاء كوريا. على خلاف المهرجانات التجارية، ثمّة كاميرا أو اثنتان فقط، والصوت مباشر من منظومة PA على المسرح، والجمهور يرقص وعينُه على قاعدة بحرية مجاورة.',
            'hi': 'यहाँ एकत्र अधिकांश क्लिप गंगजियोंग गाँव और कोरिया भर के छोटे-छोटे स्थलों पर की गई फील्ड रिकॉर्डिंग हैं। व्यावसायिक उत्सवों के उलट, कैमरे एक या दो, ध्वनि सीधी लाइव PA से, और दर्शक अक्सर मंच से ठीक बाहर दिख रहे नौसैनिक अड्डे की ओर मुँह करके नाचते हैं।',
            'id': 'Sebagian besar klip di sini adalah rekaman lapangan dari Desa Gangjeong dan ruang-ruang kecil di seluruh Korea. Berbeda dengan festival komersial, hanya ada satu-dua kamera, suara langsung dari PA, dan penonton sering menari sambil berhadapan dengan pangkalan angkatan laut di balik panggung.',
        },
        'p2': {
            'ko': '한국 인디·포크·펑크·전통 음악가들이 반전·반군사기지·환경 메시지를 자기만의 언어로 담아냅니다. 리테스 마하르잔의 네팔계 한국 음악, 출장작곡가 김동산의 저항 블루스, DJ 조수간만의 현장 세트 등 장르 스펙트럼이 넓습니다.',
            'en': 'Korean indie, folk, punk, and traditional musicians deliver anti-war, anti-base, and environmental messages in their own language. You\'ll hear Ritesh Maharjan weaving Nepali-Korean roots music, the protest blues of touring songwriter Kim Dong-san, and live DJ sets by Josuganman — the spectrum is deliberately wide.',
            'ja': '韓国のインディ、フォーク、パンク、伝統音楽家たちが、反戦・反基地・環境のメッセージをそれぞれの言語で紡ぎます。リテシュ・マハルジャンのネパール×韓国ルーツ音楽、出張作曲家キム・ドンサンの抗議ブルース、DJ 조수간만の現場セットなど、ジャンルの幅は意図的に広く取られています。',
            'zh-Hans': '韩国独立、民谣、庞克与传统音乐人以各自的语言表达反战、反基地与环境的讯息。你会听到 Ritesh Maharjan 交织的尼泊尔–韩国根源音乐、巡演创作者金东山的抗议蓝调，以及 DJ Josuganman 的现场混音——音乐光谱刻意铺得很广。',
            'zh-Hant': '韓國獨立、民謠、龐克與傳統音樂人以各自的語言表達反戰、反基地與環境的訊息。你會聽到 Ritesh Maharjan 交織的尼泊爾–韓國根源音樂、巡演創作者金東山的抗議藍調，以及 DJ Josuganman 的現場混音——音樂光譜刻意鋪得很廣。',
            'es': 'Músicos coreanos de indie, folk, punk y tradición transmiten mensajes antibélicos, antimilitaristas y ecológicos en su propio idioma. Aquí sonará la raíz nepalí-coreana de Ritesh Maharjan, el blues de protesta del compositor itinerante Kim Dong-san y sesiones en vivo del DJ Josuganman — el abanico es deliberadamente amplio.',
            'fr': "Des musiciens coréens indé, folk, punk et traditionnels délivrent des messages anti-guerre, anti-bases et écologiques dans leur propre langue. On y entend la musique racines népali-coréenne de Ritesh Maharjan, le blues contestataire du compositeur itinérant Kim Dong-san et les sets live du DJ Josuganman — l'éventail est volontairement large.",
            'de': 'Koreanische Indie-, Folk-, Punk- und Traditionsmusiker:innen tragen Antikriegs-, Basis- und Umweltbotschaften in ihrer eigenen Sprache vor. Zu hören: die nepalesisch-koreanische Roots-Musik von Ritesh Maharjan, der Protestblues des Tour-Songwriters Kim Dong-san und Live-Sets von DJ Josuganman — das Spektrum ist bewusst weit gefasst.',
            'pt': 'Músicos coreanos de indie, folk, punk e tradição entregam mensagens antiguerra, antibases e ambientais em sua própria língua. Você ouvirá a fusão nepali-coreana de Ritesh Maharjan, o blues de protesto do compositor itinerante Kim Dong-san e sets ao vivo do DJ Josuganman — o espectro é deliberadamente amplo.',
            'ru': 'Корейские инди-, фолк-, панк- и традиционные музыканты передают антивоенные, антимилитаристские и экологические послания на собственном языке. Звучат непало-корейские корни Ритеша Махарджана, протест-блюз бродячего автора Ким Донсана и живые сеты диджея Чосуганмана — спектр намеренно широкий.',
            'ar': 'موسيقيّون كوريّون من مشاهد الإندي والفولك والبانك والتقاليد يطرحون رسائل مناهضة للحرب والقواعد العسكرية ورسائل بيئية بلغتهم الخاصة. تُسمع جذور نيبالية-كورية مع ريتيش ماهارجان، وبلوز الاحتجاج لدى المؤلف المتنقّل كيم دونغ-سان، وجلسات حيّة للدي‑جاي جوسوغانمان — الطيف واسع بشكل متعمَّد.',
            'hi': 'कोरियाई इंडी, फ़ोक, पंक और पारंपरिक संगीतकार युद्ध, सैन्य अड्डों और पर्यावरण पर अपना-अपना संदेश अपनी ज़ुबान में रखते हैं। आप रितेश महर्जन की नेपाली-कोरियाई मूल संगीत, संगीतकार किम डोंग-सान के प्रतिरोध ब्लूज़ और DJ जोसूगान्मान के लाइव सेट सुन पाएँगे — विविधता जान-बूझकर विस्तृत है।',
            'id': 'Musisi indie, folk, punk, dan tradisi Korea menyampaikan pesan antiperang, antipangkalan, dan lingkungan dalam bahasa masing-masing. Anda akan mendengar akar Nepali-Korea Ritesh Maharjan, blues protes penulis lagu keliling Kim Dong-san, hingga set langsung DJ Josuganman — spektrumnya memang sengaja dibuat luas.',
        },
        'p3': {
            'ko': '필터 버튼으로 2023년, 2025년, 2026년 캠프 또는 앨범 수록곡 영상으로 좁혀 볼 수 있습니다. 각 영상 카드를 누르면 YouTube 대신 자체 상세 페이지로 이동해 공연 날짜·장소·연주자 정보를 한눈에 볼 수 있도록 정리돼 있습니다.',
            'en': 'Use the filter chips to narrow to the 2023, 2025, or 2026 camps, or to the 2024 studio album. Selecting any card opens a dedicated page on this site — with performance date, venue, and performer context — rather than jumping straight to YouTube.',
            'ja': 'フィルターで2023年、2025年、2026年キャンプ、または2024年のアルバム収録曲映像に絞り込めます。各カードをタップすると、YouTubeではなくこのサイト内の詳細ページが開き、公演日・会場・出演者の情報が一覧できます。',
            'zh-Hans': '可用筛选按钮聚焦2023、2025、2026年音乐营或2024年专辑曲目影像。点击任一卡片将打开本站独立详细页，集中呈现演出日期、场地与参与者信息，而非直接跳转至YouTube。',
            'zh-Hant': '可用篩選按鈕聚焦2023、2025、2026年音樂營或2024年專輯曲目影像。點擊任一卡片將開啟本站獨立詳細頁，集中呈現演出日期、場地與參與者資訊，而非直接跳轉至YouTube。',
            'es': 'Usa los filtros para acotar a los campamentos de 2023, 2025 o 2026, o al álbum de 2024. Cada tarjeta abre una página dedicada dentro del sitio —con fecha, lugar y contexto del intérprete— en lugar de saltar directamente a YouTube.',
            'fr': "Les filtres permettent de réduire aux camps 2023, 2025 ou 2026, ou à l'album 2024. Chaque carte ouvre une page dédiée sur ce site — date, lieu, contexte du/de la musicien·ne — plutôt que de renvoyer directement vers YouTube.",
            'de': 'Mit den Filtern lässt sich auf die Camps 2023, 2025 oder 2026 bzw. das Studioalbum 2024 eingrenzen. Jede Karte öffnet eine eigene Detailseite auf dieser Website — mit Datum, Ort und Kontext zur Künstlerin oder zum Künstler — statt direkt zu YouTube zu springen.',
            'pt': 'Use os filtros para recortar entre os camps de 2023, 2025 e 2026, ou o álbum de 2024. Cada card abre uma página dedicada dentro do site — com data, local e contexto do artista — em vez de ir direto ao YouTube.',
            'ru': 'Фильтры позволяют сузить список до лагерей 2023, 2025 или 2026 годов либо до студийного альбома 2024 года. Карточка ведёт не сразу на YouTube, а на отдельную страницу сайта с датой, местом и контекстом исполнителя.',
            'ar': 'استخدم المرشّحات للتركيز على مخيّمات 2023 أو 2025 أو 2026، أو على ألبوم 2024. يفتح النقر على أي بطاقة صفحة مخصّصة داخل الموقع — تشمل التاريخ والمكان وسياق الموسيقي — بدلاً من الانتقال المباشر إلى يوتيوب.',
            'hi': '2023, 2025 या 2026 कैंप, अथवा 2024 के एल्बम पर केंद्रित करने के लिए फ़िल्टर बटन प्रयोग करें। किसी भी कार्ड पर क्लिक करने पर सीधे YouTube नहीं, बल्कि इसी साइट के समर्पित पृष्ठ पर तिथि, स्थान और कलाकार का संदर्भ मिलेगा।',
            'id': 'Gunakan tombol filter untuk menyaring ke kamp 2023, 2025, atau 2026, atau ke album 2024. Mengeklik kartu akan membuka halaman detail di situs ini — lengkap dengan tanggal, lokasi, dan konteks pemusik — alih-alih langsung menuju YouTube.',
        },
    },

    # =======================================================================
    # GALLERY
    # =======================================================================
    'gallery': {
        'eyebrow': {
            'ko': '사진 기록',
            'en': 'Photo record',
            'ja': '写真記録',
            'zh-Hans': '影像记录',
            'zh-Hant': '影像紀錄',
            'es': 'Registro fotográfico',
            'fr': "Archives photo",
            'de': 'Fotodokumentation',
            'pt': 'Registro fotográfico',
            'ru': 'Фотолетопись',
            'ar': 'سجلّ مصوَّر',
            'hi': 'तस्वीरी दस्तावेज़',
            'id': 'Catatan foto',
        },
        'heading': {
            'ko': '강정마을, 음악, 평화가 만나는 순간을 담은 사진들',
            'en': 'Photographs from where Gangjeong village, music, and peace meet',
            'ja': '江汀村と音楽、平和が交わる瞬間を写した写真',
            'zh-Hans': '捕捉江汀村、音乐与和平交汇瞬间的照片',
            'zh-Hant': '捕捉江汀村、音樂與和平交匯瞬間的照片',
            'es': 'Imágenes del cruce entre Gangjeong, la música y la paz',
            'fr': "Images du point de rencontre entre Gangjeong, la musique et la paix",
            'de': 'Bilder, wo Gangjeong, Musik und Frieden zusammentreffen',
            'pt': 'Imagens do encontro entre Gangjeong, a música e a paz',
            'ru': 'Снимки, где встречаются Канджон, музыка и мир',
            'ar': 'صور من تقاطع كانغجونغ والموسيقى والسلام',
            'hi': 'जहाँ गंगजियोंग, संगीत और शांति मिलते हैं — उन क्षणों की तस्वीरें',
            'id': 'Foto-foto di titik pertemuan Desa Gangjeong, musik, dan perdamaian',
        },
        'p1': {
            'ko': '강정마을은 한라산 남쪽, 범섬을 바라보는 작은 해안 마을입니다. 4·3 이후 수십 년을 지나, 2007년부터는 해군기지 건설에 반대하는 주민들의 일상이 새로운 역사가 되었습니다. 이 갤러리는 그 바다 앞에서 열린 공연의 공기를 남깁니다.',
            'en': 'Gangjeong sits on the southern coast of Jeju, looking out to Beomseom islet beneath Mount Halla. Decades after the 4·3 massacre, a new layer of history began in 2007 when residents started resisting a naval base. This gallery preserves the atmosphere of concerts held on that very shoreline.',
            'ja': '江汀村は漢拏山の南側、虎島を望む小さな海辺の村です。4・3事件から数十年が経ち、2007年以降は海軍基地建設に反対する住民たちの日常が新たな歴史となりました。このギャラリーは、その海辺で開かれた公演の空気を記録しています。',
            'zh-Hans': '江汀位于济州岛南岸，隔海望着虎岛，背倚汉拏山。继4·3事件数十年之后，2007年起居民反对海军基地建设的日常成为新的历史。本图集留存了那片海岸边举行的演出气息。',
            'zh-Hant': '江汀位於濟州島南岸，隔海望著虎島，背倚漢拏山。繼4·3事件數十年之後，2007年起居民反對海軍基地建設的日常成為新的歷史。本圖集留存了那片海岸邊舉行的演出氣息。',
            'es': 'Gangjeong se asienta en la costa sur de Jeju, mirando al islote Beomseom con el monte Halla al fondo. Décadas después de la masacre del 4·3, en 2007 comenzó una nueva capa de historia: la de los habitantes que resisten una base naval. Esta galería guarda el aire de los conciertos celebrados en esa misma orilla.',
            'fr': "Gangjeong est niché sur la côte sud de Jeju, face à l'îlot Beomseom, au pied du mont Halla. Des décennies après le massacre du 4·3, une nouvelle couche d'histoire s'est ouverte en 2007 avec la résistance des habitants contre une base navale. Cette galerie conserve l'atmosphère des concerts donnés sur ce même rivage.",
            'de': 'Gangjeong liegt an der Südküste Jejus, blickt auf das Inselchen Beomseom und wird vom Hallasan gerahmt. Jahrzehnte nach dem 4.·3.-Massaker begann 2007 eine neue Geschichtsschicht: der Widerstand der Bewohner:innen gegen einen Marinestützpunkt. Diese Galerie bewahrt die Stimmung der Konzerte an genau diesem Ufer.',
            'pt': 'Gangjeong fica no litoral sul de Jeju, de frente para a ilhota Beomseom, com o monte Halla ao fundo. Décadas após o massacre de 4·3, em 2007 começou uma nova camada da história com a resistência dos moradores contra uma base naval. Esta galeria preserva o ar dos concertos realizados exatamente nesse litoral.',
            'ru': 'Канджон расположена на южном берегу Чеджу, напротив островка Помсом, под склонами горы Халласан. Спустя десятилетия после массовой расправы 4·3 в 2007 году здесь началась новая глава — сопротивление жителей строительству военно-морской базы. Эта галерея хранит атмосферу концертов, прошедших прямо на том берегу.',
            'ar': 'تقع قرية كانغجونغ على الساحل الجنوبي لجزيرة جيجو، تطلّ على جزيرة بومسوم تحت جبل هَلاّ. بعد عقود من مذبحة 4·3، فُتحت طبقة جديدة من التاريخ عام 2007 مع مقاومة الأهالي قاعدةً بحرية. يحفظ هذا المعرض أجواء الحفلات التي أُقيمت على ذلك الشاطئ بالذات.',
            'hi': 'गंगजियोंग जेजू के दक्षिणी तट पर, हल्ला पर्वत की ओट में बोमसेओम टापू की ओर ताकता एक छोटा तटीय गाँव है। 4·3 नरसंहार के दशकों बाद, 2007 से निवासियों द्वारा नौसैनिक अड्डे के विरोध ने एक नई ऐतिहासिक परत जोड़ी है। यह गैलरी उसी तट पर हुए कॉन्सर्टों की हवा को संजोती है।',
            'id': 'Gangjeong berada di pesisir selatan Jeju, menghadap pulau kecil Beomseom di bawah bayang Gunung Halla. Puluhan tahun setelah pembantaian 4·3, sejak 2007 lapisan sejarah baru dimulai ketika warga menolak pembangunan pangkalan angkatan laut. Galeri ini merekam suasana konser-konser yang digelar tepat di tepi pantai itu.',
        },
        'p2': {
            'ko': '사진은 2023년, 2025년, 2026년(현재 진행) 세 차례의 캠프 현장에서 촬영됐습니다. 무대 위 뮤지션뿐 아니라 해녀, 구럼비 바위 활동가, 관객 아이들, 평화센터 봉사자들이 함께 담겨 있어 축제 너머의 공동체를 읽어낼 수 있습니다.',
            'en': 'The images span the 2023, 2025, and the ongoing 2026 camps. Alongside musicians on stage you will find haenyeo (Jeju women divers), Gureombi-rock activists, children in the crowd, and Peace Center volunteers — all hinting at the community beyond the festival itself.',
            'ja': '写真は2023年、2025年、そして開催中の2026年、計3回のキャンプで撮影されました。ステージに立つ音楽家だけでなく、海女、クロンビ岩の活動家、観客の子どもたち、平和センターのボランティアたちの姿があり、フェスティバルを越えたコミュニティの姿が見えてきます。',
            'zh-Hans': '影像跨越2023、2025与正在举办的2026年三届音乐营。除了舞台上的音乐人，还能看到海女、具龙岩活动者、观众里的孩子与和平中心志愿者——让人看见节庆之外的社群。',
            'zh-Hant': '影像跨越2023、2025與正在舉辦的2026年三屆音樂營。除了舞台上的音樂人，還能看到海女、具龍岩活動者、觀眾裡的孩子與和平中心志工——讓人看見節慶之外的社群。',
            'es': 'Las fotografías cubren los campamentos de 2023, 2025 y el actual 2026. Junto a los músicos en escena aparecen las haenyeo (buceadoras de Jeju), activistas de la roca Gureombi, niños entre el público y voluntarios del Centro de Paz — un retrato de la comunidad más allá del festival.',
            'fr': "Les photos couvrent les camps 2023, 2025 et l'édition 2026 en cours. Aux côtés des musicien·ne·s sur scène apparaissent les haenyeo (plongeuses de Jeju), les militant·e·s du rocher Gureombi, les enfants du public et les bénévoles du Centre de la paix — une communauté qui déborde le simple festival.",
            'de': 'Die Bilder umfassen die Camps 2023, 2025 und das laufende 2026. Neben den Musiker:innen auf der Bühne erscheinen Haenyeo (Taucherinnen von Jeju), Aktivist:innen am Gureombi-Felsen, Kinder im Publikum und Freiwillige des Peace Center — eine Community, die weit über das Festival hinausgeht.',
            'pt': 'As imagens cobrem os campamentos de 2023, 2025 e o atual de 2026. Ao lado dos músicos no palco aparecem as haenyeo (mergulhadoras de Jeju), ativistas da rocha Gureombi, crianças na plateia e voluntários do Peace Center — um retrato da comunidade para além do festival.',
            'ru': 'На фото — лагеря 2023, 2025 и текущий 2026 года. Рядом с музыкантами видны хэнё (ныряльщицы Чеджу), активисты со скалы Гуромби, дети в зале и волонтёры Центра мира — сообщество шире самого фестиваля.',
            'ar': 'تغطّي الصور مخيّمات 2023 و2025 والمخيّم الجاري لعام 2026. إلى جانب الموسيقيين على المسرح تظهر الهانيو (غوّاصات جيجو)، وناشطو صخرة غوروم-بي، والأطفال في الجمهور، ومتطوّعو مركز السلام — مجتمع يتجاوز المهرجان نفسه.',
            'hi': 'चित्र 2023, 2025 और चालू 2026 कैंप तक फैले हैं। मंच पर संगीतकारों के साथ-साथ हेनीयो (जेजू की गोताखोर महिलाएँ), गुरोम्बी चट्टान के कार्यकर्ता, दर्शकों में बच्चे और पीस सेंटर के स्वयंसेवक भी दिखते हैं — एक समुदाय जो उत्सव से भी बड़ा है।',
            'id': 'Foto-foto ini mencakup kamp 2023, 2025, dan 2026 yang sedang berjalan. Selain musisi di atas panggung, terlihat haenyeo (penyelam perempuan Jeju), aktivis batu Gureombi, anak-anak di antara penonton, dan relawan Peace Center — komunitas yang lebih luas daripada festival itu sendiri.',
        },
        'p3': {
            'ko': '사진 카드를 누르면 고해상도 원본이 라이트박스로 열립니다. 상업 이용 외에 비영리 평화·음악 운동 문맥이라면 출처 표기 후 자유롭게 사용할 수 있습니다.',
            'en': 'Tapping a card opens the full-resolution image in a lightbox. Non-commercial use for peace and music movement contexts is welcome with attribution.',
            'ja': '写真カードをタップすると、高解像度の原本がライトボックスで開きます。商用利用以外、非営利の平和・音楽運動の文脈であれば、出典表記とともに自由にご利用いただけます。',
            'zh-Hans': '点击任意图片卡片，即可在灯箱中查看高解析原图。在标注出处的前提下，欢迎用于非营利的和平与音乐运动场景。',
            'zh-Hant': '點擊任意圖片卡片，即可在燈箱中檢視高解析原圖。在標註出處的前提下，歡迎用於非營利的和平與音樂運動場景。',
            'es': 'Al tocar una tarjeta se abre la imagen en alta resolución en un lightbox. Se permite su uso no comercial en contextos del movimiento por la paz y la música siempre que se indique la fuente.',
            'fr': "Un clic ouvre l'image haute résolution dans une lightbox. Usage non commercial bienvenu pour les mouvements de paix et musicaux, avec mention de la source.",
            'de': 'Ein Klick öffnet das Bild in voller Auflösung in einer Lightbox. Nicht-kommerzielle Nutzung im Kontext der Friedens- und Musikbewegung ist unter Nennung der Quelle willkommen.',
            'pt': 'Ao tocar em um card, a imagem em alta resolução abre em uma lightbox. Uso não comercial em contextos do movimento pela paz e pela música é bem-vindo com atribuição.',
            'ru': 'Нажатие на карточку открывает изображение в полном разрешении в лайтбоксе. Некоммерческое использование в контексте мирного и музыкального движения приветствуется при указании источника.',
            'ar': 'يؤدّي النقر على أي بطاقة إلى فتح الصورة بدقّتها الأصلية في Lightbox. الاستخدام غير التجاري في سياقات حركات السلام والموسيقى مُرحَّب به مع نسب المصدر.',
            'hi': 'किसी भी कार्ड पर क्लिक करने पर मूल हाई-रिज़ॉल्यूशन तस्वीर लाइटबॉक्स में खुलती है। स्रोत का उल्लेख करते हुए गैर-व्यावसायिक शांति और संगीत आंदोलन के संदर्भ में उपयोग का स्वागत है।',
            'id': 'Mengetuk kartu akan membuka gambar beresolusi penuh di lightbox. Penggunaan non-komersial dalam konteks gerakan perdamaian dan musik dipersilakan dengan mencantumkan sumbernya.',
        },
    },

    # =======================================================================
    # ALBUM MUSICIANS
    # =======================================================================
    'album_musicians': {
        'eyebrow': {
            'ko': '뮤지션 소개',
            'en': 'Meet the musicians',
            'ja': 'ミュージシャン紹介',
            'zh-Hans': '音乐人介绍',
            'zh-Hant': '音樂人介紹',
            'es': 'Conoce a los músicos',
            'fr': "Les musicien·ne·s",
            'de': 'Musiker:innen',
            'pt': 'Conheça os músicos',
            'ru': 'Музыканты',
            'ar': 'تعرَّف على الموسيقيين',
            'hi': 'संगीतकारों से मिलिए',
            'id': 'Kenali para musisinya',
        },
        'heading': {
            'ko': '앨범 《이름을 모르는 먼 곳의 그대에게》에 참여한 음악가들',
            'en': 'The musicians behind the 2024 peace album',
            'ja': 'アルバム『名も知らぬ遠い地のあなたへ』に参加したミュージシャンたち',
            'zh-Hans': '参与 2024 和平专辑《致远方素不相识的你》的音乐人',
            'zh-Hant': '參與 2024 和平專輯《致遠方素不相識的你》的音樂人',
            'es': 'Los músicos detrás del álbum de paz de 2024',
            'fr': "Les musicien·ne·s de l'album pour la paix 2024",
            'de': 'Die Musiker:innen hinter dem Friedensalbum 2024',
            'pt': 'Os músicos por trás do álbum pela paz de 2024',
            'ru': 'Музыканты альбома мира 2024 года',
            'ar': 'الموسيقيون وراء ألبوم السلام 2024',
            'hi': '2024 के शांति एल्बम के पीछे के संगीतकार',
            'id': 'Musisi di balik album perdamaian 2024',
        },
        'p1': {
            'ko': '《이름을 모르는 먼 곳의 그대에게》는 2024년에 발매된 강정피스앤뮤직 프로젝트의 공식 앨범으로, 14팀의 한국 음악가가 각각 한 곡씩을 기여했습니다. 국내 인디·포크·재즈·전자음악의 경계를 넘나드는 아티스트들이 "얼굴도 모르는 당신의 평화"라는 주제로 노래를 지었습니다.',
            'en': 'Released in 2024, the album "To You, a Stranger in a Faraway Place" is the official studio record of the Gangjeong Peace and Music project. Fourteen Korean acts — crossing indie, folk, jazz, and electronic — each contributed one song written around the theme of a peace they imagine for a stranger they may never meet.',
            'ja': 'アルバム『名も知らぬ遠い地のあなたへ』は、江汀ピース・アンド・ミュージック・プロジェクトの公式スタジオ作品として2024年にリリースされました。インディ、フォーク、ジャズ、エレクトロニクスの境界を越える14組の韓国アーティストが、「顔も知らないあなたの平和」というテーマで一曲ずつ書き下ろしています。',
            'zh-Hans': '《致远方素不相识的你》于2024年发行，是江汀和平与音乐计划的官方专辑。跨越独立、民谣、爵士与电子边界的14组韩国音乐人各献一曲，围绕"为素未谋面的你所祈愿的和平"主题创作。',
            'zh-Hant': '《致遠方素不相識的你》於2024年發行，是江汀和平與音樂計劃的官方專輯。跨越獨立、民謠、爵士與電子邊界的14組韓國音樂人各獻一曲，圍繞「為素未謀面的你所祈願的和平」主題創作。',
            'es': 'Publicado en 2024, el álbum "Para ti, desconocido de un lugar lejano" es el disco oficial del proyecto Gangjeong Peace and Music. Catorce proyectos coreanos —atravesando indie, folk, jazz y electrónica— contribuyeron con una canción cada uno en torno a la idea de una paz imaginada para alguien que tal vez nunca se conocerá.',
            'fr': "Sorti en 2024, l'album « À toi, inconnu·e d'un lointain ailleurs » est le disque officiel du projet Gangjeong Peace and Music. Quatorze formations coréennes — indé, folk, jazz, électro — ont chacune offert un titre sur l'idée d'une paix imaginée pour un·e inconnu·e que l'on ne rencontrera peut-être jamais.",
            'de': '2024 erschienen, ist das Album „An dich, Fremde:r in weiter Ferne" die offizielle Studioaufnahme des Gangjeong-Peace-and-Music-Projekts. Vierzehn koreanische Acts — zwischen Indie, Folk, Jazz und Elektronik — steuerten je einen Song zum Thema eines Friedens bei, den sie sich für eine nie begegnete Person vorstellen.',
            'pt': 'Lançado em 2024, o álbum "A Você, Estranho de um Lugar Distante" é o disco oficial do projeto Gangjeong Peace and Music. Quatorze projetos coreanos — entre indie, folk, jazz e eletrônico — contribuíram cada um com uma faixa ao redor da ideia de uma paz imaginada para alguém que talvez nunca se encontre.',
            'ru': 'Альбом 2024 года «Тебе, незнакомцу из далёкого места» — официальная студийная запись проекта Gangjeong Peace and Music. Четырнадцать корейских проектов — инди, фолк, джаз, электроника — внесли по одной песне на тему мира, который они желают незнакомцу, с кем могут никогда не встретиться.',
            'ar': 'ألبوم "إليك، أيها الغريب في مكان بعيد" الصادر عام 2024 هو الأسطوانة الرسمية لمشروع كانغجونغ للسلام والموسيقى. أسهم أربعة عشر فريقاً كورياً من الإندي والفولك والجاز والإلكترونيك بأغنية واحدة لكل منهم حول فكرة سلام يتخيّلونه لغريب قد لا يلتقونه أبداً.',
            'hi': '2024 में जारी एल्बम "दूर किसी अनजानी जगह, तुम्हारे नाम" गंगजियोंग पीस एंड म्यूज़िक परियोजना का आधिकारिक स्टूडियो रिकॉर्ड है। इंडी, फ़ोक, जैज़ और इलेक्ट्रॉनिक की सीमाओं को पार करते चौदह कोरियाई प्रोजेक्ट्स ने एक-एक गीत दिए — उस अजनबी के नाम जिससे शायद कभी मिलना न हो।',
            'id': 'Album "Untukmu, Orang Asing di Tempat yang Jauh" yang rilis pada 2024 adalah rekaman studio resmi proyek Gangjeong Peace and Music. Empat belas proyek Korea — melintasi indie, folk, jazz, dan elektronik — menyumbang masing-masing satu lagu dengan tema perdamaian yang dibayangkan untuk orang asing yang mungkin tak pernah ditemui.',
        },
        'p2': {
            'ko': '여기에 나열된 아티스트들은 앨범에 수록곡이 있는 뮤지션만 추린 목록입니다. 캠프 공연에 참여한 전체 라인업(연도별)은 각 캠프 페이지에서 따로 확인할 수 있습니다.',
            'en': 'This list is limited to artists who contributed a track to the album. The full yearly lineup of live performers at each Camp is listed on that year\'s camp page.',
            'ja': 'ここに並ぶのはアルバムに楽曲を提供したアーティストのみです。各キャンプ（年度別）のライブ出演者ラインナップは、それぞれのキャンプページに掲載しています。',
            'zh-Hans': '此处仅列出为专辑贡献曲目的音乐人。各届音乐营的完整演出阵容，请查看对应年份的营地页面。',
            'zh-Hant': '此處僅列出為專輯貢獻曲目的音樂人。各屆音樂營的完整演出陣容，請查看對應年份的營地頁面。',
            'es': 'Esta lista reúne únicamente a artistas que aportaron una pista al álbum. La programación anual de artistas en directo para cada campamento aparece en la página del campamento correspondiente.',
            'fr': "Cette liste se limite aux artistes ayant contribué à l'album. La programmation annuelle complète des artistes en live est consultable sur la page de chaque camp.",
            'de': 'Aufgelistet sind nur Künstler:innen mit einem eigenen Track auf dem Album. Das vollständige Live-Line-up jedes Camps findet sich auf der jeweiligen Camp-Seite.',
            'pt': 'Esta lista inclui apenas os artistas que contribuíram com uma faixa para o álbum. A escalação completa de cada Camp ao vivo está na respectiva página anual do camp.',
            'ru': 'Здесь перечислены только те артисты, которые отдали песню для альбома. Полный список живых участников каждого лагеря — на странице соответствующего года.',
            'ar': 'تقتصر هذه القائمة على الفنّانين الذين أسهموا بأغنية في الألبوم. يمكن الاطّلاع على التشكيلة الكاملة للعروض الحيّة في كل دورة مخيّم على صفحة المخيّم الخاصّة بذلك العام.',
            'hi': 'यह सूची केवल उन कलाकारों की है जिन्होंने एल्बम में अपनी एक रचना दी है। हर वर्ष के कैंप में लाइव प्रस्तुति देने वाले कलाकारों की पूरी सूची उसी वर्ष के कैंप पृष्ठ पर उपलब्ध है।',
            'id': 'Daftar ini hanya mencakup musisi yang menyumbang satu lagu untuk album. Susunan lengkap pengisi acara tiap tahun tersedia di halaman kamp tahunnya masing-masing.',
        },
        'p3': {
            'ko': '카드를 누르면 뮤지션 상세 페이지로 이동해 인스타그램·유튜브 링크와 관련 영상, 그리고 동료 아티스트 추천을 볼 수 있습니다. 앨범 수록곡 음원은 "수록곡" 메뉴에서 직접 들을 수 있습니다.',
            'en': 'Each card opens a musician profile with Instagram/YouTube links, related live footage, and other musicians you may want to hear next. Album tracks themselves stream from the "Tracks" menu.',
            'ja': 'カードをタップするとミュージシャンの詳細ページに移動し、Instagram・YouTube のリンク、関連ライブ映像、あわせて聴きたい仲間のアーティストを確認できます。アルバム収録曲は「収録曲」メニューから直接試聴できます。',
            'zh-Hans': '点击任一卡片即可进入音乐人个人页，查看 Instagram/YouTube 链接、相关现场影像与可一并聆听的其他音乐人。专辑曲目可在"曲目"菜单中直接收听。',
            'zh-Hant': '點擊任一卡片即可進入音樂人個人頁，檢視 Instagram/YouTube 連結、相關現場影像與可一併聆聽的其他音樂人。專輯曲目可在「曲目」選單中直接收聽。',
            'es': 'Cada tarjeta abre un perfil con enlaces a Instagram y YouTube, material en directo relacionado y otros músicos que podrían interesar. Las canciones del álbum se reproducen desde el menú "Canciones".',
            'fr': "Chaque carte ouvre un profil avec liens Instagram/YouTube, captations en concert et suggestions d'autres artistes. Les titres de l'album s'écoutent directement depuis le menu « Titres ».",
            'de': 'Jede Karte öffnet ein Musiker:innenprofil mit Links zu Instagram/YouTube, Live-Mitschnitten und Empfehlungen für den nächsten Hördurchlauf. Die Albumtracks laufen direkt im Menü „Tracks".',
            'pt': 'Cada card abre um perfil de musicista com links de Instagram/YouTube, vídeos ao vivo relacionados e outros artistas para ouvir em seguida. As faixas do álbum tocam no menu "Faixas".',
            'ru': 'Карточка ведёт в профиль артиста со ссылками на Instagram и YouTube, сопроводительными концертными видео и рекомендациями. Сами треки альбома слушаются в разделе «Треки».',
            'ar': 'كلّ بطاقة تفتح صفحة خاصة بالموسيقي تتضمّن روابط إنستغرام ويوتيوب، ومقاطع حيّة ذات صلة، وترشيحات لموسيقيين آخرين. يمكن الاستماع لمقاطع الألبوم مباشرة من قائمة "المقاطع".',
            'hi': 'हर कार्ड एक संगीतकार के पेज पर ले जाता है, जहाँ Instagram/YouTube लिंक, संबंधित लाइव फुटेज और अन्य सुझाए गए कलाकार मिलते हैं। एल्बम की ट्रैक्स "ट्रैक्स" मेन्यू से सीधे सुनी जा सकती हैं।',
            'id': 'Setiap kartu membuka profil musisi dengan tautan Instagram/YouTube, rekaman panggung terkait, dan rekomendasi musisi lain. Lagu-lagu album dapat diputar langsung dari menu "Lagu".',
        },
    },
}

# Field paths: pageKey -> ('translation.json path for that page')
# In KO translations, album page intro lives under "album.musicians_intro.*"
PAGE_PATHS = {
    'press': ['press', 'intro'],
    'videos': ['videos', 'intro'],
    'gallery': ['gallery', 'intro'],
    'album_musicians': ['album', 'musicians_intro'],
}

FIELDS = ['eyebrow', 'heading', 'p1', 'p2', 'p3']


def apply_to_locale(locale: str) -> None:
    path = ROOT / locale / 'translation.json'
    with path.open('r', encoding='utf-8') as f:
        data = json.load(f)

    for page, sections in COPY.items():
        container = data
        for key in PAGE_PATHS[page][:-1]:
            container = container.setdefault(key, {})
        intro_key = PAGE_PATHS[page][-1]
        intro = container.setdefault(intro_key, {})
        for field in FIELDS:
            value = sections[field].get(locale)
            if value is None:
                raise RuntimeError(f'Missing {page}.{field} for {locale}')
            intro[field] = value

    with path.open('w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(f'updated: {locale}')


def main() -> None:
    for locale_dir in sorted(ROOT.iterdir()):
        if not locale_dir.is_dir():
            continue
        apply_to_locale(locale_dir.name)


if __name__ == '__main__':
    main()
