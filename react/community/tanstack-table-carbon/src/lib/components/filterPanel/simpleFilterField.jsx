import React from 'react';
import PropTypes from 'prop-types';
import { Layer } from '@carbon/react';
import styles from '../scss/filterSidePanel.module.scss';
import {
  CheckboxGroupFilterField,
  DateFilterField,
  DateRangeFilterField,
  DropdownFilterField,
  MultiSelectFilterField,
  NumberFilterField,
  RadioGroupFilterField,
  SliderFilterField,
  TextFilterField,
  TimeFilterField,
} from './fields';

const getFilterLabel = (columnHeader, columnId, labels) =>
  typeof columnHeader === 'string'
    ? columnHeader
    : labels.filterFieldFallbackLabel.replace('{columnId}', columnId);

const getNoResultsMessage = (searchTerm, matchedByLabel, labels) =>
  searchTerm && !matchedByLabel
    ? labels.filterFieldNoMatchText.replace('{searchTerm}', searchTerm)
    : labels.filterFieldNoOptionsText;

const getFilterPlaceholder = (filterLabel, labels) =>
  labels.filterFieldPlaceholder.replace('{filterLabel}', filterLabel);

const clearFilterError = (setFilterErrors, columnId) => {
  setFilterErrors((prev) => {
    const newErrors = { ...prev };
    delete newErrors[columnId];
    return newErrors;
  });
};

