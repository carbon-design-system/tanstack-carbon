import React from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, Close } from '@carbon/icons-react';
import { Layer, Button, Search } from '@carbon/react';
import { STANDARD_SIZE_MAP, BUTTON_SIZE_MAP } from '../constants/constants';
import { useLabels } from '../contexts/labelsContext.jsx';
import { CustomFilterPanel } from './filterPanel/customFilters';
import { useFilterableColumns } from './filterPanel/hooks/useFilterableColumns';
import { useFilterSidePanelController } from './filterPanel/hooks/useFilterSidePanelController';
import SimpleFilterField from './filterPanel/simpleFilterField';
import styles from './scss/filterSidePanel.module.scss';

/**
 * FilterPanel Component
 *
 * A filter panel using IBM Products SidePanel for TanStack Table
 * Supports multiple filter types: text, select, checkbox, number
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls panel open/close state
 * @param {Function} props.onClose - Callback when panel is closed
 * @param {Array} props.columns - Table columns with filter metadata
 * @param {Array} props.columnFilters - Current column filters
 * @param {Function} props.onApplyFilters - Callback to apply filters
 * @param {Function} props.onClearFilters - Callback to clear all filters
 * @param {string} props.size - Size of filter components (inherited from table size)
 * @param {Function} props.onAdvancedFilterClick - Optional callback for advanced filters button
 */
const FilterSidePanel = ({
  open,
  onClose,
  columns = [],
  columnFilters = [],
  onApplyFilters,
  onClearFilters,
  width = 350,
  size = 'md',
  onAdvancedFilterClick,
  customFilterConfig = null,
  onCustomFiltersApply,
  onCustomFiltersReset,
  onSidePanelApply,
  onSidePanelReset,
}) => {
  const labels = useLabels();

  const {
    localFilters,
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
  } = useFilterSidePanelController({
    columnFilters,
    onApplyFilters,
    onClearFilters,
    onCustomFiltersApply,
    onCustomFiltersReset,
    onSidePanelApply,
    onSidePanelReset,
  });

  const { searchedColumns } = useFilterableColumns({
    columns,
    searchTerm,
  });

  // NOTE: If customFilterConfig is provided, use custom filters instead of column-based filters
  const useCustomFilters = customFilterConfig && customFilterConfig.length > 0;

  React.useEffect(() => {
    if (!useCustomFilters) {
      return;
    }

    if (typeof onCustomFiltersApply !== 'function' || typeof onCustomFiltersReset !== 'function') {
      // eslint-disable-next-line no-console
      console.warn(
        'TanstackTable: features.sideFilterPanel.config requires both features.sideFilterPanel.onApply and features.sideFilterPanel.onReset.'
      );
    }
  }, [useCustomFilters, onCustomFiltersApply, onCustomFiltersReset]);

  return (
    <div
      className={`${styles.filterSidePanel} ${open ? styles.open : ''}`}
      style={{ width: `${width}px` }}
      data-filter-panel="true"
    >
      <div className={styles.sidePanelHeader}>
        <div className={styles.headerText}>
          <div className={styles.closePanelBtn}>
            <Button
              size="md"
              renderIcon={Close}
              kind="ghost"
              tooltipPosition="left"
              iconDescription={labels.filterPanelCloseTooltip}
              hasIconOnly
              onClick={onClose}
            />
          </div>

          <span>{labels.filterPanelTitle}</span>
          {typeof onAdvancedFilterClick === 'function' && (
            <Button size="sm" renderIcon={ArrowRight} kind="ghost" onClick={onAdvancedFilterClick}>
              {labels.filterPanelAdvancedButton}
            </Button>
          )}
        </div>

        <div className={styles.searchWrapper}>
          <Layer level={1}>
            <Search
              id="filter-search"
              labelText={labels.filterPanelSearchLabel}
              placeholder={labels.filterPanelSearchPlaceholder}
              size={STANDARD_SIZE_MAP[size]}
              closeButtonLabelText={labels.filterPanelClearSearchTooltip}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
          </Layer>
        </div>
      </div>

      <div className={styles.sidePanelBody}>
        <div className={styles.filterSidePanelContent}>
          {useCustomFilters ? (
            <CustomFilterPanel
              filterConfig={customFilterConfig}
              onApply={handleCustomFilterApply}
              onReset={handleCustomFilterReset}
              searchTerm={searchTerm}
              size={size}
              onValidationChange={handleValidationChange}
              onStateChange={handleCustomFilterStateChange}
            />
          ) : (
            <>
              {searchedColumns.length > 0 ? (
                searchedColumns.map((column) => (
                  <SimpleFilterField
                    key={column.column.id}
                    columnData={column}
                    size={size}
                    searchTerm={searchTerm}
                    localFilters={localFilters}
                    filterErrors={filterErrors}
                    setFilterErrors={setFilterErrors}
                    sliderValuesRef={sliderValuesRef}
                    getFilterValue={getFilterValue}
                    updateLocalFilter={updateLocalFilter}
                    labels={labels}
                    handleCheckboxChange={handleCheckboxChange}
                  />
                ))
              ) : (
                <p className={styles.noFilters}>
                  {searchTerm
                    ? labels.filterPanelNoMatchText.replace('{searchTerm}', searchTerm)
                    : labels.filterPanelNoFiltersText}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className={styles.sidePanelActions}>
        <Button
          kind="secondary"
          onClick={useCustomFilters ? handleCustomClearClick : handleClearAll}
          size={BUTTON_SIZE_MAP[size]}
        >
          {labels.filterPanelClearButton}
        </Button>
        <Button
          kind="primary"
          onClick={useCustomFilters ? handleCustomApplyClick : handleApply}
          size={BUTTON_SIZE_MAP[size]}
          disabled={useCustomFilters ? !isCustomFiltersValid : Object.keys(filterErrors).length > 0}
        >
          {labels.filterPanelApplyButton}
        </Button>
      </div>
    </div>
  );
};

FilterSidePanel.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  originalColumns: PropTypes.array,
  columnFilters: PropTypes.array,
  onApplyFilters: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  width: PropTypes.number,
  size: PropTypes.string,
  onAdvancedFilterClick: PropTypes.func,
  customFilterConfig: PropTypes.array,
  onCustomFiltersApply: PropTypes.func,
  onCustomFiltersReset: PropTypes.func,
  onSidePanelApply: PropTypes.func,
  onSidePanelReset: PropTypes.func,
};

export default React.memo(FilterSidePanel);
