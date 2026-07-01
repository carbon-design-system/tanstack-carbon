import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NumberFilterField from '../numberFilterField';

const mockNumberInput = vi.fn(
  ({
    id,
    label,
    value,
    onChange,
    disabled,
    invalid,
    invalidText,
    min,
    max,
    step,
    hideSteppers,
    size,
    allowEmpty,
  }) => (
    <div
      data-testid="mock-number-input"
      data-id={id}
      data-label={typeof label === 'string' ? label : 'node-label'}
      data-value={String(value)}
      data-disabled={String(Boolean(disabled))}
      data-invalid={String(Boolean(invalid))}
      data-invalid-text={invalidText || ''}
      data-min={min ?? ''}
      data-max={max ?? ''}
      data-step={step}
      data-hide-steppers={String(Boolean(hideSteppers))}
      data-size={size}
      data-allow-empty={String(Boolean(allowEmpty))}
    >
      <button type="button" onClick={() => onChange(null, { value: 42 })}>
        Trigger Number Change
      </button>
    </div>
  )
);

const mockLayer = vi.fn(({ children, level, onClick }) => (
  <div data-testid="mock-layer" data-level={String(level)} onClick={onClick}>
    {children}
  </div>
));

vi.mock('@carbon/react', () => ({
  Layer: (props) => mockLayer(props),
  NumberInput: (props) => mockNumberInput(props),
}));

describe('NumberFilterField', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props and null value fallback', () => {
    render(<NumberFilterField id="count" label="Count" value={null} onChange={onChange} />);

    expect(screen.getByTestId('mock-layer')).toHaveAttribute('data-level', '1');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-id', 'count');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-label', 'Count');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-value', '');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-disabled', 'false');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-invalid', 'false');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-step', '1');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-hide-steppers', 'false');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-size', 'md');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-allow-empty', 'false');
  });

  it('renders with custom props and invalid state', () => {
    render(
      <NumberFilterField
        id="age"
        label="Age"
        value={7}
        onChange={onChange}
        disabled
        error="Invalid number"
        min={1}
        max={10}
        step={2}
        hideSteppers
        size="sm"
        allowEmpty
      />
    );

    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-value', '7');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-invalid', 'true');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute(
      'data-invalid-text',
      'Invalid number'
    );
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-min', '1');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-max', '10');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-step', '2');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-hide-steppers', 'true');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByTestId('mock-number-input')).toHaveAttribute('data-allow-empty', 'true');
  });

  it('forwards number input changes to onChange callback', () => {
    render(<NumberFilterField id="count" label="Count" value={0} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Number Change' }));

    expect(onChange).toHaveBeenCalledWith(42);
  });

  it('stops click propagation when stopPropagation is enabled', () => {
    const outerClickHandler = vi.fn();

    render(
      <div onClick={outerClickHandler}>
        <NumberFilterField id="count" label="Count" value={0} onChange={onChange} stopPropagation />
      </div>
    );

    fireEvent.click(screen.getByTestId('mock-layer'));

    expect(outerClickHandler).not.toHaveBeenCalled();
  });
});
