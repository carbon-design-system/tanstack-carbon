import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RadioGroupFilterField from '../radioGroupFilterField';

const mockRadioButtonGroup = vi.fn(
  ({
    children,
    legendText,
    name,
    valueSelected,
    onChange,
    disabled,
    invalid,
    invalidText,
    orientation,
  }) => (
    <div
      data-testid="mock-radio-group"
      data-legend={legendText}
      data-name={name}
      data-selected={String(valueSelected)}
      data-disabled={String(Boolean(disabled))}
      data-invalid={String(Boolean(invalid))}
      data-invalid-text={invalidText || ''}
      data-orientation={orientation}
    >
      <button type="button" onClick={() => onChange('inactive')}>
        Trigger Radio Change
      </button>
      {children}
    </div>
  )
);

const mockRadioButton = vi.fn(({ id, value, labelText }) => (
  <div
    data-testid={`mock-radio-${id}`}
    data-id={id}
    data-value={String(value)}
    data-label={typeof labelText === 'string' ? labelText : 'node-label'}
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
  Layer: (props) => mockLayer(props),
  RadioButton: (props) => mockRadioButton(props),
  RadioButtonGroup: (props) => mockRadioButtonGroup(props),
}));

vi.mock('../../scss/filterSidePanel.module.scss', () => ({
  default: {
    noResults: 'noResults',
  },
}));

describe('RadioGroupFilterField', () => {
  const onChange = vi.fn();
  const items = [
    { id: 'status-active', label: 'Active', value: 'active' },
    { id: 'status-inactive', label: 'Inactive', value: 'inactive' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders radio group with items and selected value', () => {
    render(
      <RadioGroupFilterField
        legend="Status"
        name="status"
        items={items}
        selectedValue="active"
        onChange={onChange}
      />
    );

    expect(screen.getByTestId('mock-layer')).toHaveAttribute('data-level', '1');
    expect(screen.getByTestId('mock-radio-group')).toHaveAttribute('data-legend', 'Status');
    expect(screen.getByTestId('mock-radio-group')).toHaveAttribute('data-name', 'status');
    expect(screen.getByTestId('mock-radio-group')).toHaveAttribute('data-selected', 'active');
    expect(screen.getByTestId('mock-radio-group')).toHaveAttribute('data-orientation', 'vertical');
    expect(screen.getByTestId('mock-radio-status-active')).toHaveAttribute('data-label', 'Active');
    expect(screen.getByTestId('mock-radio-status-inactive')).toHaveAttribute(
      'data-label',
      'Inactive'
    );
  });

  it('passes disabled and invalid state to the radio group', () => {
    render(
      <RadioGroupFilterField
        legend="Status"
        name="status"
        items={items}
        selectedValue="inactive"
        onChange={onChange}
        disabled
        error="Select one"
      />
    );

    expect(screen.getByTestId('mock-radio-group')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('mock-radio-group')).toHaveAttribute('data-invalid', 'true');
    expect(screen.getByTestId('mock-radio-group')).toHaveAttribute(
      'data-invalid-text',
      'Select one'
    );
  });

  it('forwards radio group changes to onChange callback', () => {
    render(
      <RadioGroupFilterField
        legend="Status"
        name="status"
        items={items}
        selectedValue=""
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Radio Change' }));

    expect(onChange).toHaveBeenCalledWith('inactive');
  });

  it('renders default empty message when items are empty', () => {
    render(
      <RadioGroupFilterField
        legend="Status"
        name="status"
        items={[]}
        selectedValue=""
        onChange={onChange}
      />
    );

    expect(screen.getByText('No options available')).toBeInTheDocument();
  });

  it('renders custom empty message when provided', () => {
    render(
      <RadioGroupFilterField
        legend="Status"
        name="status"
        items={[]}
        selectedValue=""
        onChange={onChange}
        emptyMessage="No matching status options"
      />
    );

    expect(screen.getByText('No matching status options')).toBeInTheDocument();
  });

  it('stops click propagation when stopPropagation is enabled', () => {
    const outerClickHandler = vi.fn();

    render(
      <div onClick={outerClickHandler}>
        <RadioGroupFilterField
          legend="Status"
          name="status"
          items={items}
          selectedValue=""
          onChange={onChange}
          stopPropagation
        />
      </div>
    );

    fireEvent.click(screen.getByTestId('mock-layer'));

    expect(outerClickHandler).not.toHaveBeenCalled();
  });
});
