import CampDetailPage from './CampDetailPage';
import { Musician } from '../types/musician';

interface CampPageProps {
    initialMusicians?: Musician[];
    initialLocale?: string;
}

const Camp2025Page: React.FC<CampPageProps> = ({ initialMusicians = [], initialLocale = 'ko' }) => (
    <CampDetailPage campId="camp-2025" initialMusicians={initialMusicians} initialLocale={initialLocale} />
);

export default Camp2025Page;