const SimpleFilterField = ({
  columnData,
  size = 'md',
  searchTerm = '',
  localFilters = [],
  filterErrors = {},
  setFilterErrors,
  sliderValuesRef,
  getFilterValue,
  updateLocalFilter,
  handleCheckboxChange,
  labels,
}) => {
  const { column, matchedByLabel } = columnData;
  const { filterVariant } = column.columnDef.meta ?? {};
  const columnId = column.id;
  const columnHeader = column.columnDef.header;
  const filterLabel = getFilterLabel(columnHeader, columnId, labels);
  const filterPlaceholder = getFilterPlaceholder(filterLabel, labels);
  const facetedUniqueValues = column.getFacetedUniqueValues();

  const allUniqueValues = Array.from(facetedUniqueValues.keys()).sort().slice(0, 5000);

  const sortedUniqueValues =
    searchTerm && !matchedByLabel
      ? allUniqueValues.filter((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allUniqueValues;

  const getValueCount = (value) => facetedUniqueValues.get(value) || 0;
  const currentFilterValue = getFilterValue(columnId);
  const selectedCheckboxValues = localFilters.find((item) => item.id === columnId)?.value || [];
  const noResultsMessage = getNoResultsMessage(searchTerm, matchedByLabel, labels);

  switch (filterVariant) {
    case 'select':
      return (
        <div key={columnId} className={styles.filterItem}>
          <DropdownFilterField
            id={`filter-${columnId}`}
            titleText={filterLabel}
            label={labels.filterDropdownLabel}
            items={sortedUniqueValues}
            selectedItem={currentFilterValue ?? null}
            size={size}
            onChange={(selectedItem) => {
              updateLocalFilter(columnId, selectedItem);
            }}
          />
          {searchTerm && !matchedByLabel && sortedUniqueValues.length === 0 && (
            <p className={styles.noResults}>{noResultsMessage}</p>
          )}
        </div>
      );

    case 'checkbox':
      return (
        <div key={columnId} className={styles.filterItem}>
          <CheckboxGroupFilterField
            legend={filterLabel}
            items={sortedUniqueValues.map((value) => ({
              id: `${columnId}-${value}`,
              label: value,
              value,
              count: getValueCount(value),
            }))}
            selectedValues={selectedCheckboxValues}
            onChange={(value, checked) => {
              handleCheckboxChange(columnId, value, checked);
            }}
            emptyMessage={noResultsMessage}
          />
        </div>
      );

    case 'number': {
      const currentValue = currentFilterValue || '';
      const hasError = filterErrors[columnId];

      return (
        <div key={columnId} className={styles.filterItem}>
          <NumberFilterField
            id={`filter-${columnId}`}
            value={currentValue}
            hideSteppers
            size={size}
            label={filterLabel}
            error={hasError || ''}
            allowEmpty
            onChange={(value) => {
              if (value === '' || value === undefined) {
                clearFilterError(setFilterErrors, columnId);
                updateLocalFilter(columnId, value);
              } else if (isNaN(Number(value))) {
                setFilterErrors((prev) => ({
                  ...prev,
                  [columnId]: labels.filterNumberInvalidError,
                }));
                updateLocalFilter(columnId, value);
              } else {
                clearFilterError(setFilterErrors, columnId);
                updateLocalFilter(columnId, value);
              }
            }}
          />
        </div>
      );
    }

    case 'radio':
      return (
        <div key={columnId} className={styles.filterItem}>
          <RadioGroupFilterField
            legend={filterLabel}
            name={`radio-${columnId}`}
            selectedValue={currentFilterValue || ''}
            onChange={(value) => {
              updateLocalFilter(columnId, value);
            }}
            items={sortedUniqueValues.map((value) => ({
              id: `${columnId}-${value}`,
              value,
              label: (
                <>
                  <span>{value}</span>
                  {getValueCount(value) ? (
                    <span className="count_filterSidePanel">({getValueCount(value)})</span>
                  ) : null}
                </>
              ),
            }))}
            emptyMessage={noResultsMessage}
          />
        </div>
      );

    case 'multiselect':
      return (
        <div key={columnId} className={styles.filterItem}>
          <MultiSelectFilterField
            id={`filter-${columnId}`}
            titleText={filterLabel}
            label={labels.filterMultiSelectLabel}
            size={size}
            items={sortedUniqueValues.map((value) => ({
              id: value,
              text: `${value} (${getValueCount(value)})`,
            }))}
            selectedItems={(currentFilterValue || []).map((val) => ({
              id: val,
              text: `${val} (${getValueCount(val)})`,
            }))}
            onChange={(selectedItems) => {
              const values = selectedItems.map((item) => item.id);
              updateLocalFilter(columnId, values.length > 0 ? values : undefined);
            }}
          />
          {searchTerm && !matchedByLabel && sortedUniqueValues.length === 0 && (
            <p className={styles.noResults}>{noResultsMessage}</p>
          )}
        </div>
      );

    case 'slider': {
      const numericValues = allUniqueValues
        .map((value) => Number(value))
        .filter((value) => !isNaN(value) && isFinite(value));

      const minValue = numericValues.length > 0 ? Math.min(...numericValues) : 0;
      const maxValue = numericValues.length > 0 ? Math.max(...numericValues) : 100;
      const currentValue = currentFilterValue || { min: minValue, max: maxValue };

      if (numericValues.length === 0) {
        return (
          <div key={columnId} className={styles.filterItem}>
            <Layer level={1}>
              <p className={styles.filterCheckboxGroupLabel}>{filterLabel}</p>
              <p className={styles.noResults}>{labels.filterSliderNoValuesText}</p>
            </Layer>
          </div>
        );
      }

      if (sliderValuesRef.current[columnId] === undefined) {
        sliderValuesRef.current[columnId] = currentValue.max || maxValue;
      }

      return (
        <div key={columnId} className={styles.filterItem}>
          <SliderFilterField
            id={`filter-${columnId}`}
            label={filterLabel}
            min={minValue}
            max={maxValue}
            value={sliderValuesRef.current[columnId]}
            step={Math.ceil((maxValue - minValue) / 100) || 1}
            onChange={({ value }) => {
              sliderValuesRef.current[columnId] = value;
            }}
            onRelease={({ value }) => {
              updateLocalFilter(columnId, { min: minValue, max: value });
            }}
          />
        </div>
      );
    }

    case 'date':
      return (
        <div key={columnId} className={styles.filterItem}>
          <DateFilterField
            id={`filter-${columnId}`}
            value={currentFilterValue || ''}
            onChange={(value) => {
              updateLocalFilter(columnId, value || undefined);
            }}
            label={filterLabel}
            size={size}
          />
        </div>
      );

    case 'dateRange': {
      const dateRangeValue = currentFilterValue || {};

      return (
        <div key={columnId} className={styles.filterItem}>
          <DateRangeFilterField
            startId={`filter-${columnId}-start`}
            endId={`filter-${columnId}-end`}
            startLabel={`${filterLabel} (Start)`}
            endLabel={labels.filterDateRangeEndLabel}
            value={dateRangeValue}
            onChange={(value) => {
              updateLocalFilter(columnId, value);
            }}
            size={size}
          />
        </div>
      );
    }

    case 'time':
      return (
        <div key={columnId} className={styles.filterItem}>
          <TimeFilterField
            id={`filter-${columnId}`}
            label={filterLabel}
            value={currentFilterValue || ''}
            size={size}
            onChange={(value) => {
              updateLocalFilter(columnId, value);
            }}
          />
        </div>
      );

    default:
      return (
        <div key={columnId} className={styles.filterItem}>
          <TextFilterField
            id={`filter-${columnId}`}
            onChange={(value) => {
              updateLocalFilter(columnId, value);
            }}
            placeholder={filterPlaceholder}
            size={size}
            value={currentFilterValue || ''}
            label={filterLabel}
          />
        </div>
      );
  }
};

SimpleFilterField.propTypes = {
  columnData: PropTypes.shape({
    column: PropTypes.object.isRequired,
    matchedByLabel: PropTypes.bool,
  }).isRequired,
  size: PropTypes.string,
  searchTerm: PropTypes.string,
  localFilters: PropTypes.array,
  filterErrors: PropTypes.object,
  setFilterErrors: PropTypes.func.isRequired,
  sliderValuesRef: PropTypes.shape({
    current: PropTypes.object,
  }).isRequired,
  getFilterValue: PropTypes.func.isRequired,
  updateLocalFilter: PropTypes.func.isRequired,
  handleCheckboxChange: PropTypes.func.isRequired,
  labels: PropTypes.object.isRequired,
};

export default React.memo(SimpleFilterField);
