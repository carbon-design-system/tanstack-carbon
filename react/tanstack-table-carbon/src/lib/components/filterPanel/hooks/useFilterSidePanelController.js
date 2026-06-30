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
      setLocalFilters(toggleCheckboxFilterValue(localFilters, columnId, value, checked));
    },
    [localFilters]
  );

  const handleApply = useCallback(() => {
    const nextFilters = cloneFilterPayload(localFilters);
    const changedFilters = buildDeltaChangedFilters(nextFilters, appliedFiltersRef.current);
    appliedFiltersRef.current = cloneFilterPayload(nextFilters);

    onApplyFilters(nextFilters);
    onSidePanelApply?.({
      changedFilters,
    });
  }, [localFilters, onApplyFilters, onSidePanelApply]);

  const handleClearAll = useCallback(() => {
    setLocalFilters([]);
    setFilterErrors({});
    onClearFilters();
    appliedFiltersRef.current = [];

    onSidePanelReset?.({
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
      const payload = {
        allFilters: safePayload,
        changedFilters,
      };

      appliedCustomFiltersRef.current = cloneFilterPayload(safePayload);
      onCustomFiltersApply?.(payload);
    },
    [onCustomFiltersApply]
  );

  const handleCustomFilterReset = useCallback(
    (filterValues) => {
      const safePayload = cloneFilterPayload(filterValues ?? {});
      setIsCustomFiltersValid(true);

      appliedCustomFiltersRef.current = cloneFilterPayload(safePayload);
      onCustomFiltersReset?.({
        allFilters: safePayload,
        changedFilters: [],
      });
    },
    [onCustomFiltersReset]
  );

  const handleValidationChange = useCallback((isValid) => {
    setIsCustomFiltersValid(isValid);
  }, []);

  const handleCustomFilterStateChange = useCallback(({ filterValues, resetFilters }) => {
    const safeFilterValues = cloneFilterPayload(filterValues ?? {});

    customFilterStateRef.current = {
      filterValues: safeFilterValues,
      resetFilters,
      initialized: true,
    };

    if (
      !appliedCustomFiltersRef.current ||
      Object.keys(appliedCustomFiltersRef.current).length === 0
    ) {
      appliedCustomFiltersRef.current = cloneFilterPayload(safeFilterValues);
    }
  }, []);

  const handleCustomApplyClick = useCallback(() => {
    handleCustomFilterApply(customFilterStateRef.current.filterValues ?? {});
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
