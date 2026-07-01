import React from 'react';
import PropTypes from 'prop-types';
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
} from '../fields';

const filterOptionsBySearch = (filter, searchTerm = '') => {
  if (!searchTerm) {
    return filter.options || [];
  }

  const term = searchTerm.toLowerCase();

  if (filter.label.toLowerCase().includes(term)) {
    return filter.options || [];
  }

  return (filter.options || []).filter((option) => {
    const optionValue =
      typeof option === 'object' ? (option.value ?? option.id ?? option.text) : option;
    const optionLabel =
      typeof option === 'object'
        ? (option.label ?? option.text ?? option.id ?? option.value)
        : option;

    return (
      String(optionLabel).toLowerCase().includes(term) ||
      String(optionValue).toLowerCase().includes(term)
    );
  });
};

const renderCustomFilter = ({
  filter,
  value,
  onChange,
  disabled,
  error,
  size = 'md',
  searchTerm = '',
}) => {
  switch (filter.type) {
    case 'text':
      return (
        <TextFilterField
          id={`filter-${filter.id}`}
          label={filter.label}
          placeholder={filter.placeholder || ''}
          value={value ?? filter.defaultValue ?? ''}
          onChange={onChange}
          disabled={disabled}
          error={error}
          size={size}
          stopPropagation
        />
      );

    case 'checkbox': {
      const selectedValues = value || filter.defaultValue || [];
      const filteredOptions = filterOptionsBySearch(filter, searchTerm);

      return (
        <CheckboxGroupFilterField
          legend={filter.label}
          items={filteredOptions.map((option) => {
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            const optionCount = typeof option === 'object' ? option.count : undefined;

            return {
              id: `${filter.id}-${optionValue}`,
              label: optionLabel,
              value: optionValue,
              count: optionCount,
            };
          })}
          selectedValues={selectedValues}
          onChange={(optionValue, checked) => {
            const newValue = checked
              ? [...selectedValues, optionValue]
              : selectedValues.filter((item) => item !== optionValue);
            onChange(newValue);
          }}
          disabled={disabled}
          error={error}
          stopPropagation
        />
      );
    }

    case 'dropdown': {
      const filteredOptions = filterOptionsBySearch(filter, searchTerm);
      const items = filteredOptions.map((option) => {
        if (typeof option === 'object') {
          const count = option.count;
          const label =
            count !== undefined && count !== null ? `${option.label} (${count})` : option.label;
          return { ...option, label };
        }
        return { label: option, value: option };
      });

      const selectedItem =
        items.find((item) => item.value === (value ?? filter.defaultValue ?? null)) || null;

      return (
        <DropdownFilterField
          id={`filter-${filter.id}`}
          titleText={filter.label}
          label={filter.placeholder || 'Choose an option'}
          items={items}
          itemToString={(item) => (item ? item.label : '')}
          selectedItem={selectedItem}
          onChange={(selected) => {
            onChange(selected?.value || null);
          }}
          disabled={disabled}
          error={error}
          size={size}
          stopPropagation
        />
      );
    }

    case 'radio': {
      const filteredOptions = filterOptionsBySearch(filter, searchTerm);

      return (
        <RadioGroupFilterField
          legend={filter.label}
          name={`filter-${filter.id}`}
          selectedValue={value || filter.defaultValue || ''}
          onChange={onChange}
          disabled={disabled}
          error={error}
          stopPropagation
          items={filteredOptions.map((option) => {
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            const optionCount = typeof option === 'object' ? option.count : undefined;

            return {
              id: `${filter.id}-${optionValue}`,
              value: optionValue,
              label: (
                <>
                  {optionLabel}{' '}
                  {optionCount ? (
                    <span className="count_filterSidePanel">({optionCount})</span>
                  ) : null}
                </>
              ),
            };
          })}
        />
      );
    }

    case 'number':
      return (
        <NumberFilterField
          id={`filter-${filter.id}`}
          label={filter.label}
          value={value ?? filter.defaultValue ?? ''}
          onChange={onChange}
          disabled={disabled}
          error={error}
          min={filter.min}
          max={filter.max}
          step={filter.step || 1}
          hideSteppers={filter.hideSteppers}
          size={size}
          stopPropagation
        />
      );

    case 'date':
      return (
        <DateFilterField
          id={`filter-${filter.id}`}
          label={filter.label}
          value={value ?? filter.defaultValue ?? null}
          onChange={onChange}
          disabled={disabled}
          error={error}
          size={size}
          stopPropagation
        />
      );

    case 'dateRange':
      return (
        <DateRangeFilterField
          startId={`${filter.id}-start`}
          endId={`${filter.id}-end`}
          startLabel={`${filter.label} - Start`}
          endLabel={`${filter.label} - End`}
          value={value || filter.defaultValue || { start: null, end: null }}
          onChange={onChange}
          disabled={disabled}
          error={error}
          size={size}
          stopPropagation
        />
      );

    case 'slider': {
      const min = filter.min ?? 0;
      const currentValue = value ?? filter.defaultValue ?? min;

      return (
        <SliderFilterField
          id={`filter-${filter.id}`}
          label={filter.label}
          value={currentValue}
          min={min}
          max={filter.max ?? 100}
          step={filter.step ?? 1}
          onChange={({ value: nextValue }) => onChange(nextValue)}
          onRelease={({ value: nextValue }) => onChange(nextValue)}
          disabled={disabled}
          error={error}
          hideTextInput={filter.hideTextInput}
          stopPropagation
        />
      );
    }

    case 'multiselect': {
      const filteredOptions = filterOptionsBySearch(filter, searchTerm);
      const items = filteredOptions.map((option) => {
        if (typeof option === 'object') {
          const id = option.id || option.value;
          const text = option.text || option.label || option.id || option.value;
          const count = option.count;
          const textWithCount = count !== undefined && count !== null ? `${text} (${count})` : text;

          return {
            id,
            text: textWithCount,
          };
        }
        return { id: option, text: option };
      });

      const selectedItems = items.filter((item) =>
        (value ?? filter.defaultValue ?? []).includes(item.id)
      );

      return (
        <MultiSelectFilterField
          id={`filter-${filter.id}`}
          titleText={filter.label}
          label={filter.placeholder || 'Choose options'}
          items={items}
          itemToString={(item) => (item ? item.text : '')}
          selectedItems={selectedItems}
          onChange={(selectedItemsValue) => {
            onChange(selectedItemsValue.map((item) => item.id));
          }}
          disabled={disabled}
          error={error}
          size={size}
          stopPropagation
        />
      );
    }

    case 'time':
      return (
        <TimeFilterField
          id={`filter-${filter.id}`}
          label={filter.label}
          value={value ?? filter.defaultValue ?? ''}
          onChange={onChange}
          disabled={disabled}
          error={error}
          size={size}
          stopPropagation
        />
      );

    default:
      // eslint-disable-next-line no-console
      console.warn(`Unknown filter type: ${filter.type}`, filter);
      return null;
  }
};

renderCustomFilter.propTypes = {
  filter: PropTypes.object.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  size: PropTypes.string,
  searchTerm: PropTypes.string,
};

export default renderCustomFilter;
