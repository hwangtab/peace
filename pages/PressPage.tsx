import React, { useEffect, useState } from 'react';
import { PressItem, pressItems, Thumbnail } from '../data/press';
import Image from 'next/image';

const PressCard: React.FC<{ press: PressItem }> = ({ press }) => {
  const [thumbnail, setThumbnail] = useState<Thumbnail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const response = await fetch(`/api/get-thumbnail?url=${encodeURIComponent(press.url)}`);
        if (response.ok) {
          const data = await response.json();
          setThumbnail(data);
        }
      } catch (error) {
        console.error('Error fetching thumbnail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThumbnail();
  }, [press.url]);

  return (
    <a 
      href={press.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      {thumbnail?.url && (
        <div className="mb-4 relative aspect-video">
          <Image
            src={thumbnail.url}
            alt={press.title}
            fill
            className="rounded-lg object-cover"
          />
        </div>
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{press.publisher}</span>
          <span className="text-sm text-gray-400">{press.date}</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{press.title}</h3>
        <p className="text-gray-600">{press.description}</p>
        {press.tags && press.tags.length > 0 && (
          <div className="flex gap-2 mt-3">
            {press.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
};

const PressPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">언론 보도</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pressItems.map((press) => (
          <PressCard key={press.id} press={press} />
        ))}
      </div>
    </div>
  );
};

export default PressPage;
