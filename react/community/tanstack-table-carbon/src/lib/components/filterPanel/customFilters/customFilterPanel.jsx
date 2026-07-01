import React, { useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import useCustomFilters from '../../../hooks/useCustomFilters';
import styles from '../../scss/customFilterPanel.module.scss';
import FilterSection from './filterSection';
import renderCustomFilter from './renderCustomFilter';

/**
 * Main custom filter panel component
 * Supports both configuration-based and render props approaches
 */
const CustomFilterPanel = ({
  filterConfig,
  searchTerm = '',
  size = 'md',
  onValidationChange,
  onStateChange,
}) => {
  const {
    filters: filterValues,
    updateFilter,
    resetFilters,
    isFilterDisabled,
    isFilterVisible,
    getFilterError,
    isValid,
  } = useCustomFilters(filterConfig);

  // NOTE: Notify parent of validation state changes
  React.useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  React.useEffect(() => {
    onStateChange?.({
      filterValues,
      resetFilters,
    });
  }, [filterValues, resetFilters, onStateChange]);

  // NOTE: Helper function to check if a filter matches the search term
  const matchesFilter = useMemo(() => {
    return (filter, term) => {
      // NOTE: Check if filter label matches
      if (filter.label.toLowerCase().includes(term)) {
        return true;
      }

      // NOTE: Search through options for select-based filter types
      const searchableFilterTypes = ['checkbox', 'dropdown', 'radio', 'multiselect'];
      if (searchableFilterTypes.includes(filter.type) && filter.options) {
        return filter.options.some((option) => {
          const optionLabel = typeof option === 'object' ? option.label : option;
          const optionValue = typeof option === 'object' ? option.value : option;
          return (
            String(optionLabel).toLowerCase().includes(term) ||
            String(optionValue).toLowerCase().includes(term)
          );
        });
      }

      return false;
    };
  }, []);

  // NOTE: Filter the filters based on search term (searches section titles, labels, and options)
  const filteredConfig = useMemo(() => {
    if (!searchTerm) {
      return filterConfig;
    }

    const term = searchTerm.toLowerCase();

    return filterConfig
      .map((item) => {
        if (item.type === 'section') {
          // NOTE: Check if section label/title matches
          const sectionMatches = item.label && item.label.toLowerCase().includes(term);

          if (sectionMatches) {
            // NOTE: If section title matches, include all filters and mark it
            return { ...item, _sectionTitleMatched: true };
          }

          // NOTE: Filter section's filters
          const filteredFilters = item.filters.filter((filter) => matchesFilter(filter, term));
          if (filteredFilters.length > 0) {
            return { ...item, _sectionTitleMatched: false };
          }
          return null;
        }
        return matchesFilter(item, term) ? item : null;
      })
      .filter(Boolean);
  }, [filterConfig, searchTerm, matchesFilter]);

  const renderFilter = (filter, filterSearchTerm = searchTerm) => {
    // NOTE: Check if filter should be visible
    if (!isFilterVisible(filter.id)) {
      return null;
    }

    const value = filterValues[filter.id];
    const disabled = isFilterDisabled(filter.id);
    const error = getFilterError(filter.id);

    // NOTE: Handle filter value changes using canonical custom filter state
    const onChange = (newValue) => {
      updateFilter(filter.id, newValue);
    };

    // NOTE: Handle custom render prop
    if (filter.type === 'custom' && filter.render) {
      return (
        <div key={filter.id} className={styles.filterItem}>
          {filter.render({ value, onChange, disabled, error })}
        </div>
      );
    }

    const renderedFilter = renderCustomFilter({
      filter,
      value,
      onChange,
      disabled,
      error,
      size,
      searchTerm: filterSearchTerm,
    });

    if (!renderedFilter) {
      return null;
    }

    return (
      <div key={filter.id} className={styles.filterItem}>
        {renderedFilter}
      </div>
    );
  };

  const renderContent = () => {
    return filteredConfig.map((item) => {
      if (item.type === 'section') {
        /*
          NOTE:  Render section with accordion
          If section title matched, show all filters; otherwise filter them
        */
        const sectionFilters = item._sectionTitleMatched
          ? item.filters
          : searchTerm
            ? item.filters.filter((filter) => matchesFilter(filter, searchTerm.toLowerCase()))
            : item.filters;

        if (sectionFilters.length === 0) {
          return null;
        }

        // NOTE: If section title matched, don't pass searchTerm to filters (show all options)
        const filterSearchTerm = item._sectionTitleMatched ? '' : searchTerm;

        return (
          <div key={item.id} className={styles.customFilterSection}>
            <FilterSection section={item} defaultOpen={item.defaultOpen}>
              {sectionFilters.map((filter) => renderFilter(filter, filterSearchTerm))}
            </FilterSection>
          </div>
        );
      }

      // NOTE: Render standalone filter
      return (
        <div key={item.id} className={styles.customFilterSection}>
          <div className={styles.customWithoutAcc}>{renderFilter(item, searchTerm)}</div>
        </div>
      );
    });
  };

  return (
    <div className={styles.customFilterPanel}>
      <div className={styles.filtersContainer}>{renderContent()}</div>
    </div>
  );
};

CustomFilterPanel.propTypes = {
  size: PropTypes.string,
  onValidationChange: PropTypes.func,
  filterConfig: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf([
        'text',
        'checkbox',
        'dropdown',
        'radio',
        'number',
        'date',
        'dateRange',
        'slider',
        'custom',
        'section',
      ]).isRequired,
      label: PropTypes.string.isRequired,
      defaultValue: PropTypes.any,
      validation: PropTypes.shape({
        required: PropTypes.bool,
        min: PropTypes.number,
        max: PropTypes.number,
        custom: PropTypes.func,
      }),
      enableWhen: PropTypes.func,
      disableWhen: PropTypes.func,
      onChange: PropTypes.func,
      render: PropTypes.func,
      filters: PropTypes.array,
      defaultOpen: PropTypes.bool,
    })
  ).isRequired,
  onApply: PropTypes.func,
  onReset: PropTypes.func,
  onStateChange: PropTypes.func,
  enableSearch: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
};

export default memo(CustomFilterPanel);
