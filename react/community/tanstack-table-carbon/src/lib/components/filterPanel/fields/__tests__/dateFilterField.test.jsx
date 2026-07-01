import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DateFilterField from '../dateFilterField';

const mockDatePicker = vi.fn(({ children, onChange, value, disabled, datePickerType }) => (
  <div
    data-testid="mock-date-picker"
    data-value={value || ''}
    data-disabled={String(Boolean(disabled))}
    data-picker-type={datePickerType}
  >
    <button type="button" onClick={() => onChange(['2026-05-25'])}>
      Trigger Date Change
    </button>
    <button type="button" onClick={() => onChange([])}>
      Trigger Empty Change
    </button>
    {children}
  </div>
));

const mockDatePickerInput = vi.fn(({ id, placeholder, labelText, size, invalid, invalidText }) => (
  <div
    data-testid="mock-date-picker-input"
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

describe('DateFilterField', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props and layer wrapper', () => {
    render(<DateFilterField id="created-on" label="Created On" value={null} onChange={onChange} />);

    expect(screen.getByTestId('mock-layer')).toHaveAttribute('data-level', '1');
    expect(screen.getByTestId('mock-date-picker')).toHaveAttribute('data-picker-type', 'single');
    expect(screen.getByTestId('mock-date-picker')).toHaveAttribute('data-value', '');
    expect(screen.getByTestId('mock-date-picker')).toHaveAttribute('data-disabled', 'false');
    expect(screen.getByTestId('mock-date-picker-input')).toHaveAttribute('data-id', 'created-on');
    expect(screen.getByTestId('mock-date-picker-input')).toHaveAttribute(
      'data-placeholder',
      'mm/dd/yyyy'
    );
    expect(screen.getByTestId('mock-date-picker-input')).toHaveAttribute(
      'data-label',
      'Created On'
    );
    expect(screen.getByTestId('mock-date-picker-input')).toHaveAttribute('data-size', 'md');
    expect(screen.getByTestId('mock-date-picker-input')).toHaveAttribute('data-invalid', 'false');
  });

  it('renders with custom placeholder, size, disabled, value, and error', () => {
    render(
      <DateFilterField
        id="updated-on"
        label="Updated On"
        value="2026-01-10"
        onChange={onChange}
        disabled
        error="Invalid date"
        size="sm"
        placeholder="Select date"
      />
    );

    expect(screen.getByTestId('mock-date-picker')).toHaveAttribute('data-value', '2026-01-10');
    expect(screen.getByTestId('mock-date-picker')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('mock-date-picker-input')).toHaveAttribute(
      'data-placeholder',
      'Select date'
    );
    expect(screen.getByTestId('mock-date-picker-input')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByTestId('mock-date-picker-input')).toHaveAttribute('data-invalid', 'true');
    expect(screen.getByTestId('mock-date-picker-input')).toHaveAttribute(
      'data-invalid-text',
      'Invalid date'
    );
  });

  it('maps date picker changes to first date or null', () => {
    render(<DateFilterField id="created-on" label="Created On" value={null} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Date Change' }));
    fireEvent.click(screen.getByRole('button', { name: 'Trigger Empty Change' }));

    expect(onChange).toHaveBeenNthCalledWith(1, '2026-05-25');
    expect(onChange).toHaveBeenNthCalledWith(2, null);
  });

  it('stops click propagation when stopPropagation is enabled', () => {
    const outerClickHandler = vi.fn();

    render(
      <div onClick={outerClickHandler}>
        <DateFilterField
          id="created-on"
          label="Created On"
          value={null}
          onChange={onChange}
          stopPropagation
        />
      </div>
    );

    fireEvent.click(screen.getByTestId('mock-layer'));

    expect(outerClickHandler).not.toHaveBeenCalled();
  });
});
