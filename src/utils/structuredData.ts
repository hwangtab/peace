// Structured Data (JSON-LD) 생성 유틸리티

export interface StructuredDataProps {
  type: string;
  [key: string]: unknown;
}

type TranslationFn = (key: string) => string;

// "M:SS" 또는 "MM:SS" 형식을 ISO 8601 duration 형식("PTnMnS")으로 변환
const durationToISO8601 = (duration: string): string => {
  const parts = duration.split(':');
  if (parts.length !== 2) return duration;
  const minutes = parseInt(parts[0] ?? '', 10);
  const seconds = parseInt(parts[1] ?? '', 10);
  if (isNaN(minutes) || isNaN(seconds)) return duration;
  return `PT${minutes}M${seconds}S`;
};

const getProjectName = (t: TranslationFn) => t('structured_data.project_name');
const getCampName = (t: TranslationFn) => t('structured_data.camp_name');
const getDescription = (t: TranslationFn) => t('structured_data.description');

// Organization Schema - 조직 정보
export const getOrganizationSchema = (_lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://peaceandmusic.net/#organization",
  "name": t ? getProjectName(t) : '',
  "alternateName": "Peace and Music Project",
  "url": "https://peaceandmusic.net",
  "logo": {
    "@type": "ImageObject",
    "url": "https://peaceandmusic.net/logo192.webp",
    "width": 192,
    "height": 192
  },
  "description": t ? getDescription(t) : '',
  "foundingDate": "2023",
  "sameAs": [
    "https://www.instagram.com/peace_music_in_gangjeong",
    "https://smartstore.naver.com/peaceandmusic",
    "https://tumblbug.com/gpmc3",
  ],
  "knowsAbout": [
    "Peace movement",
    "Gangjeong Village",
    "Jeju Naval Base controversy",
    "Korean independent music",
    "Anti-war music festival"
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
  },
  "areaServed": [
    {
      "@type": "Country",
      "name": "South Korea",
      "sameAs": "https://en.wikipedia.org/wiki/South_Korea"
    },
    {
      "@type": "Place",
      "name": "Gangjeong Village, Jeju",
      "sameAs": "https://en.wikipedia.org/wiki/Gangjeong"
    }
  ],
  "event": {
    "@type": "MusicEvent",
    "@id": "https://peaceandmusic.net/camps/2026#event",
    "name": t ? t('camp.title_2026') : '제3회 강정피스앤뮤직캠프',
    "url": "https://peaceandmusic.net/camps/2026"
  }
});

// WebSite Schema - 웹사이트 정보
export const getWebSiteSchema = (lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://peaceandmusic.net/#website",
  "name": t ? getProjectName(t) : '',
  "url": "https://peaceandmusic.net",
  "description": t ? getDescription(t) : '',
  "inLanguage": ["ko-KR", "en-US", "es-ES", "fr-FR", "de-DE", "pt-PT", "ru-RU", "ar", "ja-JP", "zh-Hans", "zh-Hant", "hi-IN", "id-ID"],
  "publisher": {
    "@type": "Organization",
    "@id": "https://peaceandmusic.net/#organization",
    "name": t ? getProjectName(t) : ''
  },
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", ".typo-subtitle"]
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://peaceandmusic.net/videos?filter={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
});

