// Structured Data (JSON-LD) 생성 유틸리티

export interface StructuredDataProps {
  type: string;
  [key: string]: unknown;
}

const projectNames: Record<string, string> = {
  ko: "이름을 모르는 먼 곳의 그대에게",
  ja: "名前も知らない遠くのあなたへ",
  'zh-Hans': "致远方不知名的你",
  'zh-Hant': "致遠方不知名的你",
  en: "To You in a Distant Place Whose Name I Don't Know",
  es: "Para ti, en un lugar lejano cuyo nombre desconozco",
  fr: "À toi, dans un lieu lointain dont j'ignore le nom",
  de: "An dich, an einem fernen Ort, dessen Namen ich nicht kenne",
  pt: "Para você, em um lugar distante cujo nome desconheço",
  ru: "Тебе, в далёком месте, чьё имя мне неизвестно",
  ar: "إليك، في مكان بعيد لا أعرف اسمه",
  hi: "तुम्हें, उस दूर जगह जिसका नाम मैं नहीं जानता",
  id: "Untukmu, di tempat jauh yang tak kuketahui namanya",
};

const campNames: Record<string, string> = {
  ko: "강정피스앤뮤직캠프",
  ja: "江汀ピース＆ミュージックキャンプ",
  'zh-Hans': "江汀和平音乐营",
  'zh-Hant': "江汀和平音樂營",
  en: "Gangjeong Peace Music Camp",
  es: "Campamento de Música por la Paz de Gangjeong",
  fr: "Camp musical pour la paix de Gangjeong",
  de: "Gangjeong Friedensmusikcamp",
  pt: "Acampamento de Música pela Paz de Gangjeong",
  ru: "Музыкальный лагерь мира в Канджоне",
  ar: "مخيم كانججونغ للموسيقى والسلام",
  hi: "गांगजोंग शांति संगीत शिविर",
  id: "Kemah Musik Perdamaian Gangjeong",
};

const descriptions: Record<string, string> = {
  ko: "전쟁과 폭력이 만연한 세상에서 음악으로 평화의 메시지를 전하는 뮤지션들의 프로젝트",
  ja: "戦争と暴力が蔓延する世界で、音楽を通じて平和のメッセージを届けるミュージシャンたちのプロジェクト",
  'zh-Hans': "在战争与暴力盛行的世界中，通过音乐传递和平信息的音乐人项目",
  'zh-Hant': "在戰爭與暴力盛行的世界中，透過音樂傳遞和平訊息的音樂人計畫",
  en: "A project of musicians delivering a message of peace through music in a world where war and violence are prevalent",
  es: "Un proyecto de músicos que transmiten un mensaje de paz a través de la música en un mundo donde prevalecen la guerra y la violencia",
  fr: "Un projet de musiciens portant un message de paix à travers la musique dans un monde où la guerre et la violence prédominent",
  de: "Ein Projekt von Musikern, die in einer von Krieg und Gewalt geprägten Welt eine Botschaft des Friedens durch Musik vermitteln",
  pt: "Um projeto de músicos que transmitem uma mensagem de paz através da música em um mundo onde a guerra e a violência prevalecem",
  ru: "Проект музыкантов, несущих послание мира через музыку в мире, где царят война и насилие",
  ar: "مشروع لموسيقيين ينقلون رسالة سلام من خلال الموسيقى في عالم يسوده الحرب والعنف",
  hi: "युद्ध और हिंसा से भरी दुनिया में संगीत के माध्यम से शांति का संदेश देने वाले संगीतकारों का प्रोजेक्ट",
  id: "Proyek musisi yang menyampaikan pesan perdamaian melalui musik di dunia yang penuh perang dan kekerasan",
};

const getProjectName = (lang: string) => projectNames[lang] || projectNames.en;
const getCampName = (lang: string) => campNames[lang] || campNames.en;
const getDescription = (lang: string) => descriptions[lang] || descriptions.en;

// Organization Schema - 조직 정보
export const getOrganizationSchema = (lang: string = 'ko') => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": getProjectName(lang),
  "alternateName": "Peace and Music Project",
  "url": "https://peaceandmusic.net",
  "logo": "https://peaceandmusic.net/logo192.webp",
  "description": getDescription(lang),
  "foundingDate": "2024",
  "sameAs": [
    // 소셜 미디어 링크가 있다면 여기에 추가
  ]
});

