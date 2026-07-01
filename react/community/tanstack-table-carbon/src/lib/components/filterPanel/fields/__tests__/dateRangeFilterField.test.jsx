import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DateRangeFilterField from '../dateRangeFilterField';

const mockDatePicker = vi.fn(({ children, onChange, value, disabled, datePickerType }) => (
  <div
    data-testid="mock-date-picker"
    data-value={JSON.stringify(value)}
    data-disabled={String(Boolean(disabled))}
    data-picker-type={datePickerType}
  >
    <button type="button" onClick={() => onChange(['2026-05-01', '2026-05-31'])}>
      Trigger Full Range
    </button>
    <button type="button" onClick={() => onChange(['2026-05-01'])}>
      Trigger Partial Range
    </button>
    {children}
  </div>
));

const mockDatePickerInput = vi.fn(({ id, placeholder, labelText, size, invalid, invalidText }) => (
  <div
    data-testid={`mock-date-picker-input-${id}`}
    data-id={id}
    data-placeholder={placeholder}
    data-label={labelText}
    data-size={size}
    data-invalid={String(Boolean(invalid))}
    data-invalid-text={invalidText || ''}
  >
    {labelText}
  </div>
));

const mockLayer = vi.fn(({ children, level }) => (
  <div data-testid="mock-layer" data-level={String(level)}>
    {children}
  </div>
));

vi.mock('@carbon/react', () => ({
  DatePicker: (props) => mockDatePicker(props),
  DatePickerInput: (props) => mockDatePickerInput(props),
  Layer: (props) => mockLayer(props),
}));

describe('DateRangeFilterField', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default end label, placeholder, size, and current range values', () => {
    render(
      <DateRangeFilterField
        startId="created-start"
        endId="created-end"
        startLabel="Start date"
        value={{ start: '2026-01-01', end: '2026-01-31' }}
        onChange={onChange}
      />
    );

    expect(screen.getByTestId('mock-layer')).toHaveAttribute('data-level', '1');
    expect(screen.getByTestId('mock-date-picker')).toHaveAttribute('data-picker-type', 'range');
    expect(screen.getByTestId('mock-date-picker')).toHaveAttribute(
      'data-value',
      JSON.stringify(['2026-01-01', '2026-01-31'])
    );
    expect(screen.getByTestId('mock-date-picker')).toHaveAttribute('data-disabled', 'false');
    expect(screen.getByTestId('mock-date-picker-input-created-start')).toHaveAttribute(
      'data-label',
      'Start date'
    );
    expect(screen.getByTestId('mock-date-picker-input-created-end')).toHaveAttribute(
      'data-label',
      'End date'
    );
    expect(screen.getByTestId('mock-date-picker-input-created-start')).toHaveAttribute(
      'data-placeholder',
      'mm/dd/yyyy'
    );
    expect(screen.getByTestId('mock-date-picker-input-created-start')).toHaveAttribute(
      'data-size',
      'md'
    );
  });

  it('renders with custom end label, placeholder, size, disabled, and error state', () => {
    render(
      <DateRangeFilterField
        startId="updated-start"
        endId="updated-end"
        startLabel="Updated from"
        endLabel="Updated to"
        value={{ start: null, end: null }}
        onChange={onChange}
        disabled
        error="Invalid range"
        size="sm"
        placeholder="Select range"
      />
    );

    expect(screen.getByTestId('mock-date-picker')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('mock-date-picker-input-updated-start')).toHaveAttribute(
      'data-label',
      'Updated from'
    );
    expect(screen.getByTestId('mock-date-picker-input-updated-end')).toHaveAttribute(
      'data-label',
      'Updated to'
    );
    expect(screen.getByTestId('mock-date-picker-input-updated-start')).toHaveAttribute(
      'data-placeholder',
      'Select range'
    );
    expect(screen.getByTestId('mock-date-picker-input-updated-start')).toHaveAttribute(
      'data-size',
      'sm'
    );
    expect(screen.getByTestId('mock-date-picker-input-updated-start')).toHaveAttribute(
      'data-invalid',
      'true'
    );
    expect(screen.getByTestId('mock-date-picker-input-updated-end')).toHaveAttribute(
      'data-invalid-text',
      'Invalid range'
    );
  });

  it('maps full date range to start/end object and partial range to undefined', () => {
    render(
      <DateRangeFilterField
        startId="created-start"
        endId="created-end"
        startLabel="Start date"
        endLabel="End date"
        value={{ start: null, end: null }}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Full Range' }));
    fireEvent.click(screen.getByRole('button', { name: 'Trigger Partial Range' }));

    expect(onChange).toHaveBeenNthCalledWith(1, {
      start: '2026-05-01',
      end: '2026-05-31',
    });
    expect(onChange).toHaveBeenNthCalledWith(2, undefined);
  });

  it('stops click propagation when stopPropagation is enabled', () => {
    const outerClickHandler = vi.fn();

    render(
      <div onClick={outerClickHandler}>
        <DateRangeFilterField
          startId="created-start"
          endId="created-end"
          startLabel="Start date"
          endLabel="End date"
          value={{ start: null, end: null }}
          onChange={onChange}
          stopPropagation
        />
      </div>
    );

    fireEvent.click(screen.getByTestId('mock-layer'));

    expect(outerClickHandler).not.toHaveBeenCalled();
  });
});
