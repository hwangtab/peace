import { type AdminCollectionConfig, type AdminLocaleStatus } from '@/lib/adminArchive';
import { adminStatusClass, adminStatusLabel } from './adminCollectionStatus';

interface AdminLocaleStatusPanelProps {
  config: AdminCollectionConfig;
  localeStatuses: AdminLocaleStatus[];
  localeStatusCounts: {
    published: number;
    draft: number;
    hidden: number;
    missing: number;
  };
  isLoadingLocaleStatuses: boolean;
  canEdit: boolean;
  isSaving: boolean;
  onCloneMissingLocales: () => void;
}

export default function AdminLocaleStatusPanel({
  config,
  localeStatuses,
  localeStatusCounts,
  isLoadingLocaleStatuses,
  canEdit,
  isSaving,
  onCloneMissingLocales,
}: AdminLocaleStatusPanelProps) {
  return (
    <div className="rounded border border-deep-ocean/10 bg-white px-3 py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-deep-ocean">언어 상태</span>
        <span className="text-xs text-coastal-gray">
          공개 {localeStatusCounts.published} / 초안 {localeStatusCounts.draft} / 내림{' '}
          {localeStatusCounts.hidden} / 없음 {localeStatusCounts.missing}
        </span>
      </div>
      {isLoadingLocaleStatuses ? (
        <p className="text-sm text-coastal-gray">불러오는 중</p>
      ) : localeStatuses.length === 0 ? (
        <p className="text-sm text-coastal-gray">언어 상태를 불러오지 못했습니다.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {localeStatuses.map((item) => (
              <a
                key={item.locale}
                href={`${config.listPath}?locale=${encodeURIComponent(item.locale)}`}
                className="flex items-center justify-between gap-2 rounded border border-deep-ocean/10 px-2 py-2 text-sm transition hover:bg-ocean-sand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
              >
                <span className="font-semibold">{item.locale}</span>
                <span className={adminStatusClass(item.status)}>
                  {adminStatusLabel(item.status)}
                </span>
              </a>
            ))}
          </div>
          {localeStatusCounts.missing > 0 && canEdit && (
            <button
              type="button"
              onClick={onCloneMissingLocales}
              disabled={isSaving}
              className="mt-3 rounded border border-jeju-ocean/40 bg-white px-3 py-2 text-sm font-semibold text-jeju-ocean transition hover:bg-jeju-ocean/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
            >
              없는 언어 초안 모두 생성
            </button>
          )}
        </>
      )}
    </div>
  );
}
