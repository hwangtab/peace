import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi';
import { ROUTES } from '../../constants/routes';

const Footer = () => {
    const footerMenuItems = [
        { name: '홈', path: ROUTES.HOME },
        { name: '갤러리', path: ROUTES.GALLERY },
        { name: '비디오', path: ROUTES.VIDEOS },
        { name: '언론보도', path: ROUTES.PRESS },
    ];

    const campMenuItems = [
        { name: '2023 캠프', path: ROUTES.CAMPS.CAMP_2023 },
        { name: '2025 캠프', path: ROUTES.CAMPS.CAMP_2025 },
        { name: '2026 캠프', path: ROUTES.CAMPS.CAMP_2026 },
    ];

    const albumMenuItems = [
        { name: '앨범 소개', path: ROUTES.ALBUM.ABOUT },
        { name: '뮤지션', path: ROUTES.ALBUM.MUSICIANS },
        { name: '수록곡', path: ROUTES.ALBUM.TRACKS },
    ];

    const socialLinks = [
        {
            name: 'Instagram',
            href: 'https://www.instagram.com/peace_music_in_gangjeong',
            icon: FaInstagram,
            ariaLabel: '인스타그램에서 강정피스앤뮤직캠프 팔로우하기',
        },
        {
            name: 'Email',
            href: 'mailto:gpmc0625@gmail.com',
            icon: HiOutlineMail,
            ariaLabel: '이메일로 연락하기',
        },
    ];

    return (
        <footer className="bg-deep-ocean text-cloud-white">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">

                    {/* Left Column - Site Info */}
                    <div className="text-center md:text-left space-y-4">
                        <h2 className="text-xl md:text-2xl font-serif font-bold">
                            강정피스앤뮤직캠프
                        </h2>
                        <p className="text-golden-sun text-sm md:text-base font-stone">
                            전쟁을 끝내자! 노래하자, 춤추자
                        </p>
                        <p className="text-seafoam/80 text-sm font-caption leading-relaxed">
                            강정마을에서 시작되는 평화의 메시지
                        </p>
                    </div>

                    {/* Center Column - Navigation */}
                    <div className="text-center space-y-4">
                        <h3 className="text-sm font-semibold text-seafoam uppercase tracking-wider mb-4">
                            바로가기
                        </h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            {/* Left - Main Menu */}
                            <div className="space-y-2 text-right">
                                {footerMenuItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className="block text-cloud-white/80 hover:text-golden-sun 
                               transition-colors duration-200 text-sm"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                            {/* Right - Camp & Album */}
                            <div className="space-y-2 text-left">
                                {campMenuItems.slice(0, 2).map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className="block text-cloud-white/80 hover:text-golden-sun 
                               transition-colors duration-200 text-sm"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                {albumMenuItems.slice(0, 2).map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className="block text-cloud-white/80 hover:text-golden-sun 
                               transition-colors duration-200 text-sm"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Social & Contact */}
                    <div className="text-center md:text-right space-y-4">
                        <h3 className="text-sm font-semibold text-seafoam uppercase tracking-wider mb-4">
                            연락하기
                        </h3>
                        <div className="flex items-center justify-center md:justify-end space-x-4">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    target={link.name === 'Instagram' ? '_blank' : undefined}
                                    rel={link.name === 'Instagram' ? 'noopener noreferrer' : undefined}
                                    aria-label={link.ariaLabel}
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
                        © 2026 강정피스앤뮤직캠프. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
