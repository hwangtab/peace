import { useTranslation } from 'next-i18next';
import { Musician } from '@/types/musician';
import Container from '@/components/layout/Container';
import MusicianCard from './MusicianCard';
import Button from '../common/Button';

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
    <div className="bg-white pt-16 pb-24 md:pb-32">
      <Container size="wide">
        <h2 className="typo-h2 text-jeju-ocean text-center mb-10">
          {otherMusiciansTitle || t('nav.musician')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {otherMusicians.slice(0, 6).map((m) => (
            <MusicianCard
              key={m.id}
              musician={m}
              href={`${musicianHrefPrefix}/${m.id}`}
            />
          ))}
        </div>
        <div className="text-center mt-10">
          <Button to={backHref} variant="primary" shape="rounded">
            {isCampPage ? t('camp.view_full_lineup') : backLabel} &rarr;
          </Button>
        </div>
      </Container>
    </div>
  );
}
