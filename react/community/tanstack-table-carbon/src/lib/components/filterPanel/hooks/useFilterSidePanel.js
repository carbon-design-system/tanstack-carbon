import { useState, useCallback } from 'react';

/**
 * Custom hook to manage filter panel state and filter functions
 *
 * @param {Object} table - TanStack table instance
 * @param {Function} onColumnFiltersChange - Optional callback when filters change
 * @returns {Object} Filter panel state, handlers, and filter function
 */
export const useFilterSidePanel = (table, onColumnFiltersChange) => {
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  /**
   * Custom filter function for checkbox filters (OR logic within same column)
   * Memoized to maintain stable reference across renders
   */
  const arrayFilterFn = useCallback((row, columnId, filterValue) => {
    if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
      return true;
    }
    const cellValue = row.getValue(columnId);
    return filterValue.includes(cellValue);
  }, []);

  const openFilterPanel = useCallback(() => {
    setShowFilterPanel(true);
  }, []);

  const closeFilterPanel = useCallback(() => {
    setShowFilterPanel(false);
  }, []);

  const toggleFilterPanel = useCallback(() => {
    setShowFilterPanel((prev) => !prev);
  }, []);

  const applyFilters = useCallback(
    (filters) => {
      if (table) {
        table.setColumnFilters(filters);
        if (onColumnFiltersChange) {
          onColumnFiltersChange(filters);
        }
      }
    },
    [table, onColumnFiltersChange]
  );

  const clearFilters = useCallback(() => {
    if (table) {
      table.resetColumnFilters();
      if (onColumnFiltersChange) {
        onColumnFiltersChange([]);
      }
    }
  }, [table, onColumnFiltersChange]);

  return {
    showFilterPanel,
    openFilterPanel,
    closeFilterPanel,
    toggleFilterPanel,
    applyFilters,
    clearFilters,
    arrayFilterFn,
  };
};

export default useFilterSidePanel;
