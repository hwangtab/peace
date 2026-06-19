import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import AdminLayout from './AdminLayout';
import {
  ADMIN_COLLECTION_PAGE_SIZE,
  LOCALE_OPTIONS,
  filterAdminRows,
  getPrimaryLabel,
  getAdminPreviewUrl,
  getRowStatus,
  getRowUpdatedAt,
  mergeAdminRowsById,
  normalizeAdminFormValue,
  prepareAdminLocaleClonePayload,
  prepareAdminMissingLocaleClonePayloads,
  type AdminLocaleStatus,
  type AdminStatusFilter,
  type AdminCollectionConfig,
  type AdminCollectionRow,
} from '@/lib/adminArchive';
import type { AdminMember } from '@/types/cms';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';

export interface AdminCollectionPageProps {
  config: AdminCollectionConfig;
  initialItems: AdminCollectionRow[];
  initialTotalCount: number;
  initialNextOffset: number;
  initialHasMore: boolean;
  member: AdminMember;
  selectedLocale: string;
  initialError?: string;
}

type FormState = Record<string, string>;

const statusLabel = (status: string) => {
  if (status === 'published') return '공개';
  if (status === 'hidden') return '내림';
  if (status === 'missing') return '없음';
  return '초안';
};

const statusClass = (status: string) =>
  classNames(
    'rounded px-2 py-1 text-xs font-semibold',
    status === 'published' && 'bg-jeju-ocean/10 text-jeju-ocean',
    status === 'draft' && 'bg-golden-sun/20 text-deep-ocean',
    status === 'hidden' && 'bg-sunset-coral/10 text-sunset-coral',
    status === 'missing' && 'bg-coastal-gray/10 text-coastal-gray'
  );

const buildFormState = (
  config: AdminCollectionConfig,
  item?: AdminCollectionRow | null,
  selectedLocale = 'ko'
): FormState => {
  const source = (item ?? {}) as unknown as Record<string, unknown>;
  return config.fields.reduce<FormState>(
    (state, field) => {
      const fallback =
        field.name === 'status'
          ? 'draft'
          : field.name === 'locale'
            ? selectedLocale
            : field.name === 'event_type'
              ? 'camp'
              : field.name === 'sort_order'
                ? '0'
                : '';
      state[field.name] = normalizeAdminFormValue(source[field.name] ?? fallback);
      return state;
    },
    item?.id ? { id: item.id } : {}
  );
};

