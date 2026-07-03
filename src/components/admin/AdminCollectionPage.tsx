import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from './AdminLayout';
import AdminCollectionListPanel from './AdminCollectionListPanel';
import AdminCollectionStatusCards from './AdminCollectionStatusCards';
import AdminLocaleStatusPanel from './AdminLocaleStatusPanel';
import AdminArchiveFilterBar from './AdminArchiveFilterBar';
import {
  ADMIN_COLLECTION_PAGE_SIZE,
  LOCALE_OPTIONS,
  filterAdminRows,
  getAdminPreviewUrl,
  getRowStatus,
  mergeAdminRowsById,
  prepareAdminLocaleClonePayload,
  prepareAdminMissingLocaleClonePayloads,
  type AdminLocaleStatus,
  type AdminStatusFilter,
  type AdminCollectionConfig,
  type AdminCollectionRow,
  type ArchiveFilterOption,
} from '@/lib/adminArchive';
import type { AdminMember } from '@/types/cms';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { buildAdminFormState, type AdminCollectionFormState } from './adminCollectionForm';
import AdminFieldControl, { type MusicianOption } from './AdminFieldControl';
import AdminPressCardPreview from './AdminPressCardPreview';
import { buildPhotographerOptions, type PhotographerOption } from '@/data/photographers';

// 관리자 비디오 편집 패널에서 어떤 영상인지 바로 확인할 수 있도록
// youtube_url(embed/watch/youtu.be 형식)에서 영상 ID를 뽑아 임베드한다.
const getYoutubeEmbedId = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.includes('/embed/')) return trimmed.split('/embed/')[1]?.split(/[?&]/)[0] ?? '';
  if (trimmed.includes('watch?v=')) return trimmed.split('watch?v=')[1]?.split('&')[0] ?? '';
  if (trimmed.includes('youtu.be/')) return trimmed.split('youtu.be/')[1]?.split(/[?&]/)[0] ?? '';
  return '';
};

export interface AdminCollectionPageProps {
  config: AdminCollectionConfig;
  initialItems: AdminCollectionRow[];
  initialTotalCount: number;
  initialNextOffset: number;
  initialHasMore: boolean;
  member: AdminMember;
  selectedLocale: string;
  selectedType: string;
  selectedYear: string;
  typeOptions: ArchiveFilterOption[];
  yearOptions: ArchiveFilterOption[];
  initialError?: string;
}

