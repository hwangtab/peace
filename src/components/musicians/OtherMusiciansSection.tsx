import { useTranslation } from 'next-i18next';
import { Musician } from '@/types/musician';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import MusicianCard from './MusicianCard';
import Button from '../common/Button';
import SectionHeader from '../common/SectionHeader';

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
    <Section background="white" paddingTop="normal" paddingBottom="loose">
      <Container size="wide">
        <SectionHeader title={otherMusiciansTitle || t('nav.musician')} />
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
    </Section>
  );
}
