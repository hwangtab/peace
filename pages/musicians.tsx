import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/album/musicians',
    permanent: true,
  },
});

export default function LegacyRedirect() {
  return null;
}
