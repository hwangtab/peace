const fs = require('fs');
const https = require('https');

const videoUrls = [
    // 2023
    "https://www.youtube.com/watch?v=dF6raNSEkfI",
    "https://www.youtube.com/watch?v=mPeFqepsf_Y",
    "https://www.youtube.com/watch?v=MzIpAmDAYzk",
    "https://www.youtube.com/watch?v=OGKd_pnrul4",
    "https://www.youtube.com/watch?v=GHSxHVc-b1w",
    "https://www.youtube.com/watch?v=1TyLqzoHA7M",
    "https://www.youtube.com/watch?v=YwOO627losU",
    "https://www.youtube.com/watch?v=RH2x3ctcBgU",
    "https://www.youtube.com/watch?v=tFxoLxIDfyM",
    "https://www.youtube.com/watch?v=-PhTNOVdLc0",
    "https://www.youtube.com/watch?v=mC-HJ-VhLOQ",
    "https://www.youtube.com/watch?v=crK6y7mJrfY",
    // 2025
    "https://www.youtube.com/watch?v=pcsM9lxlA24",
    "https://youtu.be/DBlCTgWNNKU?si=9QRus6J85pPEqf-F" // shorten link handling?
];

const fetchMetadata = (url) => {
    return new Promise((resolve, reject) => {
        // Normalize URL for fetching
        let fetchUrl = url;
        if (url.includes('youtu.be')) {
            const id = url.split('youtu.be/')[1].split('?')[0];
            fetchUrl = `https://www.youtube.com/watch?v=${id}`;
        }

        https.get(fetchUrl, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const titleMatch = data.match(/<meta property="og:title" content="(.*?)"/);
                const imageMatch = data.match(/<meta property="og:image" content="(.*?)"/);

                const title = titleMatch ? titleMatch[1] : 'Unknown Title';
                const thumbnail = imageMatch ? imageMatch[1] : '';

                console.log(`Fetched: ${title}`);
                resolve({
                    originalUrl: url,
                    title: title.replace(' - YouTube', ''),
                    thumbnail: thumbnail
                });
            });
        }).on('error', (err) => {
            console.error(`Error fetching ${url}: ${err.message}`);
            resolve({ originalUrl: url, title: 'Error', thumbnail: '' });
        });
    });
};

const run = async () => {
    console.log('Fetching metadata for videos...');
    const results = [];
    for (const url of videoUrls) {
        const data = await fetchMetadata(url);
        results.push(data);
    }

    console.log('-----------------------------------');
    console.log(JSON.stringify(results, null, 2));
    console.log('-----------------------------------');
};

run();
