import React from 'react';

interface Props {
  title: string;
  subtitle?: string;
  body?: string;
  items?: string[];
  note?: string;
}

const GuidelineSection: React.FC<Props> = ({ title, subtitle, body, items, note }) => {
  return (
    <div className="mb-10">
      <h2 className="typo-h3 mb-4">{title}</h2>
      {subtitle && <h3 className="text-base font-semibold text-jeju-ocean mb-2">{subtitle}</h3>}
      {body && <p className="typo-body text-coastal-gray leading-relaxed mb-3">{body}</p>}
      {items && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.slice(0, 60)}
              className="flex gap-2 typo-body text-coastal-gray leading-relaxed"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-jeju-ocean"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {note && (
        <div className="mt-3 bg-sky-horizon/40 border border-seafoam/30 rounded-lg p-3">
          <p className="text-sm text-coastal-gray leading-relaxed">{note}</p>
        </div>
      )}
    </div>
  );
};

export default GuidelineSection;
