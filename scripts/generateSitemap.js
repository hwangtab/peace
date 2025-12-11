const fs = require('fs');
const path = require('path');

// 웹사이트의 모든 페이지 경로
const pages = [
    {
        path: '/',
        changefreq: 'weekly',
        priority: '1.0'
    },
    {
        path: '/musicians',
        changefreq: 'weekly',
        priority: '0.8'
    },
    {
        path: '/tracks',
        changefreq: 'weekly',
        priority: '0.8'
    },
    {
        path: '/gallery',
        changefreq: 'weekly',
        priority: '0.7'
    },
    {
        path: '/press',
        changefreq: 'weekly',
        priority: '0.7'
    },
    {
        path: '/videos',
        changefreq: 'weekly',
        priority: '0.7'
    },
    {
        path: '/camps',
        changefreq: 'monthly',
        priority: '0.9'
    },
    {
        path: '/camps/2023',
        changefreq: 'yearly',
        priority: '0.8'
    },
    {
        path: '/camps/2025',
        changefreq: 'yearly',
        priority: '0.8'
    },
    {
        path: '/camps/2026',
        changefreq: 'monthly',
        priority: '0.9'
    },
    {
        path: '/album/about',
        changefreq: 'monthly',
        priority: '0.8'
    },
    {
        path: '/album/musicians',
        changefreq: 'monthly',
        priority: '0.7'
    },
    {
        path: '/album/tracks',
        changefreq: 'monthly',
        priority: '0.7'
    }
];

// 현재 날짜를 YYYY-MM-DD 형식으로
const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

// sitemap.xml 생성
const generateSitemap = () => {
    const baseUrl = 'https://peaceandmusic.net';
    const lastmod = getCurrentDate();

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    pages.forEach(page => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}${page.path}</loc>\n`;
        sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
        sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
        sitemap += `    <priority>${page.priority}</priority>\n`;
        sitemap += '  </url>\n';
    });

    sitemap += '</urlset>\n';

    return sitemap;
};

// sitemap.xml 파일 저장
const saveSitemap = () => {
    try {
        const sitemapContent = generateSitemap();
        const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

        fs.writeFileSync(outputPath, sitemapContent, 'utf8');
        console.log('✅ sitemap.xml이 성공적으로 생성되었습니다!');
        console.log('   위치:', outputPath);
        console.log('   페이지 수:', pages.length);
        console.log('   생성 날짜:', getCurrentDate());
    } catch (error) {
        console.error('❌ sitemap.xml 생성 중 오류 발생:', error);
        process.exit(1);
    }
};

// 스크립트 실행
saveSitemap();