// MusicGroup Schema - 음악 그룹 정보
export const getMusicGroupSchema = (lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "@id": "https://peaceandmusic.net/#music-group",
  "name": t ? getProjectName(t) : '',
  "description": t ? t('structured_data.music_group_desc') : '',
  "genre": lang === 'ko' ? ["평화운동", "사회운동", "인디음악"] : ["Peace Movement", "Social Movement", "Indie Music"],
  "url": "https://peaceandmusic.net",
  "image": "https://peaceandmusic.net/images-webp/camps/2023/IMG_2064.webp",
  "foundingDate": "2023",
  "sameAs": [
    "https://www.instagram.com/peace_music_in_gangjeong",
    "https://smartstore.naver.com/peaceandmusic"
  ]
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
  inAlbum?: { name: string; url?: string };
  byArtist?: { name: string; url?: string };
}, _lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "MusicRecording",
  ...(track.url ? { "@id": track.url } : {}),
  "name": track.name,
  "description": track.description || "",
  ...(track.duration ? { "duration": durationToISO8601(track.duration) } : {}),
  "url": track.url || "https://peaceandmusic.net/tracks",
  "byArtist": track.byArtist
    ? { "@type": "Person", "name": track.byArtist.name, ...(track.byArtist.url ? { "url": track.byArtist.url } : {}) }
    : { "@type": "MusicGroup", "name": t ? getProjectName(t) : '' },
  ...(track.inAlbum ? {
    "inAlbum": {
      "@type": "MusicAlbum",
      "@id": "https://peaceandmusic.net/album/about#album",
      "name": track.inAlbum.name,
      ...(track.inAlbum.url ? { "url": track.inAlbum.url } : {})
    }
  } : {})
});

// MusicPlaylist Schema - 음악 재생목록
export const getMusicPlaylistSchema = (tracks: Array<{ name: string; url?: string; duration?: string }>, _lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "MusicPlaylist",
  "@id": "https://peaceandmusic.net/album/tracks#playlist",
  "name": t ? t('structured_data.playlist_name') : '',
  "description": t ? t('structured_data.playlist_desc') : '',
  "url": "https://peaceandmusic.net/album/tracks",
  "numTracks": tracks.length,
  "track": tracks.map(track => ({
    "@type": "MusicRecording",
    ...(track.url ? { "@id": track.url } : {}),
    "name": track.name,
    "url": track.url || "https://peaceandmusic.net/tracks",
    ...(track.duration ? { "duration": durationToISO8601(track.duration) } : {}),
  }))
});

// ImageGallery Schema - 갤러리
export const getImageGallerySchema = (images: Array<{ url: string; caption?: string }>, _lang: string = 'ko', t?: TranslationFn, totalCount?: number) => ({
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": t ? t('structured_data.gallery_name') : '',
  "description": t ? t('structured_data.gallery_desc') : '',
  "numberOfItems": totalCount ?? images.length,
  "image": images.map((img, idx) => ({
    "@type": "ImageObject",
    "@id": `${img.url}#image-${idx}`,
    "url": img.url,
    "caption": img.caption || ""
  }))
});

const normalizeDate = (d: string): string => {
  const m = d.match(/^(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})$/);
  return m ? `${m[1]}-${m[2]!.padStart(2, '0')}-${m[3]!.padStart(2, '0')}` : d;
};

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
  "datePublished": normalizeDate(article.datePublished),
  "url": article.url,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://peaceandmusic.net/press"
  },
  "image": article.imageUrl || "https://peaceandmusic.net/og-image.webp",
  "author": {
    "@type": "Organization",
    "@id": "https://peaceandmusic.net/#organization",
    "name": article.publisher || (t ? getProjectName(t) : '')
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://peaceandmusic.net/#organization",
    "name": t ? getProjectName(t) : '',
    "logo": {
      "@type": "ImageObject",
      "url": "https://peaceandmusic.net/logo192.webp",
      "width": 192,
      "height": 192
    }
  },
  "isAccessibleForFree": true,
  "isPartOf": {
    "@type": "WebSite",
    "@id": "https://peaceandmusic.net/#website"
  }
});

// CollectionPage Schema - 컬렉션 페이지 (뮤지션, 트랙 등)
export const getCollectionPageSchema = (collection: {
  name: string;
  description: string;
  url: string;
  dateModified?: string;
  hasPart?: Array<{ "@id": string }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": collection.name,
  "description": collection.description,
  "url": collection.url,
  ...(collection.hasPart && collection.hasPart.length > 0 ? {
    "hasPart": collection.hasPart,
    "numberOfItems": collection.hasPart.length
  } : {}),
  ...(collection.dateModified ? { "dateModified": collection.dateModified } : {})
});

