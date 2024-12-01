import { NextApiRequest, NextApiResponse } from 'next';
import ogs from 'open-graph-scraper';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    const { result } = await ogs({ url });
    
    const thumbnail = {
      url: result.ogImage?.[0]?.url || null,
      title: result.ogTitle || null,
      description: result.ogDescription || null,
      siteName: result.ogSiteName || null,
    };

    res.status(200).json(thumbnail);
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    res.status(500).json({ message: 'Error fetching thumbnail' });
  }
}
