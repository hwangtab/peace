import { StaticImageData } from "next/image";

export interface PressItem {
  id: number;
  title: string;          // 기사 제목
  publisher: string;      // 언론사
  date: string;          // 보도 날짜
  url: string;           // 기사 링크
  description: string;   // 기사 요약 또는 발췌
  imageUrl?: string;     // 관련 이미지 
}

export const pressItems: PressItem[] = [
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
    imageUrl: "https://i3.ruliweb.com/img/24/11/29/193767b79b4afd4.jpeg"
  },
  {
    id: 15,
    title: "정진석의 '이땅이 니땅이가' 소성리의 참상을 담아낸 저항의 블루스",
    publisher: "뉴스아트",
    date: "2024-10-11",
    url: "https://www.news-art.co.kr/news/article.html?no=32582",
    description: "정진석은 이 곡에서 전통적인 블루스의 틀을 한국적 정서와 결합시키는 데 성공했다. 구수한 경상도 사투리로 노래하는 보컬은 미국 남부의 블루스 가수들을 연상시키면서도, 동시에 한국 시골 노인들의 구술 전통을 떠올리게 한다. 이러한 독특한 보컬 스타일은 곡의 주제의식과 완벽하게 조화를 이루며, 청자로 하여금 소성리 주민들의 목소리를 직접 듣는 듯한 착각을 불러일으킨다.",
    imageUrl: "https://www.news-art.co.kr/data/photos/20241041/art_17286175936167_e2bc82.jpg"
  }
];