// SubEvent input - 공연 내 개별 공연(subEvent) 입력 타입
interface SubEventInput {
  name: string;
  startDate: string; // ISO 8601
  endDate: string;
  performerName: string;
  performerUrl?: string;
  id?: string;                      // optional custom @id; else auto-generated
  description?: string;             // optional per-act description
  performerSameAs?: string[];       // Instagram/YouTube URLs
  image?: string;                   // absolute URL to musician profile image (also used for performer)
  url?: string;                     // canonical URL for this specific act (e.g. page#act-anchor)
}

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
  images?: string[];
  alternateName?: string | string[];
  previousEvent?:
    | { "@id": string; name: string; startDate?: string }
    | Array<{ "@id": string; name: string; startDate?: string }>;
  isFamilyFriendly?: boolean;
  typicalAgeRange?: string;
  maximumAttendeeCapacity?: number;
  performers?: Array<{ type: 'Person' | 'MusicGroup'; name: string; url?: string }>;
  offers?: {
    url: string;
    price?: string;
    priceCurrency?: string;
    availability?: string;
    validFrom?: string;
    validThrough?: string;
  };
  dateModified?: string;
  eventStatus?: string;
  subEvents?: SubEventInput[];
  url?: string;
  doorTime?: string;
  id?: string;                       // explicit @id for the main event (defaults to `${url}#event`)
  superEventId?: string;             // reference to parent EventSeries @id
}, _lang: string = 'ko', t?: TranslationFn) => {
  const location = {
    "@type": "Place",
    "@id": "https://peaceandmusic.net/#gangjeong-sports-park",
    "name": event.location.name,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "33.2247",
      "longitude": "126.5664"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": event.location.address,
      "addressLocality": "Seogwipo",
      "addressRegion": "Jeju",
      "addressCountry": "KR"
    }
  };

  const eventId = event.id ?? (event.url ? `${event.url}#event` : undefined);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    ...(eventId ? { "@id": eventId } : {}),
    ...(event.superEventId ? { "superEvent": { "@id": event.superEventId } } : {}),
    "name": event.name,
    ...(event.alternateName ? { "alternateName": event.alternateName } : {}),
    "startDate": event.startDate,
    "endDate": event.endDate,
    ...(event.dateModified ? { "dateModified": event.dateModified } : {}),
    "eventStatus": event.eventStatus || "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": location,
    "image":
      event.images && event.images.length > 0
        ? event.images
        : (event.image || "https://peaceandmusic.net/og-image.webp"),
    "description": event.description,
    "isAccessibleForFree": true,
    "inLanguage": _lang === 'ko' ? 'ko' : _lang,
    "audience": {
      "@type": "Audience",
      "audienceType": t ? t('structured_data.audience_general') : "General audience"
    },
    ...(event.isFamilyFriendly !== undefined ? { "isFamilyFriendly": event.isFamilyFriendly } : {}),
    ...(event.typicalAgeRange ? { "typicalAgeRange": event.typicalAgeRange } : {}),
    ...(event.maximumAttendeeCapacity ? { "maximumAttendeeCapacity": event.maximumAttendeeCapacity } : {}),
    ...(event.previousEvent ? { "previousEvent": event.previousEvent } : {}),
    ...(event.doorTime ? { "doorTime": event.doorTime } : {}),
    "about": [
      { "@type": "Thing", "name": "Peace movement", "sameAs": "https://en.wikipedia.org/wiki/Peace_movement" },
      { "@type": "Place", "name": "Gangjeong Village", "sameAs": "https://en.wikipedia.org/wiki/Gangjeong" }
    ],
    "performer": (event.performers && event.performers.length > 0)
      ? event.performers.map(p => ({ "@type": p.type, "name": p.name, ...(p.url ? { "url": p.url } : {}) }))
      : { "@type": "Organization", "name": t ? getCampName(t) : '' },
    "organizer": {
      "@type": "Organization",
      "@id": "https://peaceandmusic.net/#organization",
      "name": t ? getCampName(t) : '',
      "url": "https://peaceandmusic.net",
      "sameAs": [
        "https://www.instagram.com/peace_music_in_gangjeong",
        "https://tumblbug.com/gpmc3"
      ]
    },
    ...(event.offers ? {
      "offers": {
        "@type": "Offer",
        "url": event.offers.url,
        "price": event.offers.price || "0",
        "priceCurrency": event.offers.priceCurrency || "KRW",
        "availability": event.offers.availability || "https://schema.org/InStock",
        ...(event.offers.validFrom ? { "validFrom": event.offers.validFrom } : {}),
        ...(event.offers.validThrough ? { "validThrough": event.offers.validThrough } : {})
      }
    } : {})
  };

  if (event.subEvents && event.subEvents.length > 0) {
    schema.subEvent = event.subEvents.map((se, idx) => ({
      "@type": "MusicEvent",
      ...(se.id ? { "@id": se.id } : { "@id": `${event.url ?? 'https://peaceandmusic.net/camps/2026'}#act-${idx + 1}` }),
      "name": se.name,
      "startDate": se.startDate,
      "endDate": se.endDate,
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": location,
      ...(se.image ? { "image": se.image } : {}),
      ...(se.url ? { "url": se.url } : {}),
      "isAccessibleForFree": true,
      "inLanguage": _lang === 'ko' ? 'ko' : _lang,
      "performer": {
        "@type": "MusicGroup",
        "name": se.performerName,
        ...(se.performerUrl ? { "url": se.performerUrl } : {}),
        ...(se.performerSameAs && se.performerSameAs.length > 0 ? { "sameAs": se.performerSameAs } : {}),
        ...(se.image ? { "image": se.image } : {})
      },
      "organizer": {
        "@type": "Organization",
        "@id": "https://peaceandmusic.net/#organization",
        "name": t ? getCampName(t) : '',
        "url": "https://peaceandmusic.net"
      },
      ...(event.offers ? {
        "offers": {
          "@type": "Offer",
          "url": event.offers.url,
          "price": event.offers.price || "0",
          "priceCurrency": event.offers.priceCurrency || "KRW",
          "availability": event.offers.availability || "https://schema.org/InStock",
          ...(event.offers.validFrom ? { "validFrom": event.offers.validFrom } : {}),
          ...(event.offers.validThrough ? { "validThrough": event.offers.validThrough } : {})
        }
      } : {}),
      ...(se.description ? { "description": se.description } : {})
    }));
  }

  return schema;
};

