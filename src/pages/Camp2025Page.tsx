import CampDetailPage from './CampDetailPage';
import { Musician } from '../types/musician';

interface CampPageProps {
    initialMusicians?: Musician[];
}

const Camp2025Page: React.FC<CampPageProps> = ({ initialMusicians = [] }) => (
    <CampDetailPage campId="camp-2025" initialMusicians={initialMusicians} />
);

export default Camp2025Page;
