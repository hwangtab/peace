import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export interface BreadcrumbItem {
    name: string;
    url: string;
}

interface BreadcrumbNavProps {
    items: BreadcrumbItem[];
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ items }) => {
    const router = useRouter();
    const isRtl = router.locale === 'ar';
    const separator = isRtl ? '\\' : '/';

    if (!items || items.length <= 1) return null;

    return (
        <nav
            aria-label="Breadcrumb"
            className="absolute top-20 md:top-24 left-0 right-0 z-20 py-1.5"
        >
            <ol className="container mx-auto flex flex-wrap items-center gap-1 text-sm text-white/70">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={item.url} className="flex items-center gap-1">
                            {index > 0 && (
                                <span aria-hidden="true" className="text-white/40 select-none">
                                    {separator}
                                </span>
                            )}
                            {isLast ? (
                                <span aria-current="page" title={item.name} className="text-white/90 font-medium truncate max-w-[200px]">
                                    {item.name}
                                </span>
                            ) : (
                                <Link
                                    href={item.url.startsWith('http') ? new URL(item.url).pathname : item.url}
                                    title={item.name}
                                    className="hover:text-white transition-colors duration-150 truncate max-w-[200px]"
                                >
                                    {item.name}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default BreadcrumbNav;
