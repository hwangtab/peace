import { EventType } from "../types/event";

export interface PressItem {
  id: number;
  title: string;          // 기사 제목
  publisher: string;      // 언론사
  date: string;          // 보도 날짜
  url: string;           // 기사 링크
  description: string;   // 기사 요약 또는 발췌
  imageUrl?: string;     // 관련 이미지
  eventType?: EventType; // 'camp' or 'album'
  eventYear?: number;    // 2023, 2024, 2025, etc.
}

// All press items are about the 2024 album project by default
export const pressItems: PressItem[] = ([
  {
    id: 4,
    title: "평화를 노래하는 뮤지션들의 무대 '이름을 모르는 먼 곳의 그대에게' 전석 매진",
    publisher: "뉴스아트",
    date: "2024-10-31",
    url: "https://www.news-art.co.kr/news/article.html?no=32660",
    description: "평화를 향한 간절한 염원을 담은 음반 '이름을 모르는 먼 곳의 그대에게'의 발매 기념 공연이 관객들의 뜨거운 호응을 얻고 있다. 지난 10월 12일 강정마을에서 열린 첫 공연이 전석 매진된 데 이어, 오는 11월 2일 홍대 스페이스한강에서 예정된 두 번째 공연도 일찌감치 매진을 기록했다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20241044/art_17303642770961_5c659f.jpg"
  },
  {
    id: 1,
    title: "강정이 낳았다…'세계평화 기원' 12팀 음악가들의 노래",
    publisher: "한겨레",
    date: "2024-10-10",
    url: "https://www.hani.co.kr/arti/culture/culture_general/1161535.html",
    description: "장하나 기획자는 '새로운 세대의 뮤지션들이 사회적 메시지를 담은 음악 창작에 참여하는 뜻깊은 계기가 되었다'며 '다양한 음악적 색채와 경험을 가진 뮤지션들의 협업으로 평화라는 주제에 대한 다채로운 음악적 상상력을 보여줄 수 있을 것으로 기대한다'고 말했다.",
    imageUrl: "https://flexible.img.hani.co.kr/flexible/normal/960/960/imgdb/original/2024/1008/20241008501862.jpg"
  },
  {
    id: 2,
    title: "총성과 고통의 그곳으로…평화를 담은 음악편지 보내요",
    publisher: "경향신문",
    date: "2024-09-19",
    url: "https://www.khan.co.kr/culture/culture-general/article/202409191455001",
    description: "이 음반은 제19대 국회의원을 지낸 활동가 장하나와 ‘음악하는 활동가’ 황경하가 기획했고, ‘강정피스앤뮤직캠프 조직위원회’와 ‘예술해방전선’이 제작을 맡았다. 참여 음악가들은 10월12일 제주 강정평화센터, 11월2일 서울 홍대 스페이스 한강에서 공연을 연다.",
    imageUrl: "https://img.khan.co.kr/news/2024/09/19/news-p.v1.20240919.2b72c5956ca04f74bed8fd9f0dd47766_P1.webp"
  },
  {
    id: 3,
    title: "전쟁의 아픔을 호소하고 평화의 소중함을 일깨우는 프로젝트 앨범 발매",
    publisher: "뉴스아트",
    date: "2024-09-03",
    url: "https://www.news-art.co.kr/news/article.html?no=32254",
    description: "우크라이나 전쟁, 이스라엘-팔레스타인 분쟁, 한반도의 긴장 등 세계 곳곳에서 들려오는 전쟁의 소식은 우리의 일상을 불안과 공포로 물들이고 있다. 이런 시대적 배경 속에서 『이름을 모르는 먼 곳의 그대에게』는 음악을 통해 평화의 메시지를 전 세계에 전하고자 하는 뮤지션들의 간절한 열망을 담아냈다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20240936/art_17253322573648_23573e.jpg"
  },
  {
    id: 5,
    title: "남수, 신곡 '안녕(먼 곳의 그대에게)' 공개 - 우리는 결국 같은 땅에 살고 있다",
    publisher: "월간 믹싱",
    date: "2024-11-22",
    url: "https://mixing.co.kr/29252",
    description: "남수는 앨범 소개를 통해 \"멀리 떨어져 있지만 우리는 결국 같은 땅에 살고 있다\"며 \"다른 세상에서 일어나는 일이 아니라 결국 같은 땅 위에서 벌어지고 있다. 멀리에 있지만 같은 마음과 소망을 품은 우리. 이름을 모르지만 서로의 안녕을 바라는 우리라고 전했다.",
    imageUrl: "https://mmagimg.speedgabia.com/2024/11/_namsu-bye-thumb.jpg"
  },
  {
    id: 6,
    title: "‘거리를 초월하는 연대의 선율’ 아티스트 남수, ‘안녕(먼 곳의 그대에게)’ 싱글 음원 발매",
    publisher: "스포츠경향",
    date: "2024-11-24",
    url: "https://sports.khan.co.kr/article/202411240607003",
    description: "가사는 현대 사회의 분열과 갈등 속에서도 여전히 존재하는 인류애를 상기시킨다. “그대와 내 안에 같은 바람이 있다면”이라는 구절은 인간의 보편적 염원을 상기시키며, “나의 이름을 모르는 그대에게”라는 표현은 익명성 속에서도 연결되어 있는 우리들의 모습을 상징적으로 나타낸다.",
    imageUrl: "https://images.khan.co.kr/article/2024/11/24/news-p.v1.20241124.37bd552a91f74c7db1d08c28705cc907_P1.webp"
  },
  {
    id: 7,
    title: "‘화음으로 그리는 자유의 항해, 모레도토요일의 'We will sail for your freedom'",
    publisher: "뉴스아트",
    date: "2024-10-15",
    url: "https://www.news-art.co.kr/news/article.html?no=32606",
    description: "모레도토요일의 가장 큰 강점은 음악적 완성도와 메시지의 진정성, 그리고 실제 행동이 균형을 이루고 있다는 점이다. 모레도토요일은 자신들의 음악적 재능을 사회적 메시지 전달의 도구로 활용하면서도, 현장에서의 직접적인 행동을 통해 그 메시지를 실천하고 있다. 전설적인 다큐멘터리 사진가 고 최민식이 예술작업과 삶이 일치해야 한다고 강조했듯이, 모레도토요일의 삶과 신념은 그들의 음악에 특별한 무게감과 설득력을 더한다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20241042/art_17289686768047_b83e1e.jpg"
  },
  {
    id: 8,
    title: "제주 강정마을 평화활동가로 구성된 '모레도토요일', 싱글 앨범 발매",
    publisher: "헤드라인 제주",
    date: "2024-11-25",
    url: "https://www.headlinejeju.co.kr/news/articleView.html?idxno=558061",
    description: "'모레도토요일'이라는 이름에는 이상적인 순간을 지속하고자 하는 열망이 담겨있다. 제주 강정마을의 평화 프로그램 '섬띵피스'를 통해 만난 모레와 도토는 음악을 매개로 소통하며 하나의 예술적, 실천적 공동체를 형성했다. 이들은 강정마을 해군기지 건설을 둘러싼 갈등 속에서 단순한 음악 활동을 넘어 해군기지 앞 인간띠잇기 등 평화 지킴이로서 현장 활동도 병행하며, 예술과 실천의 조화로운 결합을 보여주고 있다.",
    imageUrl: "https://www.headlinejeju.co.kr/news/photo/202411/558061_449548_4751.jpg"
  },
  {
    id: 9,
    title: "제주 포크 듀오 모레도토요일이 노래하는 평화, 'We will sail for your freedom' 발매",
    publisher: "월간 믹싱",
    date: "2024-11-25",
    url: "https://mixing.co.kr/29341",
    description: "제주 강정마을의 평화 활동가들로 구성된 포크 듀오 모레도토요일이 오늘(25일) 신곡 'We will sail for your freedom'을 발매했다. 이 곡은 2016년 Emma Ringqvist가 팔레스타인 가자 지구의 여성들을 위해 작곡한 곡을 재해석한 작품이다. 원곡은 불법 봉쇄된 팔레스타인 가자 지구로 항해하던 13명의 여성 활동가들이 함께 만든 노래다. 이들은 가사에서 올리브나무를 통해 평화의 메시지를 전달한다. '할머니들이 심은 올리브나무'는 과거 평화로운 삶의 증거이며, '딸들이 새로운 씨앗을 심고 자라는 것을 지켜볼 수 있기를' 바라는 구절은 미래에 대한 희망을 상징적으로 표현한다.",
    imageUrl: "https://mmagimg.speedgabia.com/2024/11/_we-will-sail-thumb.jpg"
  },
  {
    id: 10,
    title: "'자유롭다'고 믿는 사회 속 모순에 대해, 재즈 듀오 모모 'If this can be tolerated, what can't be?'what can't be?'",
    publisher: "월간 믹싱",
    date: "2024-11-27",
    url: "https://mixing.co.kr/29415",
    description: "'If this can be tolerated, what can't be? Why we bear catastrophe if we're so free?'라는 가사는 자유를 말하는 사회에서 폭력이 용인되는 모순을 날카롭게 지적한다. 더불어 이는 우리가 왜 이를 감내하고 있는지에 대한 끊임없는 물음으로서, 반복되는 멜로디는 그들의 일상이 결코 단조롭거나 무의미하지 않음을, 오히려 그 속에 깃든 강인한 생명력과 희망이 얼마나 위대한 것인지를 전달한다.",
    imageUrl: "https://mmagimg.speedgabia.com/2024/11/_momo-thumb.jpg"
  },
  {
    id: 12,
    title: "‘이서영 싱글 '우리' 발표…사랑, 평화, 자유 함께 부르는 노래되길",
    publisher: "월간 믹싱",
    date: "2024-11-29",
    url: "https://mixing.co.kr/29490",
    description: "이서영은 '어느 날 산에 나 있는 깊은 터널을 지날 때 이런 그림이 떠올랐다. 숲의 가슴을 뚫고 그곳을 지나가는 사람들의 무리가 그려졌다. 터널을 지나가며 떠올렸던 그림이 이 노래로 번지게 되었다. 턱 끝까지 숨이 차올라도 삶을 고집할 수밖에 없는 우리는 무엇을 잃었을까, 무엇을 놓쳤을까. 사랑과 평화와 자유라는 이름이 내 마음속 깊은 터널에서부터 메아리치며 대답해 오는 것만 같았다'며 곡의 의도를 설명했다. 이어 '서로 다른 소리를 가진 악기들이 모여, 아름답게 일치되는 이 노래처럼 그렇게 노래하고 싶었다'며 '이 노래를 만들고 부르는 순간, 사랑과 평화와 자유에 한 뼘 더 가까워질 수 있었다. 듣는 이들에게도 함께 부르는 노래처럼 여겨질 수 있기를 바란다'고 전했다.",
    imageUrl: "https://mmagimg.speedgabia.com/2024/11/_we-thumb.jpg"
  },
  {
    id: 11,
    title: "멈추지 않는 리듬, 꺾이지 않는 희망 - 모모가 연주하는 저항의 재즈",
    publisher: "뉴스아트",
    date: "2024-10-22",
    url: "https://www.news-art.co.kr/news/article.html?no=32644",
    description: "'If this can be tolerated, what can't be? Why we bear catastrophe if we're so free?'은 전쟁과 폭력이 만연한 현 세계 질서에 대한 날카로운 문제제기를 담고 있다. 이 질문은 우리가 '자유롭다'고 믿는 사회에서 어떻게 이토록 끔찍한 폭력과 파괴를 용인하고 있는지에 대한 성찰을 요구한다. 모모는 이 곡을 통해 우크라이나에서의 전쟁, 이스라엘과 팔레스타인 간의 분쟁, 그리고 한반도의 분단 상황 등 세계 곳곳의 갈등 상황을 예리하게 포착하며, 이러한 '재난'을 감내하는 우리의 태도에 의문을 제기한다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20241043/art_172957614531_cb2e06.jpg"
  },
  {
    id: 13,
    title: "서늘한 음색으로 전하는 뜨거운 메시지 - 이서영이 그리는 '우리'들의 연대",
    publisher: "뉴스아트",
    date: "2024-10-22",
    url: "https://www.news-art.co.kr/news/article.html?no=32645",
    description: "'우리는 가시를 품고 살고 우리는 가슴을 뚫고 걷는다'로 시작되는 가사는 개인의 고통이 집단의 경험으로 확장되는 순간을 포착한다. '우리'라는 시점의 반복적 사용은 개별적 체험을 넘어, 동시대를 살아가는 이들의 집단적 의식을 환기한다. 이는 현대사회의 구조적 모순과 그 속에서 살아가는 개인들의 연대 가능성을 암시하는 시적 장치로 기능한다. 수사적 장치를 넘어, 고통받는 개인들의 연대 가능성을 암시하는 제스처로 읽힌다. '턱 끝까지 숨차도 삶을 고집한다'라는 구절은 생존의 고단함과 동시에 그것을 견뎌내는 인간의 강인함을 동시에 드러낸다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20241043/art_17295757086366_a46773.jpg"
  },
  {
    id: 14,
    title: "싱어송라이터 이서영, 시간을 담아낸 새로운 싱글 '우리' 발매",
    publisher: "루리웹",
    date: "2024-11-29",
    url: "https://bbs.ruliweb.com/news/read/204826",
    description: "이서영만의 독특한 음색과 서정적인 사운드스케이프가 돋보이는 '우리'는 피아노와 보컬을 중심으로 한 원곡에 일렉트릭 기타, 베이스, 플루겔혼이 더해진 풍성한 편곡이 특징이다. 특히 플루겔혼의 깊이 있는 음색은 곡의 시적 이미지를 한층 강화하며, 각 악기들은 독자적인 성부를 그리면서도 조화로운 앙상블을 이룬다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20241043/art_17295699483884_fb2af4.jpg"
  },
  {
    id: 15,
    title: "정진석의 '이땅이 니땅이가' 소성리의 참상을 담아낸 저항의 블루스",
    publisher: "뉴스아트",
    date: "2024-10-11",
    url: "https://www.news-art.co.kr/news/article.html?no=32582",
    description: "정진석은 이 곡에서 전통적인 블루스의 틀을 한국적 정서와 결합시키는 데 성공했다. 구수한 경상도 사투리로 노래하는 보컬은 미국 남부의 블루스 가수들을 연상시키면서도, 동시에 한국 시골 노인들의 구술 전통을 떠올리게 한다. 이러한 독특한 보컬 스타일은 곡의 주제의식과 완벽하게 조화를 이루며, 청자로 하여금 소성리 주민들의 목소리를 직접 듣는 듯한 착각을 불러일으킨다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20241041/art_17286175936167_e2bc82.jpg"
  },
  {
    id: 16,
    title: "‘이름을 모르는 먼 곳의 그대에게’ 평화 노래한 음악가들 여정, 아카이브 웹사이트 다시 만난다",
    publisher: "스포츠경향",
    date: "2024-12-02",
    url: "https://sports.khan.co.kr/article/202412020551003",
    description: "웹사이트에서는 프로젝트에 참여한 12팀의 뮤지션 소개와 각 음악가들이 전하는 평화 메시지를 만나볼 수 있다. 특히 제주 강정마을에서 결성된 포크듀오 모레도토요일, 네팔 출신 시타리스트 리테스 마하르잔이 참여한 Project Around Surround 등 다채로운 음악가들의 이야기가 담겨있다.",
    imageUrl: "https://images.khan.co.kr/article/2024/12/02/news-p.v1.20241202.02d6177fa7fd480381f431c60710a344_P1.webp"
  },
  {
    id: 17,
    title: "거리를 초월하는 연대의 선율 - 남수의 '안녕(먼 곳의 그대에게)'",
    publisher: "뉴스아트",
    date: "2024-10-26",
    url: "https://www.news-art.co.kr/news/article.html?no=32617",
    description: "남수의 '안녕(먼 곳의 그대에게)'은 현대사회의 복잡한 양상 속에서 순수한 인간애를 되새기게 하는 작품이다. 이 곡은 단순한 멜로디와 절제된 편곡으로 메시지에 집중하게 하는 동시에, 깊은 울림을 전달한다. 곡의 구조는 다소 절제된 형식을 따르고 있지만, 그 안에서 남수만의 독특한 음악적 색채가 드러난다. 다소 무겁고 슬프게 느껴지는 피아노 반주는 묵묵하게 나아가며 곡의 분위기를 이끌어간다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20241042/art_17290693286107_ca5934.png"
  },
  {
    id: 18,
    title: "까르의 'TRANSITION' - 시대의 전환을 노래하는 생명의 詩",
    publisher: "뉴스아트",
    date: "2024-11-19",
    url: "https://www.news-art.co.kr/news/article.html?no=32677",
    description: "'TRANSITION'은 결국 우리 시대의 불안과 희망을 솔직하게 담아낸 음악이다. 이 곡은 현대 사회의 위기 속에서도 끊임없이 새로운 가능성을 모색하는 예술가의 목소리를 들려주며, 동시에 한국 포크 음악의 현재적 의미를 다시 한번 생각하게 만든다. 까르가 제시하는 '전환'의 비전은, 그저 이상이나 구호가 아닌 일상의 실천과 예술적 승화를 통해 실현 가능한 것으로 다가온다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20241147/art_17319955139486_dbe4f0.jpg"
  },
  {
    id: 19,
    title: "김인의 '별을 보러 간 사람' - 평화에 대한 서정적 시학",
    publisher: "뉴스아트",
    date: "2024-12-05",
    url: "https://www.news-art.co.kr/news/article.html?no=32691",
    description: "'별을 보러 간 사람'의 진정한 성취는 전쟁의 폭력성을 고발하는 방식에 있다. 이 곡은 직접적인 분노나 저항의 표현 대신, 평화로웠던 순간의 구체적 감각과 기억을 소환함으로써 전쟁의 부조리를 드러낸다. 특히 '어깨를 포근히 기대어 앉았던 그 밤'과 같은 친밀한 기억의 순간은, 전쟁이 파괴하는 것이 단순히 물리적 공간이나 생명만이 아니라 인간의 가장 소중한 관계성임을 암시한다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20241249/art_17333740286862_d4e1e2.jpg"
  },
  {
    id: 20,
    title: "현대 문명의 비극을 담아낸 포크 록 '김동산과 블루이웃 - 물결'",
    publisher: "뉴스아트",
    date: "2024-11-20",
    url: "https://news.mt.co.kr/mtview.php?no=2024122015155125322&type=1",
    description: "음악적으로 '물결'은 주목할 만한 성취를 보여준다. 밴드 블루이웃의 호흡은 단단하다. 류준철의 오르간은 서정적인 화음으로 곡의 분위기를 이끌어가고, 이인우의 베이스와 김예준의 드럼은 견고한 리듬 섹션을 구축한다. 특히 후반부로 갈수록 고조되는 밴드의 연주는 가사가 던지는 질문의 무게감을 효과적으로 전달한다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20241147/art_17320679353068_c724d0.jpg"
  },
  {
    id: 21,
    title: "전쟁의 상처를 노래하다 - 자이(Jai)와 HANASH의 '분홍색 패딩 소녀'",
    publisher: "뉴스아트",
    date: "2024-10-25",
    url: "https://www.news-art.co.kr/news/article.html?no=32649",
    description: "순수한 한 소녀의 이야기를 통해 전쟁의 비극을 더욱 선명하게 드러내는 이 곡은, 반전의 메시지를 전달하는 새로운 방식을 보여준다. 자이의 독특한 보컬과 HANASH의 실험적 사운드의 만남은 전쟁이라는 무거운 주제를 새로운 관점에서 조명하는데 성공했다. 무고한 영혼의 상처를 통해 전쟁의 참상을 이야기하는 이 시도는, 우리에게 더 깊은 울림을 준다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20241043/art_17298221431005_afab11.jpg"
  },
  {
    id: 22,
    title: "전쟁의 상처를 노래하다 - 자이(Jai)와 HANASH의 '분홍색 패딩 소녀'",
    publisher: "뉴스아트",
    date: "2024-10-25",
    url: "https://www.news-art.co.kr/news/article.html?no=32649",
    description: "순수한 한 소녀의 이야기를 통해 전쟁의 비극을 더욱 선명하게 드러내는 이 곡은, 반전의 메시지를 전달하는 새로운 방식을 보여준다. 자이의 독특한 보컬과 HANASH의 실험적 사운드의 만남은 전쟁이라는 무거운 주제를 새로운 관점에서 조명하는데 성공했다. 무고한 영혼의 상처를 통해 전쟁의 참상을 이야기하는 이 시도는, 우리에게 더 깊은 울림을 준다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20241043/art_17298221431005_afab11.jpg"
  },
  {
    id: 23,
    title: "작은 바람이 전하는 평화의 노래 - 나뭇잎들의 '눈 앞의 마음'",
    publisher: "뉴스아트",
    date: "2024-12-10",
    url: "https://www.news-art.co.kr/news/article.html?no=32695",
    description: "나뭇잎들은 포크 장르 특유의 친밀한 음악적 접근을 통해 거대한 평화라는 주제를 개인의 시선으로 풀어낸다. 특히 주목할 만한 것은 이들이 선택한 서정적 관점이다. 대부분의 반전 음악들이 전쟁의 참상을 직접적으로 고발하거나 저항의 목소리를 내는 것과 달리, '눈앞의 마음'은 일상의 작은 순간들과 개인의 감정선을 통해 평화의 가치를 이야기한다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20241250/art_17338217947325_88f251.jpg"
  },
  {
    id: 24,
    title: "포크 듀오 나뭇잎들, 평화를 노래하다···새 싱글 ‘눈 앞의 마음’ 발매",
    publisher: "스포츠경향",
    date: "2025-01-16",
    url: "https://sports.khan.co.kr/article/202501162213003",
    description: "‘눈 앞의 마음’은 기존 반전 음악들과는 다른 접근방식이 돋보인다. 전쟁의 참상을 직접적으로 고발하거나 저항의 목소리를 내기보다, 일상의 작은 순간들과 개인의 감정선을 통해 평화의 가치를 이야기한다. “슬픔과 기쁨이 찾아오고 떠나가고 맴도네”라는 가사로 시작해 “모든 마음이 그곳에 닿기를 기도하고 노래하겠네”로 마무리되는 노랫말은 개인의 내면에서 시작해 세상을 향한 희망으로 확장된다.",
    imageUrl: "https://images.khan.co.kr/article/2025/01/16/news-p.v1.20250116.cc1325a1e49d403d9bc62e48a2268aa5_P1.webp"
  },
  {
    id: 25,
    title: "예술해방전선, 포크 듀오 나뭇잎들 새 싱글 '눈 앞의 마음' 발매",
    publisher: "루리웹",
    date: "2025-01-16",
    url: "https://bbs.ruliweb.com/news/read/206470",
    description: "여울과 원걸로 구성된 나뭇잎들은 이번 곡에서도 특유의 조화로운 하모니를 선보인다. 여울의 맑은 음색과 원걸의 따뜻한 중저음이 만나 마치 두 개의 나뭇잎이 바람에 흔들리듯 자연스럽게 어우러진다. 어쿠스틱 기타와 쉐이커만을 사용한 미니멀한 편곡은 메시지의 순수성을 더욱 돋보이게 한다.",
    imageUrl: "https://i3.ruliweb.com/img/25/01/16/1946d7c52aaafd4.jpeg"
  },
  {
    id: 26,
    title: "[강정의 자연을 담은 신비로운 사운드] Project Around Surround, 동서양 음악의 실험적 융합 선보여",
    publisher: "뉴스아트",
    date: "2025-01-17",
    url: "https://www.news-art.co.kr/news/article.html?no=32718",
    description: "이번 작품은 강정의 자연 풍경을 청각적으로 재해석한다. 잔잔한 파도 소리에서 시작해 점차 한라산의 웅장함으로 이어지는 음악적 흐름은, 고대 인도의 라가와 현대 앰비언트 음악의 특징을 절묘하게 조화시킨다. 특히 시타르의 신비로운 음색과 첨단 사운드 디자인의 만남은 동양의 전통과 서양의 현대성을 잇는 가교 역할을 한다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20250103/art_17370882782835_3077f9.jpg"
  },
  {
    id: 27,
    title: "여유, '서울의 밤' 발매…'포크 선율에 담긴 청춘의 이야기'",
    publisher: "머니투데이",
    date: "2025-02-06",
    url: "https://news.mt.co.kr/mtview.php?no=2025020613450122763",
    description: "가사는 청년들의 불안과 순수한 삶에 대한 갈망을 그려냈다. 특히 제주도는 대안적 삶의 가능성을 상징하며 희망을 담고 있다. 포크 본연의 매력으로 청자들에게 깊은 울림을 전한다.",
    imageUrl: "https://thumb.mt.co.kr/06/2025/02/2025020613450122763_1.jpg"
  },
  {
    id: 28,
    title: "여유 ‘서울의 밤’, 현대판 포크의 정수",
    publisher: "스포츠경향",
    date: "2025-02-06",
    url: "https://sports.khan.co.kr/article/202502060153003",
    description: "‘서울의 밤’은 과도한 형식적 실험이나 음악적 과시 없이도, 포크 음악이 가진 매력으로 청자들 마음을 울리는 데 성공했다. 개인의 서정적 독백으로 시작해 “잘 살아라 친구야”라는 축복으로 마무리되는 구조는, 개인의고민이 동시대인들과의 연대로 확장되는 과정을 들려준다.",
    imageUrl: "https://images.khan.co.kr/article/2025/02/06/news-p.v1.20250206.9e168b0306d64ee8ab38e308df22e191_P1.webp"
  },
  {
    id: 29,
    title: "전쟁과 폭력에 저항하는 12인의 음악가들, 평화를 노래하다 - 『이름을 모르는 먼 곳의 그대에게』 발매",
    publisher: "뉴스아트",
    date: "2025-02-07",
    url: "https://www.news-art.co.kr/news/article.html?no=32724",
    description: "전쟁과 폭력이 일상이 되어버린 세계 곳곳의 평화를 염원하는 음악가들이 하나의 목소리를 냈다. 우크라이나 전쟁의 포화 속에서 희생되는 무고한 생명들, 가자지구에서 계속되는 민간인 학살, 그리고 70년이 넘도록 풀리지 않는 한반도 분단의 아픔까지, 각기 다른 현장의 고통을 음악으로 담아낸 음반 『이름을 모르는 먼 곳의 그대에게』가 2월 7일 오후 2시 디지털 음원으로 발매된다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20250206/art_17388988747253_d7feea.jpg"
  }
] as PressItem[]).map(item => ({
  ...item,
  eventType: item.eventType || 'album',
  eventYear: item.eventYear || 2024
}));

