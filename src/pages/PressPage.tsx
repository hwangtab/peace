import React from 'react';
import { PressItem, pressItems } from '../data/press';

const PressCard: React.FC<{ press: PressItem }> = ({ press }) => {
  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden">
      {press.imageUrl && (
        <div className="relative h-48">
          <img
            src={press.imageUrl}
            alt={press.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">{press.publisher}</span>
          <span className="text-sm text-gray-500">{press.date}</span>
        </div>
        <a
          href={press.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:underline"
        >
          <h3 className="text-xl font-semibold text-gray-800">{press.title}</h3>
        </a>
        <p className="text-gray-600 mt-2">{press.description}</p>
      </div>
    </article>
  );
};

const PressPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">언론 보도</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pressItems.map((press) => (
          <PressCard key={press.id} press={press} />
        ))}
      </div>
    </div>
  );
};

export default PressPage;
