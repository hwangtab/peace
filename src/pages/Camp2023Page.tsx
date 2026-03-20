import CampDetailPage from './CampDetailPage';
import { Musician } from '@/types/musician';

interface CampPageProps {
    initialMusicians?: Musician[];
    initialLocale?: string;
}

const Camp2023Page = ({ initialMusicians = [], initialLocale = 'ko' }: CampPageProps) => (
    <CampDetailPage campId="camp-2023" initialMusicians={initialMusicians} initialLocale={initialLocale} />
);

export default Camp2023Page;
