/* eslint-disable custom/hooks-first */
import { useState, useEffect, useCallback } from 'react';

export const useSortingFeature = (sortingFeature) => {
  const controlledSorting = sortingFeature?.sorting;
  const onChange = sortingFeature?.onChange;
  const isControlledSorting = typeof onChange === 'function';

  const [sorting, setSorting] = useState(controlledSorting ?? []);

  useEffect(() => {
    if (controlledSorting !== undefined) {
      setSorting(controlledSorting);
    }
  }, [controlledSorting]);

  const handleSortingChange = useCallback(
    (updater) => {
      const nextSorting = typeof updater === 'function' ? updater(sorting) : updater;

      if (isControlledSorting) {
        onChange(nextSorting);
        return;
      }

      setSorting(nextSorting);
    },
    [sorting, isControlledSorting, onChange]
  );

  return {
    sorting,
    handleSortingChange,
    isControlledSorting,
    isServerSideSorting: isControlledSorting,
  };
};

export default useSortingFeature;
