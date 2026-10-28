import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEFAULT_LABELS } from '../../../../constants/defaultLabels';
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
  Button: ({ children, onClick, className, 'data-testid': testId }) => (
    <button type="button" onClick={onClick} className={className} data-testid={testId}>
      {children}
    </button>
  ),
}));

vi.mock('../../scss/filterSidePanel.module.scss', () => ({
  default: {
    filterCheckboxGroupLabel: 'filterCheckboxGroupLabel',
    filterError: 'filterError',
    checkboxGroup: 'checkboxGroup',
    checkboxWithCount: 'checkboxWithCount',
    checkboxCount: 'checkboxCount',
    checkboxViewMoreBtn: 'checkboxViewMoreBtn',
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

    expect(screen.getByText(DEFAULT_LABELS.filterFieldNoOptionsText)).toBeInTheDocument();
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

  it('shows all checkboxes and no toggle button when items count is 9 or less', () => {
    const nineItems = Array.from({ length: 9 }, (_, i) => ({
      id: `item-${i + 1}`,
      label: `Option ${i + 1}`,
      value: `option-${i + 1}`,
    }));

    render(
      <CheckboxGroupFilterField
        legend="Options"
        items={nineItems}
        selectedValues={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 9')).toBeInTheDocument();
    expect(screen.queryByTestId('options-view-all-btn')).not.toBeInTheDocument();
  });

  it('collapses to 7 checkboxes with View all button when items count is 10 or more, and toggles Show less', () => {
    const elevenItems = Array.from({ length: 11 }, (_, i) => ({
      id: `item-${i + 1}`,
      label: `Option ${i + 1}`,
      value: `option-${i + 1}`,
    }));

    render(
      <CheckboxGroupFilterField
        legend="Options"
        items={elevenItems}
        selectedValues={[]}
        onChange={onChange}
      />
    );

    // Initial collapsed state: shows 1-7, hides 8-11
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 7')).toBeInTheDocument();
    expect(screen.queryByLabelText('Option 8')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Option 11')).not.toBeInTheDocument();

    const viewAllButton = screen.getByTestId('options-view-all-btn');
    expect(viewAllButton).toBeInTheDocument();
    const expectedViewAllText = DEFAULT_LABELS.filterCheckboxViewAll.replace('{count}', '4');
    expect(viewAllButton).toHaveTextContent(expectedViewAllText);

    // Click View all (4) -> Expands all
    fireEvent.click(viewAllButton);
    expect(screen.getByLabelText('Option 8')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 11')).toBeInTheDocument();

    const showLessButton = screen.getByRole('button', {
      name: DEFAULT_LABELS.filterCheckboxShowLess,
    });
    expect(showLessButton).toBeInTheDocument();

    // Click Show less -> Collapses back to 7
    fireEvent.click(showLessButton);
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 7')).toBeInTheDocument();
    expect(screen.queryByLabelText('Option 8')).not.toBeInTheDocument();
    expect(screen.getByTestId('options-view-all-btn')).toBeInTheDocument();
  });
});
