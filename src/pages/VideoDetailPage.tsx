import React from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import Image from 'next/image';
import { VideoItem } from '@/types/video';
import { Musician } from '@/types/musician';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/layout/Section';
import SectionHeader from '@/components/common/SectionHeader';
import Button from '@/components/common/Button';
import {
  getVideoObjectSchema,
  getBreadcrumbSchema,
  getWebPageSchema,
} from '@/utils/structuredData';
import { getFullUrl } from '@/config/env';
import { camps } from '@/data/camps';

interface VideoDetailPageProps {
  video: VideoItem;
  relatedMusicians: Musician[];
  moreVideos: VideoItem[];
}

const getYoutubeVideoId = (url: string): string => {
  if (url.includes('/embed/')) {
    return url.split('/embed/')[1]?.split('?')[0] || '';
  }
  if (url.includes('watch?v=')) {
    return url.split('watch?v=')[1]?.split('&')[0] || '';
  }
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1]?.split('?')[0] || '';
  }
  return url.split('/').pop() || '';
};

const CAMP_2026_MUSICIAN_IDS = new Set(
  camps
    .find((c) => c.id === 'camp-2026')
    ?.participants?.filter(
      (p): p is { name: string; musicianId: number } =>
        typeof p === 'object' && 'musicianId' in p
    )
    .map((p) => p.musicianId) ?? []
);

const VideoDetailPage: React.FC<VideoDetailPageProps> = ({
  video,
  relatedMusicians,
  moreVideos,
}) => {
  const { t, i18n } = useTranslation();
  const videoId = getYoutubeVideoId(video.youtubeUrl);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const thumbnailUrl =
    video.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const pageUrl = getFullUrl(`/videos/${video.id}`);
  const localizedDate = new Date(video.date).toLocaleDateString(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const seoTitle = `${video.title} | ${t('videos.page_title')}`;
  const seoDescription = (video.description || t('videos.page_desc')).slice(0, 160);

  const videoSchema = getVideoObjectSchema(
    {
      name: video.title,
      description: video.description || '',
      youtubeUrl: video.youtubeUrl,
      uploadDate: video.date,
      id: String(video.id),
      duration: video.duration,
    },
    t
  );

  const breadcrumbs = [
    { name: t('nav.home'), url: getFullUrl('/') },
    { name: t('videos.page_title'), url: getFullUrl('/videos') },
    { name: video.title, url: pageUrl },
  ];

  const webPageSchema = getWebPageSchema({
    name: video.title,
    description: seoDescription,
    url: pageUrl,
    datePublished: video.date,
    dateModified: video.date,
    primaryImageUrl: thumbnailUrl,
    mainEntityId: `https://peaceandmusic.net/videos#video-${video.id}`,
  });

  return (
    <PageLayout
      title={seoTitle}
      description={seoDescription}
      ogImage={thumbnailUrl}
      ogImageAlt={video.title}
      ogType="video.other"
      canonicalUrl={pageUrl}
      structuredData={[videoSchema, getBreadcrumbSchema(breadcrumbs), webPageSchema]}
      breadcrumbs={breadcrumbs}
      background="white"
      disableTopPadding={false}
    >
      <Section background="white" className="pt-8 md:pt-12 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black">
            <iframe
              src={`${embedUrl}?rel=0`}
              title={video.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-ocean-mist uppercase tracking-tighter mb-4">
              {video.location && <span className="truncate">{video.location}</span>}
              <span aria-hidden="true">·</span>
              <time dateTime={video.date}>{localizedDate}</time>
            </div>
            <h1 className="typo-h2 mb-6 break-words">
              {video.title}
            </h1>
            {video.description && (
              <p className="typo-body text-gray-700 whitespace-pre-line break-words mb-8">
                {video.description}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button
                href={watchUrl}
                variant="gold"
                size="sm"
                external
              >
                {t('videos.detail.watch_on_youtube')}
              </Button>
              <Button to="/videos" variant="outline" size="sm">
                {t('videos.detail.back_to_list')}
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {relatedMusicians.length > 0 && (
        <Section background="ocean-sand" className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <SectionHeader title={t('videos.detail.related_musicians')} align="left" className="!mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {relatedMusicians.map((m) => {
                const href = CAMP_2026_MUSICIAN_IDS.has(m.id)
                  ? `/camps/2026/musicians/${m.id}`
                  : `/album/musicians/${m.id}`;
                return (
                  <Link
                    key={m.id}
                    href={href}
                    className="group block rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    {m.imageUrl && (
                      <div className="relative aspect-square overflow-hidden bg-gray-200">
                        <Image
                          src={m.imageUrl}
                          alt={m.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-semibold text-jeju-ocean group-hover:text-ocean-mist transition-colors truncate">
                        {m.name}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </Section>
      )}

      {moreVideos.length > 0 && (
        <Section background="white" className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <SectionHeader title={t('videos.detail.more_videos')} align="left" className="!mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {moreVideos.map((v) => {
                const vid = getYoutubeVideoId(v.youtubeUrl);
                const thumb = v.thumbnailUrl || `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
                return (
                  <Link
                    key={v.id}
                    href={`/videos/${v.id}`}
                    className="group block rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-video overflow-hidden bg-gray-200">
                      <Image
                        src={thumb}
                        alt={v.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="typo-h3 text-base mb-1 line-clamp-2 group-hover:text-jeju-ocean transition-colors break-words">
                        {v.title}
                      </h3>
                      <p className="text-xs text-ocean-mist uppercase tracking-tighter truncate">
                        {v.location}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </Section>
      )}
    </PageLayout>
  );
};

export default VideoDetailPage;
