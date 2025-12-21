// Structured Data (JSON-LD) 생성 유틸리티

export interface StructuredDataProps {
  type: string;
  [key: string]: unknown;
}

// Organization Schema - 조직 정보
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "이름을 모르는 먼 곳의 그대에게",
  "alternateName": "Peace and Music Project",
  "url": "https://peaceandmusic.net",
  "logo": "https://peaceandmusic.net/logo192.png",
  "description": "전쟁과 폭력이 만연한 세상에서 음악으로 평화의 메시지를 전하는 뮤지션들의 프로젝트",
  "foundingDate": "2024",
  "sameAs": [
    // 소셜 미디어 링크가 있다면 여기에 추가
  ]
});

// WebSite Schema - 웹사이트 정보
export const getWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "이름을 모르는 먼 곳의 그대에게",
  "url": "https://peaceandmusic.net",
  "description": "전쟁과 폭력이 만연한 세상에서 음악으로 평화의 메시지를 전하는 뮤지션들의 프로젝트",
  "inLanguage": "ko-KR",
  "publisher": {
    "@type": "Organization",
    "name": "이름을 모르는 먼 곳의 그대에게"
  }
});

// MusicGroup Schema - 음악 그룹 정보
export const getMusicGroupSchema = () => ({
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": "이름을 모르는 먼 곳의 그대에게",
  "description": "평화를 노래하는 음악 프로젝트",
  "genre": ["평화운동", "사회운동", "인디음악"],
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
}) => ({
  "@context": "https://schema.org",
  "@type": "MusicRecording",
  "name": track.name,
  "description": track.description || "",
  "duration": track.duration || "",
  "url": track.url || "https://peaceandmusic.net/tracks",
  "byArtist": {
    "@type": "MusicGroup",
    "name": "이름을 모르는 먼 곳의 그대에게"
  }
});

// MusicPlaylist Schema - 음악 재생목록
export const getMusicPlaylistSchema = (tracks: Array<{ name: string; url?: string }>) => ({
  "@context": "https://schema.org",
  "@type": "MusicPlaylist",
  "name": "평화를 노래하는 음악",
  "description": "이름을 모르는 먼 곳의 그대에게 프로젝트의 음악 모음",
  "numTracks": tracks.length,
  "track": tracks.map(track => ({
    "@type": "MusicRecording",
    "name": track.name,
    "url": track.url || "https://peaceandmusic.net/tracks"
  }))
});

// ImageGallery Schema - 갤러리
export const getImageGallerySchema = (images: Array<{ url: string; caption?: string }>) => ({
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "갤러리",
  "description": "이름을 모르는 먼 곳의 그대에게 프로젝트의 사진 갤러리",
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
}) => ({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": article.headline,
  "description": article.description,
  "datePublished": article.datePublished,
  "url": article.url,
  "image": article.imageUrl || "https://peaceandmusic.net/og-image.png",
  "author": {
    "@type": "Organization",
    "name": "이름을 모르는 먼 곳의 그대에게"
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
