import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TimeFilterField from '../timeFilterField';

const mockTimePicker = vi.fn(
  ({ id, labelText, value, size, onChange, disabled, invalid, invalidText, children }) => (
    <div
      data-testid="mock-time-picker"
      data-id={id}
      data-label={labelText}
      data-value={value}
      data-size={size}
      data-disabled={String(Boolean(disabled))}
      data-invalid={String(Boolean(invalid))}
      data-invalid-text={invalidText || ''}
    >
      <button type="button" onClick={() => onChange({ target: { value: '10:45' } })}>
        Trigger Time Change
      </button>
      <button type="button" onClick={() => onChange({ target: { value: '   ' } })}>
        Trigger Empty Time Change
      </button>
      {children}
    </div>
  )
);

const mockTimePickerSelect = vi.fn(({ id, value, onChange, disabled, children }) => (
  <div
    data-testid="mock-time-picker-select"
    data-id={id}
    data-value={value}
    data-disabled={String(Boolean(disabled))}
  >
    <button type="button" onClick={() => onChange({ target: { value: 'PM' } })}>
      Trigger Period Change
    </button>
    {children}
  </div>
));

const mockSelectItem = vi.fn(({ value, text }) => (
  <div data-testid={`mock-select-item-${value}`} data-value={value}>
    {text}
  </div>
));

const mockLayer = vi.fn(({ children, level }) => (
  <div data-testid="mock-layer" data-level={String(level)}>
    {children}
  </div>
));

vi.mock('@carbon/react', () => ({
  Layer: (props) => mockLayer(props),
  SelectItem: (props) => mockSelectItem(props),
  TimePicker: (props) => mockTimePicker(props),
  TimePickerSelect: (props) => mockTimePickerSelect(props),
}));

describe('TimeFilterField', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with empty value fallback and default AM period', () => {
    render(<TimeFilterField id="start-time" label="Start Time" value="" onChange={onChange} />);

    expect(screen.getByTestId('mock-layer')).toHaveAttribute('data-level', '1');
    expect(screen.getByTestId('mock-time-picker')).toHaveAttribute('data-id', 'start-time');
    expect(screen.getByTestId('mock-time-picker')).toHaveAttribute('data-label', 'Start Time');
    expect(screen.getByTestId('mock-time-picker')).toHaveAttribute('data-value', '');
    expect(screen.getByTestId('mock-time-picker')).toHaveAttribute('data-size', 'md');
    expect(screen.getByTestId('mock-time-picker')).toHaveAttribute('data-disabled', 'false');
    expect(screen.getByTestId('mock-time-picker')).toHaveAttribute('data-invalid', 'false');
    expect(screen.getByTestId('mock-time-picker-select')).toHaveAttribute(
      'data-id',
      'start-time-ampm'
    );
    expect(screen.getByTestId('mock-time-picker-select')).toHaveAttribute('data-value', 'AM');
    expect(screen.getByTestId('mock-select-item-AM')).toHaveTextContent('AM');
    expect(screen.getByTestId('mock-select-item-PM')).toHaveTextContent('PM');
  });

  it('parses explicit PM value and passes disabled/error/size props', () => {
    render(
      <TimeFilterField
        id="end-time"
        label="End Time"
        value="09:15 PM"
        onChange={onChange}
        disabled
        error="Invalid time"
        size="sm"
      />
    );

    expect(screen.getByTestId('mock-time-picker')).toHaveAttribute('data-value', '09:15');
    expect(screen.getByTestId('mock-time-picker')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByTestId('mock-time-picker')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('mock-time-picker')).toHaveAttribute('data-invalid', 'true');
    expect(screen.getByTestId('mock-time-picker')).toHaveAttribute(
      'data-invalid-text',
      'Invalid time'
    );
    expect(screen.getByTestId('mock-time-picker-select')).toHaveAttribute('data-value', 'PM');
    expect(screen.getByTestId('mock-time-picker-select')).toHaveAttribute('data-disabled', 'true');
  });

  it('uses AM as default period when value has no suffix', () => {
    render(<TimeFilterField id="mid-time" label="Mid Time" value="11:30" onChange={onChange} />);

    expect(screen.getByTestId('mock-time-picker')).toHaveAttribute('data-value', '11:30');
    expect(screen.getByTestId('mock-time-picker-select')).toHaveAttribute('data-value', 'AM');
  });

  it('emits combined time and period on time change and empty string for blank input', () => {
    render(
      <TimeFilterField id="start-time" label="Start Time" value="09:15 PM" onChange={onChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Time Change' }));
    fireEvent.click(screen.getByRole('button', { name: 'Trigger Empty Time Change' }));

    expect(onChange).toHaveBeenNthCalledWith(1, '10:45 PM');
    expect(onChange).toHaveBeenNthCalledWith(2, '');
  });

  it('emits updated value when period changes', () => {
    render(
      <TimeFilterField id="start-time" label="Start Time" value="08:20 AM" onChange={onChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Period Change' }));

    expect(onChange).toHaveBeenCalledWith('08:20 PM');
  });

  it('stops click propagation when stopPropagation is enabled', () => {
    const outerClickHandler = vi.fn();

    render(
      <div onClick={outerClickHandler}>
        <TimeFilterField
          id="start-time"
          label="Start Time"
          value="08:20 AM"
          onChange={onChange}
          stopPropagation
        />
      </div>
    );

    fireEvent.click(screen.getByTestId('mock-layer'));

    expect(outerClickHandler).not.toHaveBeenCalled();
  });
});