// WebSite Schema - 웹사이트 정보
export const getWebSiteSchema = (lang: string = 'ko') => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": getProjectName(lang),
  "url": "https://peaceandmusic.net",
  "description": getDescription(lang),
  "inLanguage": ({
    ko: "ko-KR",
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    pt: "pt-PT",
    ru: "ru-RU",
    ar: "ar",
    ja: "ja-JP",
    "zh-Hans": "zh-Hans",
    "zh-Hant": "zh-Hant",
    hi: "hi-IN",
    id: "id-ID"
  } as Record<string, string>)[lang] || "en-US",
  "publisher": {
    "@type": "Organization",
    "name": getProjectName(lang)
  }
});

// MusicGroup Schema - 음악 그룹 정보
export const getMusicGroupSchema = (lang: string = 'ko') => ({
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": getProjectName(lang),
  "description": ({
    ko: "평화를 노래하는 음악 프로젝트",
    ja: "平和を歌う音楽プロジェクト",
    'zh-Hans': "为和平歌唱的音乐项目",
    'zh-Hant': "為和平歌唱的音樂計畫",
  } as Record<string, string>)[lang] || "A musical project singing for peace",
  "genre": lang === 'ko' ? ["평화운동", "사회운동", "인디음악"] : ["Peace Movement", "Social Movement", "Indie Music"],
  "url": "https://peaceandmusic.net"
});

// BreadcrumbList Schema - 페이지 계층 구조
export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// FAQPage Schema - 자주 묻는 질문 (AI 추천 확률 향상)
export const getFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// MusicRecording Schema - 개별 음악 트랙
export const getMusicRecordingSchema = (track: {
  name: string;
  description?: string;
  duration?: string;
  url?: string;
}, lang: string = 'ko') => ({
  "@context": "https://schema.org",
  "@type": "MusicRecording",
  "name": track.name,
  "description": track.description || "",
  ...(track.duration ? { "duration": track.duration } : {}),
  "url": track.url || "https://peaceandmusic.net/tracks",
  "byArtist": {
    "@type": "MusicGroup",
    "name": getProjectName(lang)
  }
});

// MusicPlaylist Schema - 음악 재생목록
export const getMusicPlaylistSchema = (tracks: Array<{ name: string; url?: string }>, lang: string = 'ko') => ({
  "@context": "https://schema.org",
  "@type": "MusicPlaylist",
  "name": ({
    ko: "평화를 노래하는 음악",
    ja: "平和を歌う音楽",
    'zh-Hans': "为和平歌唱的音乐",
    'zh-Hant': "為和平歌唱的音樂",
    es: "Canciones que cantan por la paz",
    fr: "Chansons pour la paix",
    de: "Lieder für den Frieden",
    pt: "Canções pela paz",
    ru: "Песни о мире",
    ar: "أغانٍ تغني للسلام",
    hi: "शांति के लिए गीत",
    id: "Lagu-lagu untuk perdamaian",
  } as Record<string, string>)[lang] || "Songs Singing for Peace",
  "description": ({
    ko: "이름을 모르는 먼 곳의 그대에게 프로젝트의 음악 모음",
    ja: "「名前も知らない遠くのあなたへ」プロジェクトの音楽コレクション",
    'zh-Hans': '\u201c致远方不知名的你\u201d项目音乐合辑',
    'zh-Hant': '「致遠方不知名的你」計畫音樂合輯',
  } as Record<string, string>)[lang] || "Collection of music from the project 'To You in a Distant Place Whose Name I Don't Know'",
  "numTracks": tracks.length,
  "track": tracks.map(track => ({
    "@type": "MusicRecording",
    "name": track.name,
    "url": track.url || "https://peaceandmusic.net/tracks"
  }))
});

