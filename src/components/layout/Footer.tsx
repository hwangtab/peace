import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi';
import { ROUTES } from '../../constants/routes';
import { SITE_CONFIG } from '../../constants/config';

import { useTranslation } from 'next-i18next';
// ...

const Footer = () => {
    const { t } = useTranslation();

    const FOOTER_MENU_ITEMS = [
        { nameKey: 'footer.menu.home', path: ROUTES.HOME },
        { nameKey: 'footer.menu.gallery', path: ROUTES.GALLERY },
        { nameKey: 'footer.menu.video', path: ROUTES.VIDEOS },
        { nameKey: 'footer.menu.press', path: ROUTES.PRESS },
    ] as const;

    const CAMP_MENU_ITEMS = [
        { nameKey: 'footer.menu.camp_2023', path: ROUTES.CAMPS.CAMP_2023 },
        { nameKey: 'footer.menu.camp_2025', path: ROUTES.CAMPS.CAMP_2025 },
        { nameKey: 'footer.menu.camp_2026', path: ROUTES.CAMPS.CAMP_2026 },
    ] as const;

    const ALBUM_MENU_ITEMS = [
        { nameKey: 'footer.menu.album_about', path: ROUTES.ALBUM.ABOUT },
        { nameKey: 'footer.menu.musicians', path: ROUTES.ALBUM.MUSICIANS },
        { nameKey: 'footer.menu.tracks', path: ROUTES.ALBUM.TRACKS },
    ] as const;

    return (
        <footer className="bg-deep-ocean text-cloud-white">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">

                    {/* Left Column - Site Info */}
                    <div className="text-center md:text-left space-y-4">
                        <h2 className="text-xl md:text-2xl font-serif font-bold">
                            {t('app.title')}
                        </h2>
                        <p className="text-golden-sun text-sm md:text-base font-stone">
                            {t('footer.slogan')}
                        </p>
                        <p className="text-seafoam/80 text-sm font-caption leading-relaxed">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Center Column - Navigation */}
                    <div className="text-center space-y-4">
                        <h3 className="text-sm font-semibold text-seafoam uppercase tracking-wider mb-4">
                            {t('footer.links')}
                        </h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            {/* Left - Main Menu */}
                            <div className="space-y-2 text-right">
                                {FOOTER_MENU_ITEMS.map((item) => (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className="block text-cloud-white/80 hover:text-golden-sun
                               transition-colors duration-200 text-sm"
                                    >
                                        {t(item.nameKey)}
                                    </Link>
                                ))}
                            </div>
                            {/* Right - Camp & Album */}
                            <div className="space-y-2 text-left">
                                {CAMP_MENU_ITEMS.slice(0, 2).map((item) => (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className="block text-cloud-white/80 hover:text-golden-sun
                               transition-colors duration-200 text-sm"
                                    >
                                        {t(item.nameKey)}
                                    </Link>
                                ))}
                                {ALBUM_MENU_ITEMS.slice(0, 2).map((item) => (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className="block text-cloud-white/80 hover:text-golden-sun
                               transition-colors duration-200 text-sm"
                                    >
                                        {t(item.nameKey)}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Social & Contact */}
                    <div className="text-center md:text-right space-y-4">
                        <h3 className="text-sm font-semibold text-seafoam uppercase tracking-wider mb-4">
                            {t('footer.contact')}
                        </h3>
                        <div className="flex items-center justify-center md:justify-end space-x-4">
                            {SOCIAL_LINKS.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    target={link.external ? '_blank' : undefined}
                                    rel={link.external ? 'noopener noreferrer' : undefined}
                                    aria-label={t(link.nameKey)}
                                    className="group flex items-center justify-center w-11 h-11 rounded-full
                             bg-cloud-white/10 hover:bg-jeju-ocean
                             transition-all duration-300 ease-in-out
                             hover:scale-110 hover:shadow-lg hover:shadow-jeju-ocean/30"
                                >
                                    <link.icon
                                        className="w-5 h-5 text-cloud-white group-hover:text-cloud-white
                               transition-colors duration-300"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-cloud-white/10">
                <div className="container mx-auto px-4 py-4">
                    <p className="text-center text-seafoam/60 text-xs md:text-sm font-caption">
                        © {SITE_CONFIG.COPYRIGHT_YEAR} {t('app.title')}. {t('footer.copyright')}
                    </p>
                </div>
            </div>
        </footer>
    );
};

const SOCIAL_LINKS = [
    {
        name: 'Instagram',
        href: 'https://www.instagram.com/peace_music_in_gangjeong',
        icon: FaInstagram,
        nameKey: 'footer.sns_aria',
        external: true,
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
