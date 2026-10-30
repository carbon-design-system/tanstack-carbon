import { useState, useRef, useEffect, useCallback } from 'react';
import {
  cloneFilterPayload,
  buildDeltaChangedFilters,
  buildCustomChangedFilters,
} from '../utils/filterPayloadHelpers';
import {
  getFilterValue as getLocalFilterValue,
  setOrRemoveFilter,
  toggleCheckboxFilterValue,
} from '../utils/filterStateHelpers';

export const useFilterSidePanelController = ({
  columnFilters = [],
  onApplyFilters,
  onClearFilters,
  onCustomFiltersApply,
  onCustomFiltersReset,
  onSidePanelApply,
  onSidePanelReset,
}) => {
  const [localFilters, setLocalFilters] = useState(columnFilters);
  const [isCustomFiltersValid, setIsCustomFiltersValid] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterErrors, setFilterErrors] = useState({});

  const sliderValuesRef = useRef({});
  const appliedFiltersRef = useRef([]);
  const appliedCustomFiltersRef = useRef({});
  const customFilterStateRef = useRef({
    filterValues: {},
    resetFilters: null,
    isFilterDisabled: null,
    initialized: false,
  });

  useEffect(() => {
    setLocalFilters(columnFilters);
  }, [columnFilters]);

  useEffect(() => {
    if (localFilters.length === 0) {
      sliderValuesRef.current = {};
    }
  }, [localFilters]);

  const getFilterValue = useCallback(
    (columnId) => getLocalFilterValue(localFilters, columnId),
    [localFilters]
  );

  const updateLocalFilter = useCallback(
    (columnId, value) => {
      setLocalFilters(setOrRemoveFilter(localFilters, columnId, value));
    },
    [localFilters]
  );

  const handleCheckboxChange = useCallback(
    (columnId, value, checked) => {
      setLocalFilters(
        toggleCheckboxFilterValue(localFilters, columnId, value, checked)
      );
    },
    [localFilters]
  );

  const handleApply = useCallback(() => {
    const nextFilters = cloneFilterPayload(localFilters);
    const changedFilters = buildDeltaChangedFilters(
      nextFilters,
      appliedFiltersRef.current
    );
    appliedFiltersRef.current = cloneFilterPayload(nextFilters);

    onApplyFilters(nextFilters);
    onSidePanelApply?.({
      allFilters: cloneFilterPayload(nextFilters),
      changedFilters,
    });
  }, [localFilters, onApplyFilters, onSidePanelApply]);

  const handleClearAll = useCallback(() => {
    setLocalFilters([]);
    setFilterErrors({});
    onClearFilters();
    appliedFiltersRef.current = [];

    onSidePanelReset?.({
      allFilters: [],
      changedFilters: [],
    });
  }, [onClearFilters, onSidePanelReset]);

  const handleCustomFilterApply = useCallback(
    (filterValues) => {
      const safePayload = cloneFilterPayload(filterValues ?? {});
      const changedFilters = buildCustomChangedFilters(
        safePayload,
        appliedCustomFiltersRef.current
      );

      appliedCustomFiltersRef.current = cloneFilterPayload(safePayload);
      // NOTE: Primary arg is the flat filterValues object — consumers use it directly.
      // Second arg carries delta metadata for advanced consumers who need change tracking.
      onCustomFiltersApply?.(safePayload, { changedFilters });
    },
    [onCustomFiltersApply]
  );

  const handleCustomFilterReset = useCallback(
    (filterValues) => {
      const safePayload = cloneFilterPayload(filterValues ?? {});
      setIsCustomFiltersValid(true);

      appliedCustomFiltersRef.current = cloneFilterPayload(safePayload);
      // NOTE: Same pattern — flat filterValues first, metadata second.
      onCustomFiltersReset?.(safePayload, { changedFilters: [] });
    },
    [onCustomFiltersReset]
  );

  const handleValidationChange = useCallback((isValid) => {
    setIsCustomFiltersValid(isValid);
  }, []);

  const handleCustomFilterStateChange = useCallback(
    ({ filterValues, resetFilters, isFilterDisabled }) => {
      const safeFilterValues = cloneFilterPayload(filterValues ?? {});

      customFilterStateRef.current = {
        filterValues: safeFilterValues,
        resetFilters,
        isFilterDisabled: isFilterDisabled ?? null,
        initialized: true,
      };

      if (
        !appliedCustomFiltersRef.current ||
        Object.keys(appliedCustomFiltersRef.current).length === 0
      ) {
        appliedCustomFiltersRef.current = cloneFilterPayload(safeFilterValues);
      }
    },
    []
  );

  const handleCustomApplyClick = useCallback(() => {
    const allValues = customFilterStateRef.current.filterValues ?? {};
    const isFilterDisabled = customFilterStateRef.current.isFilterDisabled;

    // Strip disabled filter keys so they don't appear in tags or get sent to onApply
    const activeValues = isFilterDisabled
      ? Object.fromEntries(
          Object.entries(allValues).filter(([key]) => !isFilterDisabled(key))
        )
      : allValues;

    handleCustomFilterApply(activeValues);
  }, [handleCustomFilterApply]);

  const handleCustomClearClick = useCallback(() => {
    const resetPayload = customFilterStateRef.current.resetFilters?.() ?? {};
    handleCustomFilterReset(resetPayload);
  }, [handleCustomFilterReset]);

  return {
    localFilters,
    setLocalFilters,
    isCustomFiltersValid,
    searchTerm,
    setSearchTerm,
    sliderValuesRef,
    filterErrors,
    setFilterErrors,
    getFilterValue,
    updateLocalFilter,
    handleCheckboxChange,
    handleApply,
    handleClearAll,
    handleCustomFilterApply,
    handleCustomFilterReset,
    handleValidationChange,
    handleCustomFilterStateChange,
    handleCustomApplyClick,
    handleCustomClearClick,
  };
};

export default useFilterSidePanelController;
