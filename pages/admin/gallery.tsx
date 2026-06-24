import type { GetServerSidePropsContext } from 'next';
import AdminCollectionPage, {
  type AdminCollectionPageProps,
} from '@/components/admin/AdminCollectionPage';
import { loadAdminCollectionPageProps } from '@/lib/adminPageData';

export default function AdminGalleryPage(props: AdminCollectionPageProps) {
  return (
    <AdminCollectionPage
      key={`${props.config.collection}:${props.selectedLocale}:${props.selectedType}:${props.selectedYear}`}
      {...props}
    />
  );
}

export const getServerSideProps = (context: GetServerSidePropsContext) =>
  loadAdminCollectionPageProps(context, 'gallery');
