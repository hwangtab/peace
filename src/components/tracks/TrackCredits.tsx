import { useTranslation } from 'next-i18next';

interface TrackCreditsProps {
  credits: Record<string, unknown>;
}

type Performer = { role: string; name: string[] };

const isPerformerArray = (arr: unknown[]): arr is Performer[] => {
  return arr.every(item =>
    typeof item === 'object' &&
    item !== null &&
    'role' in item &&
    'name' in item &&
    Array.isArray((item as Performer).name)
  );
};

export default function TrackCredits({ credits }: TrackCreditsProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <div className="flex items-center mb-4">
        <h4 className="text-lg font-serif text-jeju-ocean">{t('common.credits')}</h4>
        <div className="flex-grow ml-4 h-px bg-coastal-gray/20" />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(credits).map(([role, value]) => {
          const renderValue = () => {
            if (!Array.isArray(value)) return String(value);
            if (value.length === 0) return '';
            if (isPerformerArray(value)) {
              return value.map((performer, idx) => (
                <div key={idx}>
                  {performer.role}: {performer.name.join(', ')}
                </div>
              ));
            }
            return (value as string[]).join(', ');
          };

          return (
            <div key={role} className="flex items-start space-x-2">
              <span className="text-sm text-coastal-gray font-medium min-w-[80px]">
                {role === 'personnel' ? t('common.label_personnel') : role}
              </span>
              <span className="text-gray-600 min-w-0 break-words">
                {renderValue()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
