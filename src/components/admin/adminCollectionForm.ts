import {
  normalizeAdminFormValue,
  type AdminCollectionConfig,
  type AdminCollectionRow,
} from '@/lib/adminArchive';

export type AdminCollectionFormState = Record<string, string>;

export const buildAdminFormState = (
  config: AdminCollectionConfig,
  item?: AdminCollectionRow | null,
  selectedLocale = 'ko'
): AdminCollectionFormState => {
  const source = (item ?? {}) as unknown as Record<string, unknown>;
  return config.fields.reduce<AdminCollectionFormState>(
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
