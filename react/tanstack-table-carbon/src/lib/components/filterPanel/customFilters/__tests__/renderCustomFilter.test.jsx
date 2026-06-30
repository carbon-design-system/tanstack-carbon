import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import renderCustomFilter from '../renderCustomFilter';

const fieldMocks = {
  TextFilterField: vi.fn(() => <div data-testid="text-field" />),
  CheckboxGroupFilterField: vi.fn(() => <div data-testid="checkbox-field" />),
  DateFilterField: vi.fn(() => <div data-testid="date-field" />),
  DateRangeFilterField: vi.fn(() => <div data-testid="date-range-field" />),
  DropdownFilterField: vi.fn(() => <div data-testid="dropdown-field" />),
  MultiSelectFilterField: vi.fn(() => <div data-testid="multiselect-field" />),
  NumberFilterField: vi.fn(() => <div data-testid="number-field" />),
  RadioGroupFilterField: vi.fn(() => <div data-testid="radio-field" />),
  SliderFilterField: vi.fn(() => <div data-testid="slider-field" />),
  TextFilterField2: vi.fn(),
  TimeFilterField: vi.fn(() => <div data-testid="time-field" />),
};

vi.mock('../../fields', () => ({
  CheckboxGroupFilterField: (props) => fieldMocks.CheckboxGroupFilterField(props),
  DateFilterField: (props) => fieldMocks.DateFilterField(props),
  DateRangeFilterField: (props) => fieldMocks.DateRangeFilterField(props),
  DropdownFilterField: (props) => fieldMocks.DropdownFilterField(props),
  MultiSelectFilterField: (props) => fieldMocks.MultiSelectFilterField(props),
  NumberFilterField: (props) => fieldMocks.NumberFilterField(props),
  RadioGroupFilterField: (props) => fieldMocks.RadioGroupFilterField(props),
  SliderFilterField: (props) => fieldMocks.SliderFilterField(props),
  TextFilterField: (props) => fieldMocks.TextFilterField(props),
  TimeFilterField: (props) => fieldMocks.TimeFilterField(props),
}));

