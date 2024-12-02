import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PressItem, pressItems } from '../../data/press';

const PressCard: React.FC<{ press: PressItem }> = ({ press }) => {
  return (
    <a
      href={press.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full cursor-pointer"
    >
      <article className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl h-full flex flex-col">
        {press.imageUrl && (
          <div className="h-48 overflow-hidden">
            <img
              src={press.imageUrl}
              alt={press.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                // JPEG 확장자를 JPG로 시도
                if (img.src.endsWith('.jpeg')) {
                  img.src = img.src.replace('.jpeg', '.jpg');
                }
              }}
            />
          </div>
        )}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">{press.publisher}</span>
            <span className="text-sm text-gray-500">{press.date}</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200">
            {press.title}
          </h3>
          <p className="text-gray-600 mt-2 flex-1">{press.description}</p>
        </div>
      </article>
    </a>
  );
};

export default function PressPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section bg-light-beige" ref={ref}>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-medium text-gray-900 mb-4 font-serif">
            언론보도
          </h2>
          <p className="text-lg text-gray-600 mb-12 subtitle">
            평화를 노래하는 우리들의 이야기
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...pressItems]
            .sort((a, b) => a.id - b.id)
            .map((press) => (
            <div key={press.id} className="h-full">
              <PressCard press={press} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
