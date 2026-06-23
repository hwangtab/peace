import Link from 'next/link';
import Container from './Container';
import InstagramIcon from '@/components/icons/InstagramIcon';
import { HiOutlineMail } from '@/components/icons/SiteIcons';
import { simpleMenuItems, campItems, albumItems } from './navigationData';
import { ROUTES } from '@/constants/routes';

import { useTranslation } from 'next-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-deep-ocean text-cloud-white">
      {/* Main Footer Content */}
      <Container size="wide" className="py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Left Column - Site Info */}
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-xl md:text-2xl font-serif font-bold break-words">
              {t('app.title')}
            </h2>
            <p className="text-golden-sun text-sm md:text-base font-display font-bold break-words text-balance">
              {t('footer.slogan')}
            </p>
            <p className="text-seafoam/80 text-sm font-caption font-light leading-relaxed break-words text-balance">
              {t('footer.description')}
            </p>
          </div>

          {/* Center Column - Navigation */}
          <div className="text-center space-y-4">
            <h3 className="text-sm font-bold text-seafoam uppercase tracking-wider mb-4 break-words">
              {t('footer.links')}
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {/* Left - Main Menu */}
              <div className="space-y-2 text-right">
                {simpleMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="block text-cloud-white/80 hover:text-golden-sun
                               transition-colors duration-200 text-sm break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-golden-sun rounded-sm"
                  >
                    {t(item.nameKey)}
                  </Link>
                ))}
                <Link
                  href={ROUTES.BOARD}
                  className="block text-cloud-white/80 hover:text-golden-sun
                             transition-colors duration-200 text-sm break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-golden-sun rounded-sm"
                >
                  {t('nav.community')}
                </Link>
              </div>
              {/* Right - Camp & Album */}
              <div className="space-y-2 text-left">
                {campItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="block text-cloud-white/80 hover:text-golden-sun
                               transition-colors duration-200 text-sm break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-golden-sun rounded-sm"
                  >
                    {t(item.nameKey)}
                  </Link>
                ))}
                {albumItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="block text-cloud-white/80 hover:text-golden-sun
                               transition-colors duration-200 text-sm break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-golden-sun rounded-sm"
                  >
                    {t(item.nameKey)}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Social & Contact */}
          <div className="text-center md:text-right space-y-4">
            <h3 className="text-sm font-bold text-seafoam uppercase tracking-wider mb-4 break-words">
              {t('footer.contact')}
            </h3>
            <div className="flex items-center justify-center md:justify-end space-x-4">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  // SNS 공식 계정 링크에는 nofollow 제외 — 링크 유전력 전달 필요
                  rel={link.external && !link.noFollow ? 'noopener noreferrer' : undefined}
                  aria-label={t(link.nameKey)}
                  className="group flex items-center justify-center w-12 h-12 rounded-full
                             bg-cloud-white/10 hover:bg-jeju-ocean
                             transition-[background-color,transform,box-shadow] duration-300 ease-in-out
                             hover:scale-110 hover:shadow-lg hover:shadow-jeju-ocean/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-golden-sun"
                >
                  <link.icon
                    aria-hidden="true"
                    className="w-5 h-5 text-cloud-white group-hover:text-cloud-white
                               transition-colors duration-300"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-cloud-white/10">
        <Container size="wide" className="py-4">
          <p className="text-center text-seafoam/60 text-xs md:text-sm font-caption font-light">
            {/* suppressHydrationWarning: SSG 빌드 연도 vs 클라이언트 실행 연도 차이를 허용 */}©{' '}
            <span suppressHydrationWarning>{new Date().getFullYear()}</span> {t('app.title')}.{' '}
            {t('footer.copyright')}
            {' · '}
            <Link
              href="/privacy"
              className="underline underline-offset-2 transition-colors hover:text-golden-sun focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-golden-sun rounded-sm"
            >
              {t('footer.privacy')}
            </Link>
          </p>
        </Container>
      </div>
    </footer>
  );
};

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/peace_music_in_gangjeong',
    icon: InstagramIcon,
    nameKey: 'footer.sns_aria',
    external: true,
    noFollow: false,
  },
  {
    name: 'Email',
    href: 'mailto:gpmc0625@gmail.com',
    icon: HiOutlineMail,
    nameKey: 'footer.email_aria',
    external: false,
  },
] as const;

export default Footer;