// ProfilePage Schema - 뮤지션 프로필 페이지
export const getProfilePageSchema = (person: {
  name: string;
  description: string;
  image?: string;
  jobTitle?: string;
  url?: string;
  sameAs?: string[];
  genre?: string[];
}, _lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  ...(person.url ? { "@id": person.url } : {}),
  "mainEntity": {
    "@type": "Person",
    "name": person.name,
    "description": person.description,
    ...(person.image ? { "image": person.image } : {}),
    "jobTitle": person.jobTitle || "Musician",
    ...(person.genre && person.genre.length > 0 ? { "genre": person.genre, "knowsAbout": person.genre } : {}),
    "memberOf": {
      "@type": "Organization",
      "@id": "https://peaceandmusic.net/#organization",
      "name": t ? getCampName(t) : ''
    },
    ...(person.url ? { "url": person.url } : {}),
    ...(person.sameAs && person.sameAs.length > 0 ? { "sameAs": person.sameAs } : {})
  }
});

// WebPage Schema with about/mentions/speakable - GEO 최적화 (AI 인용 확률 향상)
export const getWebPageSchema = (page: {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  mainEntityId?: string;          // e.g. "https://peaceandmusic.net/camps/2026#event"
  id?: string;                    // explicit @id for this WebPage (defaults to url + "#webpage")
  primaryImageUrl?: string;       // absolute URL for primaryImageOfPage
}) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": page.id ?? `${page.url}#webpage`,
  "name": page.name,
  "description": page.description,
  "url": page.url,
  "isPartOf": { "@id": "https://peaceandmusic.net/#website" },
  "publisher": { "@id": "https://peaceandmusic.net/#organization" },
  "copyrightHolder": { "@id": "https://peaceandmusic.net/#organization" },
  "copyrightYear": 2024,
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [
      "h1",
      ".typo-subtitle",
      "h2:first-of-type",
      "[data-speakable]",
      ".seo-summary"
    ]
  },
  "about": [
    { "@type": "Thing", "name": "Peace movement", "sameAs": "https://en.wikipedia.org/wiki/Peace_movement" },
    { "@type": "Place", "name": "Gangjeong Village", "sameAs": "https://en.wikipedia.org/wiki/Gangjeong" }
  ],
  "mentions": [
    { "@type": "Thing", "name": "Jeju Naval Base", "sameAs": "https://en.wikipedia.org/wiki/Jeju_Naval_Base" },
    { "@type": "Event", "name": "Anti-war movement", "sameAs": "https://en.wikipedia.org/wiki/Anti-war_movement" }
  ],
  ...(page.mainEntityId ? { "mainEntity": { "@id": page.mainEntityId } } : {}),
  ...(page.primaryImageUrl ? {
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": page.primaryImageUrl
    }
  } : {}),
  ...(page.datePublished ? { "datePublished": page.datePublished } : {}),
  ...(page.dateModified ? { "dateModified": page.dateModified } : {})
});

