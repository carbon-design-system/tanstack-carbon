import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CheckboxGroupFilterField from '../checkboxGroupFilterField';

const mockCheckbox = vi.fn(({ id, labelText, checked, onChange, disabled }) => (
  <label htmlFor={id}>
    <input
      id={id}
      type="checkbox"
      aria-label={typeof labelText === 'string' ? labelText : id}
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event, { checked: event.target.checked })}
    />
    <span>{labelText}</span>
  </label>
));

const mockLayer = vi.fn(({ children, level }) => (
  <div data-testid="mock-layer" data-level={String(level)}>
    {children}
  </div>
));

vi.mock('@carbon/react', () => ({
  Checkbox: (props) => mockCheckbox(props),
  Layer: (props) => mockLayer(props),
}));

vi.mock('../../scss/filterSidePanel.module.scss', () => ({
  default: {
    filterCheckboxGroupLabel: 'filterCheckboxGroupLabel',
    filterError: 'filterError',
    checkboxGroup: 'checkboxGroup',
    checkboxWithCount: 'checkboxWithCount',
    checkboxCount: 'checkboxCount',
    noResults: 'noResults',
  },
}));

describe('CheckboxGroupFilterField', () => {
  const onChange = vi.fn();
  const items = [
    { id: 'status-active', label: 'Active', value: 'active', count: 3 },
    { id: 'status-inactive', label: 'Inactive', value: 'inactive' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders legend, error, items, counts, and checked state', () => {
    render(
      <CheckboxGroupFilterField
        legend="Status"
        items={items}
        selectedValues={['active']}
        onChange={onChange}
        error="Select at least one"
      />
    );

    expect(screen.getByTestId('mock-layer')).toHaveAttribute('data-level', '1');
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Select at least one')).toBeInTheDocument();
    expect(screen.getByLabelText('Active')).toBeChecked();
    expect(screen.getByLabelText('Inactive')).not.toBeChecked();
    expect(screen.getByText('(3)')).toBeInTheDocument();
  });

  it('calls onChange with item value and checked status', () => {
    render(
      <CheckboxGroupFilterField
        legend="Status"
        items={items}
        selectedValues={[]}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Inactive'));

    expect(onChange).toHaveBeenCalledWith('inactive', true);
  });

  it('passes disabled state to checkboxes', () => {
    render(
      <CheckboxGroupFilterField
        legend="Status"
        items={items}
        selectedValues={[]}
        onChange={onChange}
        disabled
      />
    );

    expect(screen.getByLabelText('Active')).toBeDisabled();
    expect(screen.getByLabelText('Inactive')).toBeDisabled();
  });

  it('renders empty message fallback when there are no items', () => {
    render(
      <CheckboxGroupFilterField
        legend="Status"
        items={[]}
        selectedValues={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByText('No options available')).toBeInTheDocument();
  });

  it('renders custom empty message when provided', () => {
    render(
      <CheckboxGroupFilterField
        legend="Status"
        items={[]}
        selectedValues={[]}
        onChange={onChange}
        emptyMessage="No matching filters"
      />
    );

    expect(screen.getByText('No matching filters')).toBeInTheDocument();
  });

  it('stops click propagation when wrapped with stopPropagation', () => {
    const outerClickHandler = vi.fn();

    render(
      <div onClick={outerClickHandler}>
        <CheckboxGroupFilterField
          legend="Status"
          items={items}
          selectedValues={[]}
          onChange={onChange}
          stopPropagation
        />
      </div>
    );

    fireEvent.click(screen.getByText('Status'));

    expect(outerClickHandler).not.toHaveBeenCalled();
  });
});
