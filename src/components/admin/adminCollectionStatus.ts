import classNames from 'classnames';

export const adminStatusLabel = (status: string) => {
  if (status === 'published') return '공개';
  if (status === 'hidden') return '내림';
  if (status === 'missing') return '없음';
  return '초안';
};

export const adminStatusClass = (status: string) =>
  classNames(
    'rounded px-2 py-1 text-xs font-semibold',
    status === 'published' && 'bg-jeju-ocean/10 text-jeju-ocean',
    status === 'draft' && 'bg-golden-sun/20 text-deep-ocean',
    status === 'hidden' && 'bg-sunset-coral/10 text-sunset-coral',
    status === 'missing' && 'bg-coastal-gray/10 text-coastal-gray'
  );