// EventSeries Schema - 연례 시리즈 이벤트 (2023, 2025, 2026)
export const getEventSeriesSchema = (series: {
  name: string;
  description: string;
  url?: string;
  events: Array<{
    "@id": string;
    name: string;
    startDate: string;
    endDate?: string;
    url?: string;
  }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "EventSeries",
  "@id": "https://peaceandmusic.net/#event-series",
  "name": series.name,
  "description": series.description,
  ...(series.url ? { "url": series.url } : {}),
  "organizer": { "@id": "https://peaceandmusic.net/#organization" },
  "location": { "@id": "https://peaceandmusic.net/#gangjeong-sports-park" },
  "subEvent": series.events.map((e) => ({
    "@type": "MusicEvent",
    "@id": e["@id"],
    "name": e.name,
    "startDate": e.startDate,
    ...(e.endDate ? { "endDate": e.endDate } : {}),
    ...(e.url ? { "url": e.url } : {})
  }))
});

// ItemList Schema - 타임테이블의 순서 있는 리스트 (AI 엔진에 명시적 신호)
export const getItemListSchema = (list: {
  name: string;
  description?: string;
  url?: string;
  items: Array<{
    position: number;
    name: string;
    url?: string;
    image?: string;
    startDate?: string;
  }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": list.name,
  ...(list.description ? { "description": list.description } : {}),
  ...(list.url ? { "url": list.url } : {}),
  "numberOfItems": list.items.length,
  "itemListOrder": "https://schema.org/ItemListOrderAscending",
  "itemListElement": list.items.map((item) => ({
    "@type": "ListItem",
    "position": item.position,
    ...(item.url ? { "url": item.url } : {}),
    "item": {
      "@type": "MusicEvent",
      "name": item.name,
      ...(item.url ? { "url": item.url } : {}),
      ...(item.image ? { "image": item.image } : {}),
      ...(item.startDate ? { "startDate": item.startDate } : {}),
    }
  }))
});

