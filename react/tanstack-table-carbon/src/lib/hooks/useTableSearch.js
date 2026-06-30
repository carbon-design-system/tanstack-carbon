import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Custom hook to manage table search functionality with debouncing
 * Handles both client-side and server-side search scenarios
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onSearchChange - Optional callback for server-side search
 * @param {number} options.debounceDelay - Debounce delay in milliseconds (default: 500ms)
 * @param {Array} options.columns - Table columns for formatted value search
 * @returns {Object} Search state and handlers
 */
export const useTableSearch = ({ onSearchChange, debounceDelay = 500, columns = [] }) => {
  const [immediateSearchValue, setImmediateSearchValue] = useState('');

  // NOTE: Debounced search value (used for actual filtering/API calls)
  const debouncedSearchValue = useDebounce(immediateSearchValue, debounceDelay);

  const [globalFilter, setGlobalFilter] = useState('');

  // NOTE: Update global filter and trigger server-side search when debounced value changes
  useEffect(() => {
    setGlobalFilter((prev) => (prev === debouncedSearchValue ? prev : debouncedSearchValue));

    if (onSearchChange) {
      onSearchChange(debouncedSearchValue);
    }
  }, [debouncedSearchValue]);

  /**
   * Custom global filter function that searches both raw and formatted values
   * This enables searching dates in their displayed format (e.g., "Dec 15, 2025")
   * instead of just the stored format (e.g., "2025-12-15")
   *
   * @performance Memoized to prevent recreation on every render
   */
  const globalFilterFn = useCallback(
    (row, columnId, filterValue) => {
      const searchTerm = String(filterValue).toLowerCase();

      // NOTE: Search across ALL columns, not just the current one
      for (const column of columns) {
        const colId = column.accessorKey || column.id;

        // NOTE: Skip special columns
        if (!colId || colId === 'select' || colId === 'overflow-menu') {
          continue;
        }

        try {
          const rawValue = row.getValue(colId);

          // NOTE: Search in raw value
          if (rawValue !== null && String(rawValue).toLowerCase().includes(searchTerm)) {
            return true;
          }

          // NOTE: If column has a cell formatter, try to get formatted value
          if (column.cell && typeof column.cell === 'function') {
            try {
              const mockGetValue = () => rawValue;
              const formattedValue = column.cell({ getValue: mockGetValue, row });

              // NOTE: Search in formatted value if it's a string
              if (formattedValue && typeof formattedValue === 'string') {
                if (formattedValue.toLowerCase().includes(searchTerm)) {
                  return true;
                }
              }
            } catch {
              // NOTE: If formatting fails, continue to next column
            }
          }
        } catch {
          // NOTE: If getValue fails, continue to next column
          continue;
        }
      }

      return false;
    },
    [columns]
  );

  const handleSearchChange = useCallback((value) => {
    setImmediateSearchValue(value);
  }, []);

  const clearSearch = useCallback(() => {
    setImmediateSearchValue('');
  }, []);

  return {
    // NOTE: State
    globalFilter,
    immediateSearchValue,
    debouncedSearchValue,
    isSearching: immediateSearchValue !== debouncedSearchValue,

    // NOTE: Handlers
    handleSearchChange,
    clearSearch,

    // NOTE: Filter function
    globalFilterFn,
  };
};
