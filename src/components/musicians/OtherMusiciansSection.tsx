import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Musician } from '@/types/musician';
import MusicianCard from './MusicianCard';

interface OtherMusiciansProps {
  otherMusicians: Musician[];
  musicianHrefPrefix: string;
  backHref: string;
  backLabel: string;
  isCampPage: boolean;
  otherMusiciansTitle?: string;
}

export default function OtherMusiciansSection({
  otherMusicians,
  musicianHrefPrefix,
  backHref,
  backLabel,
  isCampPage,
  otherMusiciansTitle,
}: OtherMusiciansProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="typo-h2 text-jeju-ocean text-center mb-10">
          {otherMusiciansTitle || t('nav.musician')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {otherMusicians.slice(0, 6).map((m, i) => (
            <MusicianCard
              key={m.id}
              musician={m}
              index={i}
              href={`${musicianHrefPrefix}/${m.id}`}
            />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href={backHref}
            className="inline-flex items-center px-6 py-3 bg-jeju-ocean text-white rounded-lg hover:bg-ocean-mist transition-colors font-medium"
          >
            {isCampPage ? t('camp.view_full_lineup') : backLabel} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
