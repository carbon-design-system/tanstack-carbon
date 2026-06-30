import { useMemo } from 'react';

const SEARCHABLE_FILTER_TYPES = ['select', 'checkbox', 'radio', 'multiselect'];

export const useFilterableColumns = ({ columns = [], searchTerm = '' }) => {
  const filterableColumns = useMemo(() => {
    return columns.filter((col) => col.getCanFilter());
  }, [columns]);

  const searchedColumns = useMemo(() => {
    if (!searchTerm) {
      return filterableColumns.map((col) => ({ column: col, matchedByLabel: false }));
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    return filterableColumns
      .map((col) => {
        const header = col.columnDef.header?.toLowerCase() || '';
        const id = col.id?.toLowerCase() || '';
        const matchedByLabel = header.includes(lowerSearchTerm) || id.includes(lowerSearchTerm);

        if (matchedByLabel) {
          return { column: col, matchedByLabel: true };
        }

        const filterVariant = col.columnDef.meta?.filterVariant;

        if (SEARCHABLE_FILTER_TYPES.includes(filterVariant)) {
          const uniqueValues = Array.from(col.getFacetedUniqueValues().keys());
          const hasMatchingOption = uniqueValues.some((value) =>
            String(value).toLowerCase().includes(lowerSearchTerm)
          );

          if (hasMatchingOption) {
            return { column: col, matchedByLabel: false };
          }
        }

        return null;
      })
      .filter(Boolean);
  }, [filterableColumns, searchTerm]);

  return {
    filterableColumns,
    searchedColumns,
  };
};

export default useFilterableColumns;
