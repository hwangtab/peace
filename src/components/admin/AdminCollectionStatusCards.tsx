interface AdminCollectionStatusCardsProps {
  counts: {
    all: number;
    published: number;
    draft: number;
    hidden: number;
    approximate: boolean;
  };
}

export default function AdminCollectionStatusCards({ counts }: AdminCollectionStatusCardsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        ['전체', counts.all, false],
        ['공개', counts.published, counts.approximate],
        ['초안', counts.draft, counts.approximate],
        ['내림', counts.hidden, counts.approximate],
      ].map(([label, value, approx]) => (
        <div key={label as string} className="rounded border border-deep-ocean/10 bg-white p-4">
          <p className="text-sm text-coastal-gray">{label as string}</p>
          <p className="mt-1 text-2xl font-bold">
            {value as number}
            {approx ? (
              <span className="ml-1 text-base font-normal text-coastal-gray">+</span>
            ) : null}
          </p>
          {approx ? <p className="mt-0.5 text-xs text-coastal-gray">로드된 항목 기준</p> : null}
        </div>
      ))}
    </div>
  );
}
