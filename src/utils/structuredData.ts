// Structured Data (JSON-LD) 생성 유틸리티

export interface StructuredDataProps {
  type: string;
  [key: string]: unknown;
}

type TranslationFn = (key: string) => string;

const getProjectName = (t: TranslationFn) => t('structured_data.project_name');
const getCampName = (t: TranslationFn) => t('structured_data.camp_name');
const getDescription = (t: TranslationFn) => t('structured_data.description');

// Organization Schema - 조직 정보
export const getOrganizationSchema = (_lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": t ? getProjectName(t) : '',
  "alternateName": "Peace and Music Project",
  "url": "https://peaceandmusic.net",
  "logo": "https://peaceandmusic.net/logo192.webp",
  "description": t ? getDescription(t) : '',
  "foundingDate": "2023",
  "sameAs": [
    "https://www.instagram.com/peace_music_in_gangjeong",
    "https://smartstore.naver.com/peaceandmusic",
    "https://tumblbug.com/gpmc3",
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "gpmc0625@gmail.com",
    "contactType": "customer support"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Seogwipo",
    "addressRegion": "Jeju",
    "addressCountry": "KR"
  }
});

// WebSite Schema - 웹사이트 정보
export const getWebSiteSchema = (lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": t ? getProjectName(t) : '',
  "url": "https://peaceandmusic.net",
  "description": t ? getDescription(t) : '',
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
    "name": t ? getProjectName(t) : ''
  },
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", ".typo-subtitle"]
  }
});

// MusicGroup Schema - 음악 그룹 정보
export const getMusicGroupSchema = (lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": t ? getProjectName(t) : '',
  "description": t ? t('structured_data.music_group_desc') : '',
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
}, _lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "MusicRecording",
  "name": track.name,
  "description": track.description || "",
  ...(track.duration ? { "duration": track.duration } : {}),
  "url": track.url || "https://peaceandmusic.net/tracks",
  "byArtist": {
    "@type": "MusicGroup",
    "name": t ? getProjectName(t) : ''
  }
});

// MusicPlaylist Schema - 음악 재생목록
export const getMusicPlaylistSchema = (tracks: Array<{ name: string; url?: string }>, _lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "MusicPlaylist",
  "name": t ? t('structured_data.playlist_name') : '',
  "description": t ? t('structured_data.playlist_desc') : '',
  "numTracks": tracks.length,
  "track": tracks.map(track => ({
    "@type": "MusicRecording",
    "name": track.name,
    "url": track.url || "https://peaceandmusic.net/tracks"
  }))
});

// ImageGallery Schema - 갤러리
export const getImageGallerySchema = (images: Array<{ url: string; caption?: string }>, _lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": t ? t('structured_data.gallery_name') : '',
  "description": t ? t('structured_data.gallery_desc') : '',
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
  publisher?: string;
}, _lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": article.headline,
  "description": article.description,
  "datePublished": article.datePublished,
  "url": article.url,
  "image": article.imageUrl || "https://peaceandmusic.net/og-image.webp",
  "author": {
    "@type": "Organization",
    "name": article.publisher || (t ? getProjectName(t) : '')
  },
  "publisher": {
    "@type": "Organization",
    "name": t ? getProjectName(t) : '',
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
  dateModified?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": collection.name,
  "description": collection.description,
  "url": collection.url,
  ...(collection.dateModified ? { "dateModified": collection.dateModified } : {})
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
  dateModified?: string;
  eventStatus?: string;
}, _lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": event.name,
  "startDate": event.startDate,
  "endDate": event.endDate,
  ...(event.dateModified ? { "dateModified": event.dateModified } : {}),
  "eventStatus": event.eventStatus || "https://schema.org/EventScheduled",
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
    : { "@type": "Organization", "name": t ? getCampName(t) : '' },
  "organizer": {
    "@type": "Organization",
    "name": t ? getCampName(t) : '',
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
  url?: string;
  sameAs?: string[];
}, _lang: string = 'ko', t?: TranslationFn) => ({
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
      "name": t ? getCampName(t) : ''
    },
    ...(person.url ? { "url": person.url } : {}),
    ...(person.sameAs && person.sameAs.length > 0 ? { "sameAs": person.sameAs } : {})
  }
});

// WebPage Schema with about/mentions - GEO 최적화 (AI 인용 확률 향상)
export const getWebPageSchema = (page: {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": page.name,
  "description": page.description,
  "url": page.url,
  "about": [
    { "@type": "Thing", "name": "Peace movement", "sameAs": "https://en.wikipedia.org/wiki/Peace_movement" },
    { "@type": "Place", "name": "Gangjeong Village", "sameAs": "https://en.wikipedia.org/wiki/Gangjeong" }
  ],
  "mentions": [
    { "@type": "Thing", "name": "Jeju Naval Base", "sameAs": "https://en.wikipedia.org/wiki/Jeju_Naval_Base" },
    { "@type": "Event", "name": "Anti-war movement", "sameAs": "https://en.wikipedia.org/wiki/Anti-war_movement" }
  ],
  ...(page.datePublished ? { "datePublished": page.datePublished } : {}),
  ...(page.dateModified ? { "dateModified": page.dateModified } : {})
});

// HowTo Schema - 캠프 참여 방법 (AEO 최적화)
export const getHowToSchema = (_lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": t ? t('structured_data.howto_name') : 'How to Attend Gangjeong Peace Music Camp',
  "description": t ? getDescription(t) : '',
  "step": [
    { "@type": "HowToStep", "position": 1, "name": t ? t('structured_data.howto_step1_name') : 'Check the schedule', "text": t ? t('structured_data.howto_step1_text') : 'Visit peaceandmusic.net to check the camp dates and lineup.' },
    { "@type": "HowToStep", "position": 2, "name": t ? t('structured_data.howto_step2_name') : 'Travel to Gangjeong Village', "text": t ? t('structured_data.howto_step2_text') : 'Take a bus or taxi from Jeju Airport to Gangjeong Village.' },
    { "@type": "HowToStep", "position": 3, "name": t ? t('structured_data.howto_step3_name') : 'Support the camp (optional)', "text": t ? t('structured_data.howto_step3_text') : 'Support the camp through crowdfunding at tumblbug.com/gpmc3.' },
    { "@type": "HowToStep", "position": 4, "name": t ? t('structured_data.howto_step4_name') : 'Visit Gangjeong Sports Park', "text": t ? t('structured_data.howto_step4_text') : 'Arrive at Gangjeong Sports Park and enter for free.' },
    { "@type": "HowToStep", "position": 5, "name": t ? t('structured_data.howto_step5_name') : 'Enjoy music and peace', "text": t ? t('structured_data.howto_step5_text') : 'Watch performances and share in the spirit of peace solidarity.' },
  ],
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