export default function AdminCollectionPage({
  config,
  initialItems,
  initialTotalCount,
  initialNextOffset,
  initialHasMore,
  member,
  selectedLocale,
  initialError = '',
}: AdminCollectionPageProps) {
  const router = useRouter();
  const canEdit = member.role !== 'viewer';
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<AdminCollectionRow | null>(initialItems[0] ?? null);
  const [form, setForm] = useState<FormState>(() =>
    buildFormState(config, initialItems[0], selectedLocale)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(initialError);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [nextOffset, setNextOffset] = useState(initialNextOffset);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [localeStatuses, setLocaleStatuses] = useState<AdminLocaleStatus[]>([]);
  const [isLoadingLocaleStatuses, setIsLoadingLocaleStatuses] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>('all');
  const [cloneLocale, setCloneLocale] = useState(
    LOCALE_OPTIONS.find((option) => option.value !== selectedLocale)?.value ?? selectedLocale
  );

  const counts = useMemo(
    () => ({
      all: totalCount,
      published: items.filter((item) => getRowStatus(item) === 'published').length,
      draft: items.filter((item) => getRowStatus(item) === 'draft').length,
      hidden: items.filter((item) => getRowStatus(item) === 'hidden').length,
    }),
    [items, totalCount]
  );

  const previewUrl = selected
    ? getAdminPreviewUrl(config, selected as unknown as Partial<Record<string, unknown>>)
    : null;
  const selectedStatus = selected ? getRowStatus(selected) : null;
  const filteredItems = useMemo(
    () => filterAdminRows(items, config, { query: searchQuery, status: statusFilter }),
    [config, items, searchQuery, statusFilter]
  );
  const cloneLocaleOptions = useMemo(
    () => LOCALE_OPTIONS.filter((option) => option.value !== selectedLocale),
    [selectedLocale]
  );
  const localeStatusCounts = useMemo(
    () => ({
      published: localeStatuses.filter((item) => item.status === 'published').length,
      draft: localeStatuses.filter((item) => item.status === 'draft').length,
      hidden: localeStatuses.filter((item) => item.status === 'hidden').length,
      missing: localeStatuses.filter((item) => item.status === 'missing').length,
    }),
    [localeStatuses]
  );

  useEffect(() => {
    if (!selected?.id) return;

    let cancelled = false;
    const loadLocaleStatuses = async () => {
      setIsLoadingLocaleStatuses(true);
      const params = new URLSearchParams({ localeStatusId: selected.id });
      const response = await fetch(`/api/admin/archive/${config.collection}?${params.toString()}`);
      const payload = (await response.json()) as {
        locales?: AdminLocaleStatus[];
        error?: string;
      };
      if (cancelled) return;
      setIsLoadingLocaleStatuses(false);
      if (!response.ok || !payload.locales) {
        setLocaleStatuses([]);
        return;
      }
      setLocaleStatuses(payload.locales);
    };

    void loadLocaleStatuses();

    return () => {
      cancelled = true;
    };
  }, [config.collection, selected?.id]);

  const selectItem = (item: AdminCollectionRow | null) => {
    setSelected(item);
    setForm(buildFormState(config, item, selectedLocale));
    setMessage('');
    setError('');
  };

  const updateField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const refreshItems = async (preferredId?: string) => {
    const params = new URLSearchParams({
      locale: selectedLocale,
      offset: '0',
      limit: String(ADMIN_COLLECTION_PAGE_SIZE),
    });
    const response = await fetch(`/api/admin/archive/${config.collection}?${params.toString()}`);
    if (!response.ok) return;
    const payload = (await response.json()) as {
      items: AdminCollectionRow[];
      totalCount?: number;
      nextOffset?: number;
      hasMore?: boolean;
    };
    const nextItems = payload.items;
    const activeId = preferredId ?? selected?.id;
    const nextSelected = activeId
      ? (nextItems.find((item) => item.id === activeId) ?? nextItems[0] ?? null)
      : (nextItems[0] ?? null);
    setItems(nextItems);
    setTotalCount(payload.totalCount ?? nextItems.length);
    setNextOffset(payload.nextOffset ?? nextItems.length);
    setHasMore(payload.hasMore ?? false);
    setSelected(nextSelected);
    setForm(buildFormState(config, nextSelected, selectedLocale));
  };

  const loadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setError('');

    const params = new URLSearchParams({
      locale: selectedLocale,
      offset: String(nextOffset),
      limit: String(ADMIN_COLLECTION_PAGE_SIZE),
    });
    const response = await fetch(`/api/admin/archive/${config.collection}?${params.toString()}`);
    const payload = (await response.json()) as {
      items?: AdminCollectionRow[];
      error?: string;
      totalCount?: number;
      nextOffset?: number;
      hasMore?: boolean;
    };

    setIsLoadingMore(false);
    if (!response.ok || !payload.items) {
      setError(payload.error || '목록을 더 불러오지 못했습니다.');
      return;
    }

    setItems((prev) => mergeAdminRowsById(prev, payload.items!));
    setTotalCount(payload.totalCount ?? totalCount);
    setNextOffset(payload.nextOffset ?? nextOffset + payload.items.length);
    setHasMore(payload.hasMore ?? false);
  };

  const loadAll = async () => {
    if (!hasMore || isLoadingAll) return;
    setIsLoadingAll(true);
    setError('');

    let offset = nextOffset;
    let keepLoading: boolean = hasMore;
    let total = totalCount;
    const collected: AdminCollectionRow[] = [];

    while (keepLoading) {
      const params = new URLSearchParams({
        locale: selectedLocale,
        offset: String(offset),
        limit: String(ADMIN_COLLECTION_PAGE_SIZE),
      });
      const response = await fetch(`/api/admin/archive/${config.collection}?${params.toString()}`);
      const payload = (await response.json()) as {
        items?: AdminCollectionRow[];
        error?: string;
        totalCount?: number;
        nextOffset?: number;
        hasMore?: boolean;
      };

      if (!response.ok || !payload.items) {
        setIsLoadingAll(false);
        setError(payload.error || '전체 목록을 불러오지 못했습니다.');
        return;
      }

      collected.push(...payload.items);
      total = payload.totalCount ?? total;
      offset = payload.nextOffset ?? offset + payload.items.length;
      keepLoading = payload.hasMore ?? false;
    }

    setItems((prev) => mergeAdminRowsById(prev, collected));
    setTotalCount(total);
    setNextOffset(offset);
    setHasMore(false);
    setIsLoadingAll(false);
  };

  const changeLocale = async (nextLocale: string) => {
    await router.push(`${config.listPath}?locale=${encodeURIComponent(nextLocale)}`);
  };

  const uploadGalleryImage = async (file: File) => {
    if (config.collection !== 'gallery') return;
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('이미지 파일은 10MB 이하로 올려 주세요.');
      return;
    }

    setIsSaving(true);
    setMessage('');
    setError('');

    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, '') || 'jpg';
    const filePath = `${selectedLocale}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;
    const supabase = createSupabaseBrowserClient();
    const { error: uploadError } = await supabase.storage
      .from('archive-gallery')
      .upload(filePath, file, {
        cacheControl: '31536000',
        upsert: false,
      });

    setIsSaving(false);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from('archive-gallery').getPublicUrl(filePath);
    updateField('image_url', data.publicUrl);
    setMessage('이미지를 업로드했습니다. 저장을 눌러 공개 정보에 반영하세요.');
  };

  const save = async () => {
    setIsSaving(true);
    setMessage('');
    setError('');

    const response = await fetch(`/api/admin/archive/${config.collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const payload = (await response.json()) as {
      item?: AdminCollectionRow;
      error?: string;
      changeLogError?: string | null;
    };

    setIsSaving(false);
    if (!response.ok || !payload.item) {
      setError(payload.error || '저장하지 못했습니다.');
      return;
    }

    setMessage(
      payload.changeLogError
        ? `저장했습니다. 변경 이력 기록 실패: ${payload.changeLogError}`
        : '저장했습니다.'
    );
    setSelected(payload.item);
    setForm(buildFormState(config, payload.item, selectedLocale));
    await refreshItems(payload.item.id);
  };

  const hideSelected = async () => {
    if (!selected) return;
    setIsSaving(true);
    setMessage('');
    setError('');

    const response = await fetch(`/api/admin/archive/${config.collection}?id=${selected.id}`, {
      method: 'DELETE',
    });
    const payload = (await response.json()) as { error?: string; changeLogError?: string | null };

    setIsSaving(false);
    if (!response.ok) {
      setError(payload.error || '내리지 못했습니다.');
      return;
    }

    setMessage(
      payload.changeLogError
        ? `공개 목록에서 내렸습니다. 변경 이력 기록 실패: ${payload.changeLogError}`
        : '공개 목록에서 내렸습니다.'
    );
    await refreshItems(selected.id);
  };

  const cloneSelectedToLocale = async () => {
    if (!selected || !cloneLocale || cloneLocale === selectedLocale) return;
    setIsSaving(true);
    setMessage('');
    setError('');

    const response = await fetch(`/api/admin/archive/${config.collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prepareAdminLocaleClonePayload(config, selected, cloneLocale)),
    });
    const payload = (await response.json()) as {
      item?: AdminCollectionRow;
      error?: string;
      changeLogError?: string | null;
    };

    setIsSaving(false);
    if (!response.ok || !payload.item) {
      setError(payload.error || '다른 언어 초안을 만들지 못했습니다.');
      return;
    }

    await router.push(`${config.listPath}?locale=${encodeURIComponent(cloneLocale)}`);
  };

  const refreshLocaleStatuses = async (itemId: string) => {
    const params = new URLSearchParams({ localeStatusId: itemId });
    const response = await fetch(`/api/admin/archive/${config.collection}?${params.toString()}`);
    const payload = (await response.json()) as {
      locales?: AdminLocaleStatus[];
      error?: string;
    };
    if (!response.ok || !payload.locales) {
      throw new Error(payload.error || '언어 상태를 불러오지 못했습니다.');
    }
    setLocaleStatuses(payload.locales);
  };

  const cloneMissingLocales = async () => {
    if (!selected) return;
    const payloads = prepareAdminMissingLocaleClonePayloads(config, selected, localeStatuses);
    if (payloads.length === 0) return;

    setIsSaving(true);
    setMessage('');
    setError('');

    for (const payload of payloads) {
      const response = await fetch(`/api/admin/archive/${config.collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { item?: AdminCollectionRow; error?: string };
      if (!response.ok || !result.item) {
        setIsSaving(false);
        setError(result.error || '없는 언어 초안을 만들지 못했습니다.');
        return;
      }
    }

    setIsSaving(false);
    setMessage(`없는 언어 초안 ${payloads.length}개를 만들었습니다.`);
    try {
      await refreshLocaleStatuses(selected.id);
    } catch (error) {
      setError(error instanceof Error ? error.message : '언어 상태를 다시 불러오지 못했습니다.');
    }
  };

  return (
    <AdminLayout title={config.title} member={member}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">{config.title}</h1>
          <p className="mt-2 max-w-2xl text-coastal-gray">{config.description}</p>
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={() => selectItem(null)}
            className="rounded bg-jeju-ocean px-4 py-2 font-semibold text-white transition hover:bg-deep-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            새 항목
          </button>
        ) : (
          <span className="rounded bg-coastal-gray/10 px-3 py-2 text-sm font-semibold text-coastal-gray">
            열람 전용 — 편집 권한이 없습니다
          </span>
        )}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded border border-deep-ocean/10 bg-white px-4 py-3">
        <label className="flex items-center gap-2 text-sm font-semibold">
          언어
          <select
            value={selectedLocale}
            onChange={(event) => void changeLocale(event.target.value)}
            className="rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
          >
            {LOCALE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-coastal-gray">
          목록과 새 항목 기본값은 선택한 언어 기준입니다.
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['전체', counts.all],
          ['공개', counts.published],
          ['초안', counts.draft],
          ['내림', counts.hidden],
        ].map(([label, value]) => (
          <div key={label} className="rounded border border-deep-ocean/10 bg-white p-4">
            <p className="text-sm text-coastal-gray">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(380px,1.1fr)]">
        <section className="rounded border border-deep-ocean/10 bg-white">
          <div className="border-b border-deep-ocean/10 px-4 py-3">
            <h2 className="font-semibold">목록</h2>
          </div>
          <div className="space-y-3 border-b border-deep-ocean/10 px-4 py-3">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="제목, ID, 설명 검색"
              className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            />
            <div className="flex items-center justify-between gap-3">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as AdminStatusFilter)}
                className="rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
              >
                <option value="all">모든 상태</option>
                <option value="published">공개</option>
                <option value="draft">초안</option>
                <option value="hidden">내림</option>
              </select>
              <span className="text-xs text-coastal-gray">
                {filteredItems.length.toLocaleString('ko-KR')} /{' '}
                {totalCount.toLocaleString('ko-KR')}
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
                const active = selected?.id === item.id;
                const status = getRowStatus(item);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => selectItem(item)}
                      className={classNames(
                        'w-full px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-jeju-ocean',
                        active ? 'bg-jeju-ocean/10' : 'hover:bg-ocean-sand/40'
                      )}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="block font-semibold">
                            {getPrimaryLabel(item, config)}
                          </span>
                          <span className="mt-1 block text-xs text-coastal-gray">
                            {getRowUpdatedAt(item)
                              ? new Date(getRowUpdatedAt(item)).toLocaleString('ko-KR')
                              : ''}
                          </span>
                        </span>
                        <span className={statusClass(status)}>{statusLabel(status)}</span>
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
                onClick={loadMore}
                disabled={isLoadingMore || isLoadingAll}
                className="w-full rounded border border-deep-ocean/20 bg-white px-4 py-2 text-sm font-semibold text-deep-ocean transition hover:bg-ocean-sand/40 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
              >
                {isLoadingMore ? '불러오는 중' : '더 불러오기'}
              </button>
              <button
                type="button"
                onClick={loadAll}
                disabled={isLoadingMore || isLoadingAll}
                className="w-full rounded border border-jeju-ocean/40 bg-white px-4 py-2 text-sm font-semibold text-jeju-ocean transition hover:bg-jeju-ocean/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
              >
                {isLoadingAll ? '전체 불러오는 중' : '전체 불러오기'}
              </button>
            </div>
          )}
        </section>

        <section className="rounded border border-deep-ocean/10 bg-white">
          <div className="border-b border-deep-ocean/10 px-4 py-3">
            <h2 className="font-semibold">{selected ? '항목 편집' : '새 항목 추가'}</h2>
          </div>
          <div className="space-y-4 p-4">
            <fieldset disabled={!canEdit} className="space-y-4 border-0 p-0 disabled:opacity-70">
            {config.fields.map((field) => (
              <label key={field.name} className="block">
                <span className="mb-1 block text-sm font-semibold text-deep-ocean">
                  {field.label}
                  {field.required ? <span className="text-sunset-coral"> *</span> : null}
                </span>
                {field.kind === 'textarea' ? (
                  <textarea
                    value={form[field.name] ?? ''}
                    onChange={(event) => updateField(field.name, event.target.value)}
                    rows={field.name === 'value' || field.name === 'description' ? 6 : 3}
                    placeholder={field.placeholder}
                    className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
                  />
                ) : field.kind === 'select' ? (
                  <select
                    value={form[field.name] ?? ''}
                    onChange={(event) => updateField(field.name, event.target.value)}
                    className="w-full rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={
                      field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : 'text'
                    }
                    value={form[field.name] ?? ''}
                    onChange={(event) => updateField(field.name, event.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
                  />
                )}
              </label>
            ))}
            </fieldset>

            {config.collection === 'gallery' && canEdit && (
              <label className="block rounded border border-dashed border-deep-ocean/20 bg-ocean-sand/30 px-3 py-4">
                <span className="mb-1 block text-sm font-semibold text-deep-ocean">
                  이미지 업로드
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isSaving}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadGalleryImage(file);
                    event.target.value = '';
                  }}
                  className="block w-full text-sm text-coastal-gray file:mr-3 file:rounded file:border-0 file:bg-jeju-ocean file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-deep-ocean disabled:opacity-60"
                />
                <span className="mt-2 block text-xs text-coastal-gray">
                  업로드 후 URL이 자동 입력됩니다. 항목 저장을 눌러야 공개 데이터에 반영됩니다.
                </span>
              </label>
            )}

            {selected && canEdit && cloneLocaleOptions.length > 0 && (
              <div className="rounded border border-deep-ocean/10 bg-ocean-sand/30 px-3 py-4">
                <span className="mb-2 block text-sm font-semibold text-deep-ocean">
                  다른 언어 초안 만들기
                </span>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={cloneLocale}
                    onChange={(event) => setCloneLocale(event.target.value)}
                    disabled={isSaving}
                    className="rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20 disabled:opacity-60"
                  >
                    {cloneLocaleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={cloneSelectedToLocale}
                    disabled={isSaving || !cloneLocale || cloneLocale === selectedLocale}
                    className="rounded border border-jeju-ocean/40 bg-white px-3 py-2 text-sm font-semibold text-jeju-ocean transition hover:bg-jeju-ocean/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
                  >
                    초안 생성
                  </button>
                </div>
                <span className="mt-2 block text-xs text-coastal-gray">
                  현재 항목을 선택한 언어의 초안으로 복제합니다. 저장된 공개 상태는 복제하지
                  않습니다.
                </span>
              </div>
            )}

            {selected && (
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
                          <span className={statusClass(item.status)}>
                            {statusLabel(item.status)}
                          </span>
                        </a>
                      ))}
                    </div>
                    {localeStatusCounts.missing > 0 && canEdit && (
                      <button
                        type="button"
                        onClick={cloneMissingLocales}
                        disabled={isSaving}
                        className="mt-3 rounded border border-jeju-ocean/40 bg-white px-3 py-2 text-sm font-semibold text-jeju-ocean transition hover:bg-jeju-ocean/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
                      >
                        없는 언어 초안 모두 생성
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {message && (
              <p className="rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">
                {message}
              </p>
            )}
            {error && (
              <p className="whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {canEdit && (
                <button
                  type="button"
                  onClick={save}
                  disabled={isSaving}
                  className="rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
                >
                  {isSaving ? '저장 중' : '저장'}
                </button>
              )}
              {selected && canEdit && (
                <button
                  type="button"
                  onClick={hideSelected}
                  disabled={isSaving}
                  className="rounded border border-sunset-coral/50 bg-white px-4 py-2 font-semibold text-sunset-coral transition hover:bg-sunset-coral/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-coral"
                >
                  공개에서 내리기
                </button>
              )}
              {selected && previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-deep-ocean/20 bg-white px-4 py-2 font-semibold text-deep-ocean transition hover:bg-ocean-sand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
                >
                  공개 위치 열기
                </a>
              )}
            </div>
            {selected && previewUrl && selectedStatus !== 'published' && (
              <p className="text-xs text-coastal-gray">
                초안 또는 내림 상태는 공개 페이지에서 보이지 않을 수 있습니다.
              </p>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
