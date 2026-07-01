export const cloneFilterPayload = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value ?? {}));
};

export const isEqualFilterValue = (a, b) =>
  JSON.stringify(cloneFilterPayload(a)) === JSON.stringify(cloneFilterPayload(b));

export const buildAllFiltersMap = (filters) => {
  return (filters || []).reduce((acc, filter) => {
    acc[filter.id] = cloneFilterPayload(filter.value);
    return acc;
  }, {});
};

export const buildDeltaChangedFilters = (currentFilters, previousFilters) => {
  const previousMap = new Map((previousFilters || []).map((filter) => [filter.id, filter.value]));

  return (currentFilters || []).filter((filter) => {
    return !isEqualFilterValue(filter.value, previousMap.get(filter.id));
  });
};

export const buildCustomChangedFilters = (filterValues, previousFilterValues) => {
  const currentEntries = Object.entries(filterValues || {});
  const previousEntries = Object.entries(previousFilterValues || {});
  const allKeys = new Set([
    ...currentEntries.map(([id]) => id),
    ...previousEntries.map(([id]) => id),
  ]);

  return Array.from(allKeys)
    .filter((id) => !isEqualFilterValue(filterValues?.[id], previousFilterValues?.[id]))
    .map((id) => ({
      id,
      value: cloneFilterPayload(filterValues?.[id]),
    }));
};
