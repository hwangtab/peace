// Structured Data (JSON-LD) 생성 유틸리티

export interface StructuredDataProps {
  type: string;
  [key: string]: unknown;
}

// Organization Schema - 조직 정보
export const getOrganizationSchema = (lang: string = 'ko') => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": lang === 'ko' ? "이름을 모르는 먼 곳의 그대에게" : "To You in a Distant Place Whose Name I Don't Know",
  "alternateName": "Peace and Music Project",
  "url": "https://peaceandmusic.net",
  "logo": "https://peaceandmusic.net/logo192.png",
  "description": lang === 'ko'
    ? "전쟁과 폭력이 만연한 세상에서 음악으로 평화의 메시지를 전하는 뮤지션들의 프로젝트"
    : "A project of musicians delivering a message of peace through music in a world where war and violence are prevalent",
  "foundingDate": "2024",
  "sameAs": [
    // 소셜 미디어 링크가 있다면 여기에 추가
  ]
});

// WebSite Schema - 웹사이트 정보
export const getWebSiteSchema = (lang: string = 'ko') => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": lang === 'ko' ? "이름을 모르는 먼 곳의 그대에게" : "To You in a Distant Place Whose Name I Don't Know",
  "url": "https://peaceandmusic.net",
  "description": lang === 'ko'
    ? "전쟁과 폭력이 만연한 세상에서 음악으로 평화의 메시지를 전하는 뮤지션들의 프로젝트"
    : "A project of musicians delivering a message of peace through music in a world where war and violence are prevalent",
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
    "name": lang === 'ko' ? "이름을 모르는 먼 곳의 그대에게" : "To You in a Distant Place Whose Name I Don't Know"
  }
});

// MusicGroup Schema - 음악 그룹 정보
export const getMusicGroupSchema = (lang: string = 'ko') => ({
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": lang === 'ko' ? "이름을 모르는 먼 곳의 그대에게" : "To You in a Distant Place Whose Name I Don't Know",
  "description": lang === 'ko' ? "평화를 노래하는 음악 프로젝트" : "A musical project singing for peace",
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
  "duration": track.duration || "",
  "url": track.url || "https://peaceandmusic.net/tracks",
  "byArtist": {
    "@type": "MusicGroup",
    "name": lang === 'ko' ? "이름을 모르는 먼 곳의 그대에게" : "To You in a Distant Place Whose Name I Don't Know"
  }
});

// MusicPlaylist Schema - 음악 재생목록
export const getMusicPlaylistSchema = (tracks: Array<{ name: string; url?: string }>, lang: string = 'ko') => ({
  "@context": "https://schema.org",
  "@type": "MusicPlaylist",
  "name": lang === 'ko' ? "평화를 노래하는 음악" : "Songs Singing for Peace",
  "description": lang === 'ko'
    ? "이름을 모르는 먼 곳의 그대에게 프로젝트의 음악 모음"
    : "Collection of music from the project 'To You in a Distant Place Whose Name I Don't Know'",
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
  "name": lang === 'ko' ? "갤러리" : "Gallery",
  "description": lang === 'ko'
    ? "이름을 모르는 먼 곳의 그대에게 프로젝트의 사진 갤러리"
    : "Photo gallery of the project 'To You in a Distant Place Whose Name I Don't Know'",
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
  "image": article.imageUrl || "https://peaceandmusic.net/og-image.png",
  "author": {
    "@type": "Organization",
    "name": lang === 'ko' ? "이름을 모르는 먼 곳의 그대에게" : "To You in a Distant Place Whose Name I Don't Know"
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
  "image": event.image || "https://peaceandmusic.net/og-image.png",
  "description": event.description,
  "performer": event.performers?.map(p => ({
    "@type": p.type,
    "name": p.name
  })) || {
    "@type": "Organization",
    "name": lang === 'ko' ? "강정피스앤뮤직캠프" : "Gangjeong Peace Music Camp"
  },
  "organizer": {
    "@type": "Organization",
    "name": lang === 'ko' ? "강정피스앤뮤직캠프" : "Gangjeong Peace Music Camp",
    "url": "https://peaceandmusic.net"
  }
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
    "image": person.image,
    "jobTitle": person.jobTitle || "Musician",
    "memberOf": {
      "@type": "Organization",
      "name": lang === 'ko' ? "강정피스앤뮤직캠프" : "Gangjeong Peace Music Camp"
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
