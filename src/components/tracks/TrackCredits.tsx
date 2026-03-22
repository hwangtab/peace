import { useTranslation } from 'next-i18next';
import { Track } from '@/types/track';

interface TrackCreditsProps {
  credits: Track['credits'];
}

export default function TrackCredits({ credits }: TrackCreditsProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <div className="flex items-center mb-4">
        <h4 className="text-lg font-serif text-jeju-ocean">{t('common.credits')}</h4>
        <div className="flex-grow ml-4 h-px bg-coastal-gray/20" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {credits.composer && credits.composer.length > 0 && (
          <div className="flex items-start space-x-2">
            <span className="text-sm text-coastal-gray font-medium min-w-[60px] sm:min-w-[80px]">
              {t('common.composer')}
            </span>
            <span className="text-gray-600 min-w-0 break-words">
              {credits.composer.join(', ')}
            </span>
          </div>
        )}
        {credits.lyricist && credits.lyricist.length > 0 && (
          <div className="flex items-start space-x-2">
            <span className="text-sm text-coastal-gray font-medium min-w-[60px] sm:min-w-[80px]">
              {t('common.lyricist')}
            </span>
            <span className="text-gray-600 min-w-0 break-words">
              {credits.lyricist.join(', ')}
            </span>
          </div>
        )}
        {credits.arranger && credits.arranger.length > 0 && (
          <div className="flex items-start space-x-2">
            <span className="text-sm text-coastal-gray font-medium min-w-[60px] sm:min-w-[80px]">
              {t('common.arranger')}
            </span>
            <span className="text-gray-600 min-w-0 break-words">
              {credits.arranger.join(', ')}
            </span>
          </div>
        )}
        {credits.personnel?.map((performer, idx) => (
          <div key={idx} className="flex items-start space-x-2">
            <span className="text-sm text-coastal-gray font-medium min-w-[60px] sm:min-w-[80px]">
              {performer.role}
            </span>
            <span className="text-gray-600 min-w-0 break-words">
              {performer.name.join(', ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
