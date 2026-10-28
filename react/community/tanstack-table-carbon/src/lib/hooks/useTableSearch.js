import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Custom hook to manage table search functionality with debouncing.
 *
 * Uses TanStack's built-in global filter mechanism (includesString / 'auto').
 * TanStack calls the filterFn once per filterable column per row, using
 * row.getValue(columnId) which reads from TanStack's internal _valuesCache —
 * an O(1) property lookup already populated when the row model was built.
 * No custom filterFn, no JSX cell renderer calls, no manual column loops.
 *
 * @param {Object} options
 * @param {Function} options.onSearchChange - Optional callback for server-side search
 * @param {number}   options.debounceDelay  - Debounce delay in ms (default 500)
 */
export const useTableSearch = ({
  initialSearchValue = '',
  onSearchChange,
  debounceDelay = 500,
}) => {
  const [immediateSearchValue, setImmediateSearchValue] = useState(initialSearchValue);
  const debouncedSearchValue = useDebounce(immediateSearchValue, debounceDelay);
  const [globalFilter, setGlobalFilter] = useState(initialSearchValue);

  // NOTE: Sync TanStack globalFilter state after debounce + fire server-side callback
  useEffect(() => {
    setGlobalFilter((prev) =>
      prev === debouncedSearchValue ? prev : debouncedSearchValue
    );
    if (onSearchChange) {
      onSearchChange(debouncedSearchValue);
    }
  }, [debouncedSearchValue]);

  const handleSearchChange = useCallback(
    (value) => setImmediateSearchValue(value),
    []
  );
  const clearSearch = useCallback(() => setImmediateSearchValue(''), []);

  return {
    globalFilter,
    immediateSearchValue,
    debouncedSearchValue,
    isSearching: immediateSearchValue !== debouncedSearchValue,
    handleSearchChange,
    clearSearch,
  };
};