// ImageGallery Schema - 갤러리
export const getImageGallerySchema = (images: Array<{ url: string; caption?: string }>, lang: string = 'ko') => ({
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": ({
    ko: "갤러리",
    ja: "ギャラリー",
    'zh-Hans': "画廊",
    'zh-Hant': "畫廊",
    es: "Galería",
    fr: "Galerie",
    de: "Galerie",
    pt: "Galeria",
    ru: "Галерея",
    ar: "معرض الصور",
    hi: "गैलरी",
    id: "Galeri",
  } as Record<string, string>)[lang] || "Gallery",
  "description": ({
    ko: "이름을 모르는 먼 곳의 그대에게 프로젝트의 사진 갤러리",
    ja: "「名前も知らない遠くのあなたへ」プロジェクトのフォトギャラリー",
    'zh-Hans': '\u201c致远方不知名的你\u201d项目照片集',
    'zh-Hant': '「致遠方不知名的你」計畫照片集',
  } as Record<string, string>)[lang] || "Photo gallery of the project 'To You in a Distant Place Whose Name I Don't Know'",
  "image": images.map(img => ({
    "@type": "ImageObject",
    "url": img.url,
    "caption": img.caption || ""
  }))
});

// NewsArticle Schema - 언론 보도
export const getNewsArticleSchema = (article: {
  headline: string;
  description: string;
  datePublished: string;
  url: string;
  imageUrl?: string;
}, lang: string = 'ko') => ({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": article.headline,
  "description": article.description,
  "datePublished": article.datePublished,
  "url": article.url,
  "image": article.imageUrl || "https://peaceandmusic.net/og-image.webp",
  "author": {
    "@type": "Organization",
    "name": getProjectName(lang)
  },
  "publisher": {
    "@type": "Organization",
    "name": getProjectName(lang),
    "logo": {
      "@type": "ImageObject",
      "url": "https://peaceandmusic.net/logo192.webp"
    }
  }
});

// CollectionPage Schema - 컬렉션 페이지 (뮤지션, 트랙 등)
export const getCollectionPageSchema = (collection: {
  name: string;
  description: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": collection.name,
  "description": collection.description,
  "url": collection.url
});
// Event Schema - 공연/캠프 정보
export const getEventSchema = (event: {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  location: {
    name: string;
    address: string;
  };
  image?: string;
  performers?: Array<{ type: 'Person' | 'MusicGroup'; name: string }>;
  offers?: {
    url: string;
    price?: string;
    priceCurrency?: string;
    availability?: string;
  };
}, lang: string = 'ko') => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": event.name,
  "startDate": event.startDate,
  "endDate": event.endDate,
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": event.location.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": event.location.address,
      "addressCountry": "KR"
    }
  },
  "image": event.image || "https://peaceandmusic.net/og-image.webp",
  "description": event.description,
  "performer": (event.performers && event.performers.length > 0)
    ? event.performers.map(p => ({ "@type": p.type, "name": p.name }))
    : { "@type": "Organization", "name": getCampName(lang) },
  "organizer": {
    "@type": "Organization",
    "name": getCampName(lang),
    "url": "https://peaceandmusic.net"
  },
  ...(event.offers ? {
    "offers": {
      "@type": "Offer",
      "url": event.offers.url,
      "price": event.offers.price || "0",
      "priceCurrency": event.offers.priceCurrency || "KRW",
      "availability": event.offers.availability || "https://schema.org/InStock"
    }
  } : {})
});

// ProfilePage Schema - 뮤지션 프로필 페이지
export const getProfilePageSchema = (person: {
  name: string;
  description: string;
  image?: string;
  jobTitle?: string;
}, lang: string = 'ko') => ({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "mainEntity": {
    "@type": "Person",
    "name": person.name,
    "description": person.description,
    ...(person.image ? { "image": person.image } : {}),
    "jobTitle": person.jobTitle || "Musician",
    "memberOf": {
      "@type": "Organization",
      "name": getCampName(lang)
    }
  }
});

// MusicAlbum Schema - 음악 앨범
export const getMusicAlbumSchema = (album: {
  name: string;
  byArtist: { name: string };
  genre: string[];
  track?: Array<{ name: string; url?: string; duration?: string }>;
  image?: string;
  datePublished?: string;
  numTracks?: number;
}) => ({
  "@context": "https://schema.org",
  "@type": "MusicAlbum",
  "name": album.name,
  "byArtist": {
    "@type": "MusicGroup",
    "name": album.byArtist.name
  },
  "genre": album.genre,
  "image": album.image,
  "datePublished": album.datePublished,
  "numTracks": album.numTracks || (album.track ? album.track.length : 0),
  "track": album.track?.map(t => ({
    "@type": "MusicRecording",
    "name": t.name,
    "duration": t.duration,
    "url": t.url
  }))
});
