import { EventType } from '../types/event';

export interface VideoItem {
  id: number;
  title: string;
  description: string;
  youtubeUrl: string;
  date: string;
  location: string;
  eventType?: EventType; // 'camp' or 'album'
  eventYear?: number; // 2023, 2024, 2025, etc.
  thumbnailUrl?: string;
}

export const videoItems: VideoItem[] = [
  {
    id: 1,
    title: "김동산과 블루이웃 - 이름을 모르는 먼 곳의 그대에게 서울 쇼케이스",
    description: "김동산과 블루이웃은 수원을 기반으로 활동하는 포크, 블루스 뮤지션 김동산과 밴드 블루이웃입니다. 김동산은 \"한국의 우디거스리\"라는 별명처럼 사회적 메시지를 담은 음악으로 주목받고 있습니다. 해고 노동자, 젠트리피케이션 피해상인 등 소외된 이들의 이야기를 음악으로 전하며, 현재는 수원 장안문 근처에서 LP, 리사이클링 샵 \"롱플레이어\"를 운영하며 지역 문화공간으로 발전시키고 있습니다.",
    youtubeUrl: "https://www.youtube.com/embed/ejTPpS71nX8",
    date: "2024-11-02",
    location: "서울 홍대 스페이스 한강",
    eventType: 'album',
    eventYear: 2024
  },
  {
    id: 2,
    title: "길가는 밴드 장현호 - 이름을 모르는 먼 곳의 그대에게 서울 쇼케이스",
    description: "길가는 밴드는 싱어송라이터인 장현호를 중심으로 2011년 결성되어 현재까지 활동하고 있는 '거리형 밴드' 입니다. 사회적 투쟁과 갈등의 현장에서 노래하는 그들은 10년째 세월호 참사 진상규명, 제주 해군기지 강정마을 투쟁, KTX 해고 승무원 복직투쟁, 파인텍 굴뚝농성, 콜트콜텍 해고노동자 투쟁 등 셀 수 없는 현장, 문화제 등에서 노래로 연대해 왔습니다.",
    youtubeUrl: "https://www.youtube.com/embed/Ts_fFqAYLYE",
    date: "2024-11-02",
    location: "서울 홍대 스페이스 한강",
    eventType: 'album',
    eventYear: 2024
  },
  {
    id: 3,
    title: "남수 - 이름을 모르는 먼 곳의 그대에게 서울 쇼케이스",
    description: "다재다능한 여성 솔로 아티스트로, 인디음악, 포크/블루스, 재즈, 뉴에이지 등 다양한 장르를 아우르는 음악을 선보입니다. \"딱따구리 책방\"이라는 문화공간을 운영하며 음악과 문학의 접점을 만들어가고 있습니다. 앞으로 음악뿐만 아니라 미술, 퍼포먼스 등 다양한 예술 형태를 결합한 작업을 통해 자신의 예술적 경계를 확장해 나가고자 합니다.",
    youtubeUrl: "https://www.youtube.com/embed/cHl1I5iJqyA",
    date: "2024-11-02",
    location: "서울 홍대 스페이스 한강",
    eventType: 'album',
    eventYear: 2024
  },
  {
    id: 4,
    title: "김인 - 이름을 모르는 먼 곳의 그대에게 서울 쇼케이스",
    description: "독특한 소리를 탐구하며 환경과 평화에 대한 깊은 애정을 음악으로 표현하는 독립 음악가입니다. 다양한 장르의 음악을 즐기며 자신만의 독특한 음악 세계를 꾸준히 구축해왔습니다. 밤하늘의 별과 달을 모티프로 한 서정적인 음악을 통해 평화의 메시지를 전달하며, 섬세한 감성과 깊이 있는 가사로 주목받고 있습니다.",
    youtubeUrl: "https://www.youtube.com/embed/8jPAlA7cGtM",
    date: "2024-11-02",
    location: "서울 홍대 스페이스 한강",
    eventType: 'album',
    eventYear: 2024
  },
  {
    id: 5,
    title: "모모 - 이름을 모르는 먼 곳의 그대에게 서울 쇼케이스",
    description: "예진 안젤라 박과 황슬기로 구성된 재즈 듀오입니다. 재즈를 기반으로 하여 다양하고 아름다운 소리를 탐구하는 음악적 여정을 함께하고 있습니다. 재즈의 즉흥성과 실험정신을 바탕으로, 현대사회의 문제의식을 섬세하게 담아내는 것이 특징이며, 분쟁 지역의 평범한 일상과 그 속에 내재된 긴장감을 음악적으로 표현합니다.",
    youtubeUrl: "https://www.youtube.com/embed/hh-MwTiaJxk",
    date: "2024-11-02",
    location: "서울 홍대 스페이스 한강",
    eventType: 'album',
    eventYear: 2024
  },
  {
    id: 6,
    title: "자이 x HANASH - 이름을 모르는 먼 곳의 그대에게 서울 쇼케이스",
    description: "자이의 따뜻한 목소리, HANASH의 혁신적인 전자음악이 만나 새로운 음악적 가능성을 탐구하는 콜라보레이션입니다. 자이는 일상의 이야기를 슬프지만 힘 있는 목소리로 표현하며, HANASH는 세계 각국의 다양한 악기와 장르를 전자음악과 접목시키는 실험을 진행합니다. 두 아티스트의 만남은 전통과 현대의 조화로운 융합을 보여줍니다.",
    youtubeUrl: "https://www.youtube.com/embed/ka9DcFOD2fw",
    date: "2024-11-02",
    location: "서울 홍대 스페이스 한강",
    eventType: 'album',
    eventYear: 2024
  },
  // 2023 Camp Videos
  {
    id: 101,
    title: "인간띠잇기",
    description: "2023년 봄 제주해군기지 정문 앞 인간띠잇기",
    youtubeUrl: "https://www.youtube.com/watch?v=dF6raNSEkfI",
    date: "2023-06-10",
    location: "서귀포시 강정천 체육공원",
    eventType: 'camp',
    eventYear: 2023,
    thumbnailUrl: "https://i.ytimg.com/vi/dF6raNSEkfI/sddefault.jpg"
  },
  {
    id: 102,
    title: "2023 제1회 강정피스앤뮤직캠프",
    description: "강정천 체육공원에서 펼쳐진 2023 강정피스앤뮤직캠프 공연 실황입니다.",
    youtubeUrl: "https://www.youtube.com/watch?v=mPeFqepsf_Y",
    date: "2023-06-10",
    location: "서귀포시 강정천 체육공원",
    eventType: 'camp',
    eventYear: 2023,
    thumbnailUrl: "https://i.ytimg.com/vi/mPeFqepsf_Y/maxresdefault.jpg"
  },
  {
    id: 103,
    title: "3강정3종댄스",
    description: "강정천 체육공원에서 펼쳐진 3강정3종댄스입니다.",
    youtubeUrl: "https://www.youtube.com/watch?v=MzIpAmDAYzk",
    date: "2023-06-10",
    location: "서귀포시 강정천 체육공원",
    eventType: 'camp',
    eventYear: 2023,
    thumbnailUrl: "https://i.ytimg.com/vi/MzIpAmDAYzk/maxresdefault.jpg"
  },
  {
    id: 104,
    title: "2023 제1회 강정피스앤뮤직캠프",
    description: "강정천 체육공원에서 펼쳐진 2023 제1회 강정피스앤뮤직캠프 현장입니다.",
    youtubeUrl: "https://www.youtube.com/watch?v=OGKd_pnrul4",
    date: "2023-06-10",
    location: "서귀포시 강정천 체육공원",
    eventType: 'camp',
    eventYear: 2023,
    thumbnailUrl: "https://i.ytimg.com/vi/OGKd_pnrul4/maxresdefault.jpg"
  },
  {
    id: 105,
    title: "2023 제1회 강정피스앤뮤직캠프",
    description: "강정천 체육공원에서 펼쳐진 2023 제1회 강정피스앤뮤직캠프 현장입니다.",
    youtubeUrl: "https://www.youtube.com/watch?v=GHSxHVc-b1w",
    date: "2023-06-10",
    location: "서귀포시 강정천 체육공원",
    eventType: 'camp',
    eventYear: 2023,
    thumbnailUrl: "https://i.ytimg.com/vi/GHSxHVc-b1w/maxresdefault.jpg"
  },
  {
    id: 106,
    title: "2023 제1회 강정피스앤뮤직캠프",
    description: "강정천 체육공원에서 펼쳐진 2023 제1회 강정피스앤뮤직캠프 현장입니다.",
    youtubeUrl: "https://www.youtube.com/watch?v=1TyLqzoHA7M",
    date: "2023-06-10",
    location: "서귀포시 강정천 체육공원",
    eventType: 'camp',
    eventYear: 2023,
    thumbnailUrl: "https://i.ytimg.com/vi/1TyLqzoHA7M/maxresdefault.jpg"
  },
  {
    id: 107,
    title: "2023 제1회 강정피스앤뮤직캠프",
    description: "강정천 체육공원에서 펼쳐진 2023 제1회 강정피스앤뮤직캠프 현장입니다.",
    youtubeUrl: "https://www.youtube.com/watch?v=YwOO627losU",
    date: "2023-06-10",
    location: "서귀포시 강정천 체육공원",
    eventType: 'camp',
    eventYear: 2023,
    thumbnailUrl: "https://i.ytimg.com/vi/YwOO627losU/maxresdefault.jpg"
  },
  {
    id: 108,
    title: "2023 제1회 강정피스앤뮤직캠프",
    description: "강정천 체육공원에서 펼쳐진 2023 제1회 강정피스앤뮤직캠프 현장입니다.",
    youtubeUrl: "https://www.youtube.com/watch?v=RH2x3ctcBgU",
    date: "2023-06-10",
    location: "서귀포시 강정천 체육공원",
    eventType: 'camp',
    eventYear: 2023,
    thumbnailUrl: "https://i.ytimg.com/vi/RH2x3ctcBgU/maxresdefault.jpg"
  },
  {
    id: 109,
    title: "2023 제1회 강정피스앤뮤직캠프",
    description: "강정천 체육공원에서 펼쳐진 2023 제1회 강정피스앤뮤직캠프 현장입니다.",
    youtubeUrl: "https://www.youtube.com/watch?v=tFxoLxIDfyM",
    date: "2023-06-10",
    location: "서귀포시 강정천 체육공원",
    eventType: 'camp',
    eventYear: 2023,
    thumbnailUrl: "https://i.ytimg.com/vi/tFxoLxIDfyM/maxresdefault.jpg"
  },
  {
    id: 110,
    title: "2023 제1회 강정피스앤뮤직캠프",
    description: "강정천 체육공원에서 펼쳐진 2023 제1회 강정피스앤뮤직캠프 현장입니다.",
    youtubeUrl: "https://www.youtube.com/watch?v=-PhTNOVdLc0",
    date: "2023-06-10",
    location: "서귀포시 강정천 체육공원",
    eventType: 'camp',
    eventYear: 2023,
    thumbnailUrl: "https://i.ytimg.com/vi/-PhTNOVdLc0/maxresdefault.jpg"
  },
  {
    id: 111,
    title: "2023 제1회 강정피스앤뮤직캠프",
    description: "강정천 체육공원에서 펼쳐진 2023 제1회 강정피스앤뮤직캠프 현장입니다.",
    youtubeUrl: "https://www.youtube.com/watch?v=mC-HJ-VhLOQ",
    date: "2023-06-10",
    location: "서귀포시 강정천 체육공원",
    eventType: 'camp',
    eventYear: 2023,
    thumbnailUrl: "https://i.ytimg.com/vi/mC-HJ-VhLOQ/maxresdefault.jpg"
  },
  {
    id: 112,
    title: "강정피스앤뮤직캠프",
    description: "전쟁을 멈추자라는 슬로건을 내세운 강정피스앤뮤직캠프가 처음 열렸다!",
    youtubeUrl: "https://www.youtube.com/watch?v=crK6y7mJrfY",
    date: "2023-06-10",
    location: "서귀포시 강정천 체육공원",
    eventType: 'camp',
    eventYear: 2023,
    thumbnailUrl: "https://i.ytimg.com/vi/crK6y7mJrfY/maxresdefault.jpg"
  },

  // 2025 Camp Videos
  {
    id: 201,
    title: "제2회 강정피스앤뮤직캠프는 준비중!",
    description: "내일 열리는 강정피스앤뮤직캠프 여럿이서 열심히 준비하고 있습니다!",
    youtubeUrl: "https://www.youtube.com/watch?v=pcsM9lxlA24",
    date: "2025-06-14",
    location: "서귀포시 강정동 할망물식당 일대",
    eventType: 'camp',
    eventYear: 2025,
    thumbnailUrl: "https://i.ytimg.com/vi/pcsM9lxlA24/maxresdefault.jpg"
  },
  {
    id: 202,
    title: "제2회 강정피스앤뮤직캠프",
    description: "제주 강정마을에서 열리는 평화와 반전의 음악 축제",
    youtubeUrl: "https://youtu.be/DBlCTgWNNKU?si=9QRus6J85pPEqf-F",
    date: "2025-06-14",
    location: "서귀포시 강정동 할망물식당 일대",
    eventType: 'camp',
    eventYear: 2025,
    thumbnailUrl: "https://i.ytimg.com/vi/DBlCTgWNNKU/maxresdefault.jpg"
  }
];