describe('renderCustomFilter', () => {
  const onChange = vi.fn();
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders text filter with defaults', () => {
    render(
      renderCustomFilter({
        filter: { id: 'owner', type: 'text', label: 'Owner', placeholder: 'Type owner' },
        value: undefined,
        onChange,
        disabled: true,
        error: 'Required',
        size: 'sm',
      })
    );

    expect(fieldMocks.TextFilterField).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'filter-owner',
        label: 'Owner',
        placeholder: 'Type owner',
        value: '',
        disabled: true,
        error: 'Required',
        size: 'sm',
        stopPropagation: true,
      })
    );
    expect(screen.getByTestId('text-field')).toBeInTheDocument();
  });

  it('renders checkbox filter and updates selected values', () => {
    render(
      renderCustomFilter({
        filter: {
          id: 'priority',
          type: 'checkbox',
          label: 'Priority',
          options: [{ label: 'High', value: 'high', count: 2 }, 'low'],
          defaultValue: ['low'],
        },
        value: ['high'],
        onChange,
        disabled: false,
        error: '',
        searchTerm: '',
      })
    );

    const checkboxProps = fieldMocks.CheckboxGroupFilterField.mock.calls[0][0];
    expect(checkboxProps.items).toEqual([
      { id: 'priority-high', label: 'High', value: 'high', count: 2 },
      { id: 'priority-low', label: 'low', value: 'low', count: undefined },
    ]);
    expect(checkboxProps.selectedValues).toEqual(['high']);

    checkboxProps.onChange('low', true);
    checkboxProps.onChange('high', false);

    expect(onChange).toHaveBeenNthCalledWith(1, ['high', 'low']);
    expect(onChange).toHaveBeenNthCalledWith(2, []);
  });

  it('filters dropdown options by search term and maps selected item', () => {
    render(
      renderCustomFilter({
        filter: {
          id: 'status',
          type: 'dropdown',
          label: 'Status',
          options: [
            { label: 'Active', value: 'active', count: 3 },
            { label: 'Inactive', value: 'inactive' },
          ],
          defaultValue: 'inactive',
        },
        value: undefined,
        onChange,
        disabled: false,
        error: '',
        size: 'lg',
        searchTerm: 'active',
      })
    );

    const dropdownProps = fieldMocks.DropdownFilterField.mock.calls[0][0];
    expect(dropdownProps.items).toEqual([
      { label: 'Active (3)', value: 'active', count: 3 },
      { label: 'Inactive', value: 'inactive' },
    ]);
    expect(dropdownProps.selectedItem).toEqual({ label: 'Inactive', value: 'inactive' });

    dropdownProps.onChange({ value: 'active' });
    dropdownProps.onChange(null);

    expect(onChange).toHaveBeenNthCalledWith(1, 'active');
    expect(onChange).toHaveBeenNthCalledWith(2, null);
  });

  it('renders radio filter with counts and selected default value', () => {
    render(
      renderCustomFilter({
        filter: {
          id: 'state',
          type: 'radio',
          label: 'State',
          options: [
            { label: 'Enabled', value: 'enabled', count: 5 },
            { label: 'Disabled', value: 'disabled' },
          ],
          defaultValue: 'disabled',
        },
        value: undefined,
        onChange,
        disabled: false,
        error: '',
        searchTerm: '',
      })
    );

    const radioProps = fieldMocks.RadioGroupFilterField.mock.calls[0][0];
    expect(radioProps.legend).toBe('State');
    expect(radioProps.selectedValue).toBe('disabled');
    expect(radioProps.items).toHaveLength(2);
  });

  it('renders number and date based filters with fallback values', () => {
    render(
      <>
        {renderCustomFilter({
          filter: { id: 'count', type: 'number', label: 'Count', min: 1, max: 9, step: 2 },
          value: undefined,
          onChange,
          disabled: true,
          error: 'Invalid',
          size: 'sm',
        })}
        {renderCustomFilter({
          filter: { id: 'created', type: 'date', label: 'Created On', defaultValue: '2026-01-01' },
          value: undefined,
          onChange,
          disabled: false,
          error: '',
          size: 'md',
        })}
        {renderCustomFilter({
          filter: { id: 'range', type: 'dateRange', label: 'Created Range' },
          value: undefined,
          onChange,
          disabled: false,
          error: '',
          size: 'md',
        })}
      </>
    );

    expect(fieldMocks.NumberFilterField).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'filter-count',
        value: '',
        min: 1,
        max: 9,
        step: 2,
        hideSteppers: undefined,
      })
    );

    expect(fieldMocks.DateFilterField).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'filter-created',
        value: '2026-01-01',
      })
    );

    expect(fieldMocks.DateRangeFilterField).toHaveBeenCalledWith(
      expect.objectContaining({
        startId: 'range-start',
        endId: 'range-end',
        startLabel: 'Created Range - Start',
        endLabel: 'Created Range - End',
        value: { start: null, end: null },
      })
    );
  });

  it('renders slider and invokes both onChange and onRelease handlers', () => {
    render(
      renderCustomFilter({
        filter: {
          id: 'score',
          type: 'slider',
          label: 'Score',
          min: 10,
          max: 20,
          step: 5,
          hideTextInput: true,
        },
        value: undefined,
        onChange,
        disabled: false,
        error: '',
      })
    );

    const sliderProps = fieldMocks.SliderFilterField.mock.calls[0][0];
    expect(sliderProps.value).toBe(10);
    expect(sliderProps.min).toBe(10);
    expect(sliderProps.max).toBe(20);
    expect(sliderProps.step).toBe(5);
    expect(sliderProps.hideTextInput).toBe(true);

    sliderProps.onChange({ value: 15 });
    sliderProps.onRelease({ value: 20 });

    expect(onChange).toHaveBeenNthCalledWith(1, 15);
    expect(onChange).toHaveBeenNthCalledWith(2, 20);
  });

  it('renders multiselect and maps selected items back to ids', () => {
    render(
      renderCustomFilter({
        filter: {
          id: 'tags',
          type: 'multiselect',
          label: 'Tags',
          placeholder: 'Choose tags',
          options: [
            { id: 'ibm', text: 'IBM', count: 2 },
            { value: 'zos', label: 'z/OS', count: 4 },
            'cloud',
          ],
          defaultValue: ['cloud'],
        },
        value: ['ibm', 'zos'],
        onChange,
        disabled: false,
        error: '',
        size: 'sm',
        searchTerm: '',
      })
    );

    const multiselectProps = fieldMocks.MultiSelectFilterField.mock.calls[0][0];
    expect(multiselectProps.items).toEqual([
      { id: 'ibm', text: 'IBM (2)' },
      { id: 'zos', text: 'z/OS (4)' },
      { id: 'cloud', text: 'cloud' },
    ]);
    expect(multiselectProps.selectedItems).toEqual([
      { id: 'ibm', text: 'IBM (2)' },
      { id: 'zos', text: 'z/OS (4)' },
    ]);

    multiselectProps.onChange([{ id: 'cloud' }, { id: 'zos' }]);

    expect(onChange).toHaveBeenCalledWith(['cloud', 'zos']);
  });

  it('renders time filter with default value fallback', () => {
    render(
      renderCustomFilter({
        filter: { id: 'time', type: 'time', label: 'Time', defaultValue: '09:30' },
        value: undefined,
        onChange,
        disabled: true,
        error: 'Bad time',
        size: 'lg',
      })
    );

    expect(fieldMocks.TimeFilterField).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'filter-time',
        label: 'Time',
        value: '09:30',
        disabled: true,
        error: 'Bad time',
        size: 'lg',
        stopPropagation: true,
      })
    );
  });

  it('returns null and warns for unknown filter type', () => {
    const result = renderCustomFilter({
      filter: { id: 'unknown', type: 'unsupported', label: 'Unknown' },
      value: undefined,
      onChange,
      disabled: false,
      error: '',
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      'Unknown filter type: unsupported',
      expect.objectContaining({ id: 'unknown', type: 'unsupported', label: 'Unknown' })
    );
  });
});
