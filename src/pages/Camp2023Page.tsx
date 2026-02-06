import CampDetailPage from './CampDetailPage';
import { Musician } from '../types/musician';

interface CampPageProps {
    initialMusicians?: Musician[];
}

const Camp2023Page = ({ initialMusicians = [] }: CampPageProps) => (
    <CampDetailPage campId="camp-2023" initialMusicians={initialMusicians} />
);

export default Camp2023Page;
