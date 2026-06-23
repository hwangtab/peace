import classNames from 'classnames';
import {
  getPrimaryLabel,
  getRowStatus,
  getRowUpdatedAt,
  type AdminCollectionConfig,
  type AdminCollectionRow,
  type AdminStatusFilter,
} from '@/lib/adminArchive';
import { adminStatusClass, adminStatusLabel } from './adminCollectionStatus';

interface AdminCollectionListPanelProps {
  config: AdminCollectionConfig;
  items: AdminCollectionRow[];
  filteredItems: AdminCollectionRow[];
  selectedId?: string | null;
  totalCount: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  isLoadingAll: boolean;
  searchQuery: string;
  statusFilter: AdminStatusFilter;
  onSearchQueryChange: (value: string) => void;
  onStatusFilterChange: (value: AdminStatusFilter) => void;
  onSelectItem: (item: AdminCollectionRow) => void;
  onLoadMore: () => void;
  onLoadAll: () => void;
}

export default function AdminCollectionListPanel({
  config,
  items,
  filteredItems,
  selectedId,
  totalCount,
  hasMore,
  isLoadingMore,
  isLoadingAll,
  searchQuery,
  statusFilter,
  onSearchQueryChange,
  onStatusFilterChange,
  onSelectItem,
  onLoadMore,
  onLoadAll,
}: AdminCollectionListPanelProps) {
  return (
    <section className="rounded border border-deep-ocean/10 bg-white">
      <div className="border-b border-deep-ocean/10 px-4 py-3">
        <h2 className="font-semibold">목록</h2>
      </div>
      <div className="space-y-3 border-b border-deep-ocean/10 px-4 py-3">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="제목, ID, 설명 검색"
          className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
        />
        <div className="flex items-center justify-between gap-3">
          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as AdminStatusFilter)}
            className="rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
          >
            <option value="all">모든 상태</option>
            <option value="published">공개</option>
            <option value="draft">초안</option>
            <option value="hidden">내림</option>
          </select>
          <span className="text-xs text-coastal-gray">
            {filteredItems.length.toLocaleString('ko-KR')} / {totalCount.toLocaleString('ko-KR')}
          </span>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="p-6 text-coastal-gray">{config.emptyLabel}</p>
      ) : filteredItems.length === 0 ? (
        <p className="p-6 text-coastal-gray">검색 조건에 맞는 항목이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-deep-ocean/10">
          {filteredItems.map((item) => {
            const active = selectedId === item.id;
            const status = getRowStatus(item);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelectItem(item)}
                  className={classNames(
                    'w-full px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-jeju-ocean',
                    active ? 'bg-jeju-ocean/10' : 'hover:bg-ocean-sand/40'
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block font-semibold">{getPrimaryLabel(item, config)}</span>
                      <span className="mt-1 block text-xs text-coastal-gray">
                        {getRowUpdatedAt(item)
                          ? new Date(getRowUpdatedAt(item)).toLocaleString('ko-KR')
                          : ''}
                      </span>
                    </span>
                    <span className={adminStatusClass(status)}>{adminStatusLabel(status)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {items.length > 0 && hasMore && (
        <div className="flex flex-col gap-2 border-t border-deep-ocean/10 p-4 sm:flex-row">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore || isLoadingAll}
            className="w-full rounded border border-deep-ocean/20 bg-white px-4 py-2 text-sm font-semibold text-deep-ocean transition hover:bg-ocean-sand/40 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            {isLoadingMore ? '불러오는 중' : '더 불러오기'}
          </button>
          <button
            type="button"
            onClick={onLoadAll}
            disabled={isLoadingMore || isLoadingAll}
            className="w-full rounded border border-jeju-ocean/40 bg-white px-4 py-2 text-sm font-semibold text-jeju-ocean transition hover:bg-jeju-ocean/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            {isLoadingAll ? '전체 불러오는 중' : '전체 불러오기'}
          </button>
        </div>
      )}
    </section>
  );
}
