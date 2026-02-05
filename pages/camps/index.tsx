import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/camps/2026',
    permanent: true,
  },
});

export default function LegacyRedirect() {
  return null;
}