export default function AdminCollectionPage({
  config,
  initialItems,
  initialTotalCount,
  initialNextOffset,
  initialHasMore,
  member,
  selectedLocale,
  selectedType,
  selectedYear,
  typeOptions,
  yearOptions,
  initialError = '',
}: AdminCollectionPageProps) {
  const router = useRouter();
  const canEdit = member.role !== 'viewer';
  const buildListParams = (offset: number, limit: number) => {
    const params = new URLSearchParams({
      locale: selectedLocale,
      offset: String(offset),
      limit: String(limit),
    });
    if (selectedType) params.set('type', selectedType);
    if (selectedYear) params.set('year', selectedYear);
    return params;
  };
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<AdminCollectionRow | null>(initialItems[0] ?? null);
  const [form, setForm] = useState<AdminCollectionFormState>(() =>
    buildAdminFormState(config, initialItems[0], selectedLocale)
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
  const [musicians, setMusicians] = useState<MusicianOption[]>([]);

  // 비동기 완료 콜백(save/hideSelected/cloneMissingLocales)이 "응답이 도착한 지금도
  // 그 요청의 대상이 여전히 선택돼 있는가"를 대조할 수 있도록, 현재 선택 id를 ref로 추적한다.
  // (저장 도중 사용자가 다른 항목 편집을 시작하면 그 입력을 덮어쓰지 않기 위함)
  const selectedIdRef = useRef<string | null>(initialItems[0]?.id ?? null);
  useEffect(() => {
    selectedIdRef.current = selected?.id ?? null;
  }, [selected?.id]);

  // 뮤지션 선택 위젯이 있는 컬렉션(예: 비디오)에서만 이름 목록을 불러온다.
  const needsMusicians = useMemo(
    () =>
      config.fields.some((field) => field.kind === 'musician' || field.kind === 'musician-multi'),
    [config.fields]
  );

  useEffect(() => {
    if (!needsMusicians) return;
    let cancelled = false;
    const loadMusicians = async () => {
      try {
        const response = await fetch('/data/musicians.json');
        if (!response.ok) return;
        const data = (await response.json()) as Array<{ id?: number; name?: string }>;
        if (cancelled || !Array.isArray(data)) return;
        setMusicians(
          data
            .filter((item): item is MusicianOption => typeof item.id === 'number' && !!item.name)
            .map((item) => ({ id: item.id, name: item.name }))
            .sort((a, b) => a.id - b.id)
        );
      } catch {
        // 목록 로드 실패 시 폼은 id 직접 입력으로 폴백한다.
      }
    };
    void loadMusicians();
    return () => {
      cancelled = true;
    };
  }, [needsMusicians]);

  const [photographers, setPhotographers] = useState<PhotographerOption[]>([]);
  const needsPhotographers = useMemo(
    () => config.fields.some((field) => field.kind === 'photographer'),
    [config.fields]
  );

  // 작가 선택 위젯이 있으면 slug 목록(photographers.ts) + 표시 이름(ko/gallery.json)을 모은다.
  useEffect(() => {
    if (!needsPhotographers) return;
    let cancelled = false;
    const loadPhotographers = async () => {
      try {
        const response = await fetch('/locales/ko/gallery.json');
        const dict = response.ok
          ? ((await response.json()) as { photographers?: Record<string, { name?: string }> })
          : null;
        if (cancelled) return;
        setPhotographers(buildPhotographerOptions(dict?.photographers ?? null));
      } catch {
        if (!cancelled) setPhotographers(buildPhotographerOptions(null));
      }
    };
    void loadPhotographers();
    return () => {
      cancelled = true;
    };
  }, [needsPhotographers]);

  const counts = useMemo(
    () => ({
      all: totalCount,
      published: items.filter((item) => getRowStatus(item) === 'published').length,
      draft: items.filter((item) => getRowStatus(item) === 'draft').length,
      hidden: items.filter((item) => getRowStatus(item) === 'hidden').length,
      approximate: hasMore,
    }),
    [items, totalCount, hasMore]
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
      try {
        const params = new URLSearchParams({ localeStatusId: selected.id });
        const response = await fetch(
          `/api/admin/archive/${config.collection}?${params.toString()}`
        );
        const payload = (await response.json()) as {
          locales?: AdminLocaleStatus[];
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok || !payload.locales) {
          setLocaleStatuses([]);
          return;
        }
        setLocaleStatuses(payload.locales);
      } catch {
        if (!cancelled) setLocaleStatuses([]);
      } finally {
        if (!cancelled) setIsLoadingLocaleStatuses(false);
      }
    };

    void loadLocaleStatuses();

    return () => {
      cancelled = true;
    };
  }, [config.collection, selected?.id]);

  const selectItem = (item: AdminCollectionRow | null) => {
    setSelected(item);
    setForm(buildAdminFormState(config, item, selectedLocale));
    setMessage('');
    setError('');
  };

  const updateField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const refreshItems = async (preferredId?: string) => {
    const refreshLimit = Math.max(items.length, ADMIN_COLLECTION_PAGE_SIZE);
    const params = buildListParams(0, refreshLimit);
    const response = await fetch(`/api/admin/archive/${config.collection}?${params.toString()}`);
    if (!response.ok) return;
    const payload = (await response.json()) as {
      items: AdminCollectionRow[];
      totalCount?: number;
      nextOffset?: number;
      hasMore?: boolean;
    };
    const nextItems = payload.items;
    // 목록 데이터 갱신은 컨텍스트와 무관한 전역 부수효과라 항상 반영한다.
    setItems(nextItems);
    setTotalCount(payload.totalCount ?? nextItems.length);
    setNextOffset(payload.nextOffset ?? nextItems.length);
    setHasMore(payload.hasMore ?? false);

    // 선택·폼 덮어쓰기는 요청 시작 시점의 대상(preferredId)이 응답 도착 시점에도
    // 여전히 현재 선택일 때만 수행한다. 저장/내림 도중 다른 항목으로 이동했다면 그 편집을 지킨다.
    if (preferredId !== undefined && selectedIdRef.current !== preferredId) return;
    const activeId = preferredId ?? selectedIdRef.current ?? undefined;
    const nextSelected = activeId
      ? (nextItems.find((item) => item.id === activeId) ?? nextItems[0] ?? null)
      : (nextItems[0] ?? null);
    setSelected(nextSelected);
    setForm(buildAdminFormState(config, nextSelected, selectedLocale));
  };

  const loadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setError('');

    const params = buildListParams(nextOffset, ADMIN_COLLECTION_PAGE_SIZE);
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
      const params = buildListParams(offset, ADMIN_COLLECTION_PAGE_SIZE);
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
    const params = new URLSearchParams({ locale: nextLocale });
    if (selectedType) params.set('type', selectedType);
    if (selectedYear) params.set('year', selectedYear);
    await router.push(`${config.listPath}?${params.toString()}`);
  };

  const changeFilter = async (next: { type?: string; year?: string }) => {
    const params = new URLSearchParams({ locale: selectedLocale });
    const type = next.type ?? selectedType;
    const year = next.year ?? selectedYear;
    if (type) params.set('type', type);
    if (year) params.set('year', year);
    await router.push(`${config.listPath}?${params.toString()}`);
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
    // 요청 시작 시점의 편집 대상(신규 항목이면 null)을 캡처해 응답 도착 시 대조한다.
    const targetId = selected?.id ?? null;
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

    const wasExisting = Boolean(form.id);
    setMessage(
      payload.changeLogError
        ? `저장했습니다. 변경 이력 기록 실패: ${payload.changeLogError}`
        : '저장했습니다.'
    );
    // 저장 요청 도중 다른 항목으로 이동했다면 선택·폼을 덮어쓰지 않는다(입력 소실 방지).
    if (selectedIdRef.current === targetId) {
      setSelected(payload.item);
      setForm(buildAdminFormState(config, payload.item, selectedLocale));
    }
    await refreshItems(payload.item.id);
    if (wasExisting && selectedIdRef.current === targetId) {
      try {
        await refreshLocaleStatuses(payload.item.id);
      } catch {
        // 언어 상태 갱신 실패는 저장 성공 메시지를 덮어쓰지 않음
      }
    }
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

    // 복제 후 이동 시에도 현재 유형/연도 필터를 유지한다(changeLocale과 동일).
    const params = new URLSearchParams({ locale: cloneLocale });
    if (selectedType) params.set('type', selectedType);
    if (selectedYear) params.set('year', selectedYear);
    await router.push(`${config.listPath}?${params.toString()}`);
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
    const targetId = selected.id;
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
    // 복제 도중 다른 항목으로 이동했다면 그 항목의 언어 상태 패널을 덮어쓰지 않는다.
    if (selectedIdRef.current !== targetId) return;
    try {
      await refreshLocaleStatuses(targetId);
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

      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded border border-deep-ocean/10 bg-white px-4 py-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-deep-ocean">
          언어
          <select
            value={selectedLocale}
            onChange={(event) => void changeLocale(event.target.value)}
            className="rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm font-normal focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
          >
            {LOCALE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {config.yearTypeFilter && (
          <AdminArchiveFilterBar
            typeOptions={typeOptions}
            yearOptions={yearOptions}
            selectedType={selectedType}
            selectedYear={selectedYear}
            onChangeType={(value) => void changeFilter({ type: value })}
            onChangeYear={(value) => void changeFilter({ year: value })}
          />
        )}
      </div>

      <AdminCollectionStatusCards counts={counts} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(380px,1.1fr)]">
        <AdminCollectionListPanel
          config={config}
          items={items}
          filteredItems={filteredItems}
          selectedId={selected?.id ?? null}
          totalCount={totalCount}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          isLoadingAll={isLoadingAll}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchQueryChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          onSelectItem={selectItem}
          onLoadMore={() => void loadMore()}
          onLoadAll={() => void loadAll()}
        />

        <section className="rounded border border-deep-ocean/10 bg-white">
          <div className="border-b border-deep-ocean/10 px-4 py-3">
            <h2 className="font-semibold">{selected ? '항목 편집' : '새 항목 추가'}</h2>
          </div>
          <div className="space-y-4 p-4">
            {config.collection === 'videos' &&
              (() => {
                const embedId = getYoutubeEmbedId(form.youtube_url ?? '');
                if (!embedId) return null;
                return (
                  <div className="overflow-hidden rounded border border-deep-ocean/10 bg-black">
                    <div className="relative aspect-video w-full">
                      <iframe
                        key={embedId}
                        src={`https://www.youtube.com/embed/${embedId}`}
                        title="영상 미리보기"
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>
                );
              })()}
            {config.collection === 'press' && (
              <AdminPressCardPreview
                key={form.image_url ?? ''}
                title={form.title ?? ''}
                publisher={form.publisher ?? ''}
                date={form.date ?? ''}
                description={form.description ?? ''}
                imageUrl={form.image_url ?? ''}
              />
            )}
            {config.imageField && form[config.imageField] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form[config.imageField]}
                alt="현재 이미지 미리보기"
                className="max-h-64 w-full rounded border border-deep-ocean/10 bg-ocean-sand/20 object-contain"
              />
            ) : null}
            <fieldset disabled={!canEdit} className="space-y-4 border-0 p-0 disabled:opacity-70">
              {config.fields
                .filter((field) => !field.hidden)
                .map((field) => (
                  <label key={field.name} className="block">
                    <span className="mb-1 block text-sm font-semibold text-deep-ocean">
                      {field.label}
                      {field.required ? <span className="text-sunset-coral"> *</span> : null}
                    </span>
                    <AdminFieldControl
                      field={field}
                      value={form[field.name] ?? ''}
                      disabled={!canEdit}
                      musicians={musicians}
                      photographers={photographers}
                      onChange={(value) => updateField(field.name, value)}
                    />
                    {field.hint ? (
                      <span className="mt-1 block text-xs text-coastal-gray">{field.hint}</span>
                    ) : null}
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
              <AdminLocaleStatusPanel
                config={config}
                localeStatuses={localeStatuses}
                localeStatusCounts={localeStatusCounts}
                isLoadingLocaleStatuses={isLoadingLocaleStatuses}
                canEdit={canEdit}
                isSaving={isSaving}
                onCloneMissingLocales={() => void cloneMissingLocales()}
              />
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
