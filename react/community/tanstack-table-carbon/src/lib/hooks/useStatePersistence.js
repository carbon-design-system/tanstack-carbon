/*
 ************************************************************
 * IBM Confidential
 * OCO Source Materials
 * 5655-ABB
 * Copyright IBM Corp. 2026
 * The source code for this program is not published
 * or otherwise divested of its trade secrets,
 * irrespective of what has been deposited with the
 * U. S. Copyright Office.
 ************************************************************
 */

import { useEffect, useRef } from 'react';
import { isEqualFilterValue } from '../components/filterPanel/utils/filterPayloadHelpers.js';

/**
 * Custom hook to report consolidated table state changes (pagination, search, filters, sorting)
 * for persistence across sessions, navigation, or URL syncing.
 *
 * @param {Object} options
 * @param {Object} [options.statePersistence] - Configuration for state persistence
 * @param {Object} [options.paginationState]   - Current pagination { pageIndex, pageSize }
 * @param {string} [options.searchValue]       - Current debounced search string
 * @param {Array}  [options.columnFilters]     - Current array of column filters [{ id, value }]
 * @param {Array}  [options.sorting]           - Current sorting state [{ id, desc }]
 */
export const useStatePersistence = ({
  statePersistence,
  paginationState,
  searchValue,
  columnFilters,
  sorting = [],
}) => {
  // Keep track of the last reported state snapshot to skip reporting on initial render
  // and when no actual value has changed.
  const lastReportedStateRef = useRef({
    pagination: paginationState,
    search: searchValue,
    filters: columnFilters,
    sorting,
  });

  const onStateChange = statePersistence?.onStateChange;
  const isEnabled = Boolean(
    statePersistence &&
      statePersistence.enabled !== false &&
      typeof onStateChange === 'function'
  );

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const last = lastReportedStateRef.current;
    const isPaginationEqual =
      last.pagination?.pageIndex === paginationState?.pageIndex &&
      last.pagination?.pageSize === paginationState?.pageSize;
    const isSearchEqual = (last.search ?? '') === (searchValue ?? '');
    const isFiltersEqual = isEqualFilterValue(last.filters, columnFilters);
    const isSortingEqual = isEqualFilterValue(
      last.sorting ?? [],
      sorting ?? []
    );

    // Always keep the ref current so that if isEnabled later flips true→false→true,
    // the snapshot reflects the most recent state rather than the initial mount values.
    // Without this, re-enabling persistence fires a spurious onStateChange even when
    // nothing has actually changed since the last reported snapshot.
    lastReportedStateRef.current = {
      pagination: paginationState,
      search: searchValue,
      filters: columnFilters,
      sorting,
    };

    if (
      isPaginationEqual &&
      isSearchEqual &&
      isFiltersEqual &&
      isSortingEqual
    ) {
      return;
    }

    onStateChange({
      pagination: paginationState,
      search: searchValue,
      filters: columnFilters,
      sorting,
    });
  }, [
    isEnabled,
    onStateChange,
    paginationState,
    searchValue,
    columnFilters,
    sorting,
  ]);
};

export default useStatePersistence;
