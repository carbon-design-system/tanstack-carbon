export const isEmptyFilterValue = (value) =>
  value === undefined || value === '' || (Array.isArray(value) && value.length === 0);

export const getFilterValue = (filters, columnId) => {
  const filter = filters.find((item) => item.id === columnId);
  return filter?.value;
};

export const setOrRemoveFilter = (filters, columnId, value) => {
  const nextFilters = [...filters];
  const foundIndex = nextFilters.findIndex((item) => item.id === columnId);

  if (isEmptyFilterValue(value)) {
    if (foundIndex > -1) {
      nextFilters.splice(foundIndex, 1);
    }
    return nextFilters;
  }

  if (foundIndex > -1) {
    nextFilters[foundIndex] = { id: columnId, value };
    return nextFilters;
  }

  nextFilters.push({ id: columnId, value });
  return nextFilters;
};

export const toggleCheckboxFilterValue = (filters, columnId, value, checked) => {
  const nextFilters = [...filters];
  const existingFilter = nextFilters.find((item) => item.id === columnId);
  const existingIndex = existingFilter
    ? nextFilters.findIndex((item) => item.id === existingFilter.id)
    : -1;

  if (checked) {
    if (existingIndex > -1) {
      const existingValues = existingFilter?.value || [];
      nextFilters.splice(existingIndex, 1);
      nextFilters.push({ id: columnId, value: [...existingValues, value] });
      return nextFilters;
    }

    nextFilters.push({ id: columnId, value: [value] });
    return nextFilters;
  }

  if (existingIndex > -1) {
    const existingValues = existingFilter?.value || [];
    const updatedValues = existingValues.filter((item) => item !== value);
    nextFilters.splice(existingIndex, 1);

    if (updatedValues.length > 0) {
      nextFilters.push({ id: columnId, value: updatedValues });
    }
  }

  return nextFilters;
};
