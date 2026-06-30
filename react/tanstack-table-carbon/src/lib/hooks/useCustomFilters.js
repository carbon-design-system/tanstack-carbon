import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Custom hook to manage custom filter state and logic
 * Handles validation, dependencies, and conditional enable/disable
 *
 * @param {Object} config - Filter configuration
 * @returns {Object} - Filter state and methods
 */
const useCustomFilters = (config) => {
  /*
    NOTE: Initialize default values from config
    Config can be either an array of sections or an object with a sections property
  */
  const getDefaultValues = useCallback(() => {
    const defaults = {};
    const sections = Array.isArray(config) ? config : config?.sections || [];

    sections.forEach((section) => {
      if (section.type === 'section') {
        section.filters?.forEach((filter) => {
          defaults[filter.id] = filter.defaultValue ?? getDefaultValueForType(filter.type);
        });
      } else {
        // NOTE: Standalone filter (not in a section)
        defaults[section.id] = section.defaultValue ?? getDefaultValueForType(section.type);
      }
    });
    return defaults;
  }, [config]);

  const [filters, setFilters] = useState(getDefaultValues);
  const [errors, setErrors] = useState({});
  const [disabledFilters, setDisabledFilters] = useState(new Set());
  const [visibleFilters, setVisibleFilters] = useState(new Set());

  function getDefaultValueForType(type) {
    switch (type) {
      case 'checkbox':
      case 'multiselect':
        return [];
      case 'number':
      case 'slider':
        return 0;
      case 'dateRange':
        return { start: null, end: null };
      default:
        return null;
    }
  }

  const findFilterConfig = useCallback(
    (filterId) => {
      const sections = Array.isArray(config) ? config : config?.sections || [];

      for (const section of sections) {
        if (section.type === 'section') {
          const filter = section.filters?.find((f) => f.id === filterId);
          if (filter) {
            return filter;
          }
        } else if (section.id === filterId) {
          return section;
        }
      }
      return null;
    },
    [config]
  );

  const validateFilter = useCallback((filterConfig, value, allFilters) => {
    if (!filterConfig.validation) {
      return null;
    }

    const validation = filterConfig.validation;

    if (validation.required) {
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return validation.message || `${filterConfig.label} is required`;
      }
    }

    if (validation.min !== undefined) {
      if (Array.isArray(value) && value.length < validation.min) {
        return validation.message || `Select at least ${validation.min} option(s)`;
      }
      if (typeof value === 'number' && value < validation.min) {
        return validation.message || `Value must be at least ${validation.min}`;
      }
    }

    if (validation.max !== undefined) {
      if (Array.isArray(value) && value.length > validation.max) {
        return validation.message || `Select at most ${validation.max} option(s)`;
      }
      if (typeof value === 'number' && value > validation.max) {
        return validation.message || `Value must be at most ${validation.max}`;
      }
    }

    if (validation.custom && typeof validation.custom === 'function') {
      const isValid = validation.custom(value, allFilters);
      if (!isValid) {
        return validation.message || 'Invalid value';
      }
    }

    return null;
  }, []);

  const validateAllFilters = useCallback(
    (filtersToValidate) => {
      const validationErrors = {};
      const sections = Array.isArray(config) ? config : config?.sections || [];

      sections.forEach((section) => {
        if (section.type === 'section') {
          section.filters?.forEach((filter) => {
            const error = validateFilter(filter, filtersToValidate[filter.id], filtersToValidate);
            if (error) {
              validationErrors[filter.id] = error;
            }
          });
        } else {
          const error = validateFilter(section, filtersToValidate[section.id], filtersToValidate);
          if (error) {
            validationErrors[section.id] = error;
          }
        }
      });

      return validationErrors;
    },
    [config, validateFilter]
  );

  const updateConditionalStates = useCallback(
    (filtersToCheck) => {
      const newDisabled = new Set();
      const newVisible = new Set();
      const sections = Array.isArray(config) ? config : config?.sections || [];

      sections.forEach((section) => {
        const filtersToProcess = section.type === 'section' ? section.filters : [section];

        filtersToProcess?.forEach((filter) => {
          if (typeof filter.disabled === 'function') {
            if (filter.disabled(filtersToCheck)) {
              newDisabled.add(filter.id);
            }
          }

          if (typeof filter.visible === 'function') {
            if (!filter.visible(filtersToCheck)) {
              newVisible.add(filter.id);
            }
          } else {
            newVisible.add(filter.id);
          }
        });
      });

      setDisabledFilters(newDisabled);
      setVisibleFilters(newVisible);
    },
    [config]
  );

  const updateFilter = useCallback(
    (filterId, value) => {
      const filterConfig = findFilterConfig(filterId);
      if (!filterConfig) {
        return;
      }

      // NOTE: Transform value if transform function exists
      const transformedValue = filterConfig.transform ? filterConfig.transform(value) : value;

      const newFilters = { ...filters, [filterId]: transformedValue };

      // NOTE: Run onChange callback if exists
      if (filterConfig.onChange && typeof filterConfig.onChange === 'function') {
        filterConfig.onChange(transformedValue, newFilters, setFilters);
      }

      updateConditionalStates(newFilters);

      const validationErrors = validateAllFilters(newFilters);
      setErrors(validationErrors);

      setFilters(newFilters);

      // NOTE: Notify parent
      config?.onFiltersChange?.(newFilters, validationErrors);

      // NOTE: Notify parent only if valid
      if (Object.keys(validationErrors).length === 0) {
        config?.onValidFiltersChange?.(newFilters);
      }
    },
    [filters, findFilterConfig, updateConditionalStates, validateAllFilters, config]
  );

  const resetFilters = useCallback(() => {
    const defaults = getDefaultValues();
    setFilters(defaults);
    setErrors({});
    updateConditionalStates(defaults);
    config?.onFiltersChange?.(defaults, {});
    config?.onValidFiltersChange?.(defaults);
    return defaults;
  }, [getDefaultValues, updateConditionalStates, config]);

  useEffect(() => {
    updateConditionalStates(filters);
  }, []);

  const isFilterDisabled = useCallback(
    (filterId) => {
      return disabledFilters.has(filterId);
    },
    [disabledFilters]
  );

  const isFilterVisible = useCallback(
    (filterId) => {
      return visibleFilters.has(filterId);
    },
    [visibleFilters]
  );

  const getFilterError = useCallback(
    (filterId) => {
      return errors[filterId] || null;
    },
    [errors]
  );

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  return {
    filters,
    errors,
    updateFilter,
    resetFilters,
    isFilterDisabled,
    isFilterVisible,
    getFilterError,
    isValid,
  };
};

export default useCustomFilters;
