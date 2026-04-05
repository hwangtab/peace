import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi';
import { SITE_CONFIG } from '@/constants/config';
import { getCamps } from '@/data/camps';
import { simpleMenuItems, campItems, albumItems } from './navigationData';

import { useTranslation } from 'next-i18next';

const Footer = () => {
    const { t, i18n } = useTranslation();
    const camp2026 = getCamps(i18n.language, t).find(c => c.id === 'camp-2026');

    return (
        <footer className="bg-deep-ocean text-cloud-white">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">

                    {/* Left Column - Site Info */}
                    <div className="text-center md:text-left space-y-4">
                        <h2 className="text-xl md:text-2xl font-serif font-bold break-words">
                            {t('app.title')}
                        </h2>
                        <p className="text-golden-sun text-sm md:text-base font-stone font-normal break-words">
                            {t('footer.slogan')}
                        </p>
                        <p className="text-seafoam/80 text-sm font-caption font-light leading-relaxed break-words">
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
                                {camp2026?.fundingUrl && (
                                    <a
                                        href={`${camp2026.fundingUrl}?utm_source=website&utm_medium=cta&utm_campaign=gpmc3&utm_content=footer`}
                                        target="_blank"
                                        rel="noopener noreferrer nofollow"
                                        className="block text-golden-sun hover:text-yellow-300
                               transition-colors duration-200 text-sm font-medium break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-golden-sun rounded-sm"
                                    >
                                        {t('camp.ticketing_2026')}
                                    </a>
                                )}
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
                                    rel={link.external ? 'noopener noreferrer nofollow' : undefined}
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
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-cloud-white/10">
                <div className="container mx-auto px-4 py-4">
                    <p className="text-center text-seafoam/60 text-xs md:text-sm font-caption font-light">
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