// HowTo Schema - 캠프 참여 방법 (AEO 최적화)
export const getHowToSchema = (_lang: string = 'ko', t?: TranslationFn) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": t ? t('structured_data.howto_name') : 'How to Attend Gangjeong Peace Music Camp',
  "description": t ? getDescription(t) : '',
  "step": [
    { "@type": "HowToStep", "position": 1, "name": t ? t('structured_data.howto_step1_name') : 'Check the schedule', "text": t ? t('structured_data.howto_step1_text') : 'Visit peaceandmusic.net to check the camp dates and lineup.', "url": "https://peaceandmusic.net/camps/2026" },
    { "@type": "HowToStep", "position": 2, "name": t ? t('structured_data.howto_step2_name') : 'Travel to Gangjeong Village', "text": t ? t('structured_data.howto_step2_text') : 'Take a bus or taxi from Jeju Airport to Gangjeong Village.', "url": "https://peaceandmusic.net/camps/2026" },
    { "@type": "HowToStep", "position": 3, "name": t ? t('structured_data.howto_step3_name') : 'Support the camp (optional)', "text": t ? t('structured_data.howto_step3_text') : 'Support the camp through crowdfunding at tumblbug.com/gpmc3.', "url": "https://peaceandmusic.net/camps/2026" },
    { "@type": "HowToStep", "position": 4, "name": t ? t('structured_data.howto_step4_name') : 'Visit Gangjeong Sports Park', "text": t ? t('structured_data.howto_step4_text') : 'Arrive at Gangjeong Sports Park and enter for free.', "url": "https://peaceandmusic.net/camps/2026" },
    { "@type": "HowToStep", "position": 5, "name": t ? t('structured_data.howto_step5_name') : 'Enjoy music and peace', "text": t ? t('structured_data.howto_step5_text') : 'Watch performances and share in the spirit of peace solidarity.', "url": "https://peaceandmusic.net/gallery" },
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
  "@id": "https://peaceandmusic.net/album/about#album",
  "name": album.name,
  "byArtist": {
    "@type": "MusicGroup",
    "@id": "https://peaceandmusic.net/#music-group",
    "name": album.byArtist.name
  },
  "genre": album.genre,
  "image": album.image,
  "datePublished": album.datePublished,
  "albumProductionType": "https://schema.org/StudioAlbum",
  "albumReleaseType": "https://schema.org/AlbumRelease",
  "numTracks": album.numTracks || (album.track ? album.track.length : 0),
  "offers": {
    "@type": "Offer",
    "url": "https://smartstore.naver.com/peaceandmusic",
    "priceCurrency": "KRW",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "@id": "https://peaceandmusic.net/#organization"
    }
  },
  "track": album.track?.map(t => ({
    "@type": "MusicRecording",
    ...(t.url ? { "@id": t.url } : {}),
    "name": t.name,
    ...(t.duration ? { "duration": durationToISO8601(t.duration) } : {}),
    "url": t.url
  }))
});

// VideoObject Schema - YouTube 동영상
export const getVideoObjectSchema = (video: {
  name: string;
  description: string;
  youtubeUrl: string;
  uploadDate: string;
  id?: string;
  duration?: string;
}, t?: TranslationFn) => {
  const videoId = video.youtubeUrl.split('/embed/')[1]?.split('?')[0] ?? '';
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `https://peaceandmusic.net/videos#video-${video.id ?? videoId}`,
    "name": video.name,
    "description": video.description,
    "thumbnailUrl": `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    "uploadDate": video.uploadDate,
    "embedUrl": video.youtubeUrl,
    "url": `https://www.youtube.com/watch?v=${videoId}`,
    ...(video.duration ? { "duration": durationToISO8601(video.duration) } : {}),
    "publisher": {
      "@type": "Organization",
      "@id": "https://peaceandmusic.net/#organization",
      "name": t ? getProjectName(t) : "강정피스앤뮤직캠프",
      "url": "https://peaceandmusic.net"
    }
  };
};
