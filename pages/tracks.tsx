import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/album/tracks',
    permanent: true,
  },
});

export default function LegacyRedirect() {
  return null;
}
