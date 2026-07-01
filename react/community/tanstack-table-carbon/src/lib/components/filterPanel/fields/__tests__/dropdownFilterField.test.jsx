import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DropdownFilterField from '../dropdownFilterField';

const mockDropdown = vi.fn(
  ({
    id,
    titleText,
    label,
    items,
    selectedItem,
    itemToString,
    onChange,
    disabled,
    invalid,
    invalidText,
    size,
  }) => (
    <div
      data-testid="mock-dropdown"
      data-id={id}
      data-title={typeof titleText === 'string' ? titleText : 'node-title'}
      data-label={label}
      data-selected={itemToString(selectedItem)}
      data-disabled={String(Boolean(disabled))}
      data-invalid={String(Boolean(invalid))}
      data-invalid-text={invalidText || ''}
      data-size={size}
      data-items={items.map((item) => itemToString(item)).join('|')}
    >
      <button type="button" onClick={() => onChange({ selectedItem: items[0] ?? null })}>
        Trigger First Item
      </button>
      <button type="button" onClick={() => onChange({ selectedItem: null })}>
        Trigger Null Item
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
  Dropdown: (props) => mockDropdown(props),
  Layer: (props) => mockLayer(props),
}));

describe('DropdownFilterField', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default itemToString behavior and mapped props', () => {
    render(
      <DropdownFilterField
        id="status-filter"
        titleText="Status"
        items={['Open', { label: 'Closed', value: 'closed' }, { text: 'Pending', id: 'pending' }]}
        selectedItem={{ value: 'closed', label: 'Closed' }}
        onChange={onChange}
        error="Required"
        disabled
        size="sm"
      />
    );

    expect(screen.getByTestId('mock-layer')).toHaveAttribute('data-level', '1');
    expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-id', 'status-filter');
    expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-title', 'Status');
    expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-label', 'Choose an option');
    expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-selected', 'Closed');
    expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-invalid', 'true');
    expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-invalid-text', 'Required');
    expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByTestId('mock-dropdown')).toHaveAttribute(
      'data-items',
      'Open|Closed|Pending'
    );
  });

  it('uses custom itemToString and maps selected item changes to callback', () => {
    const customItemToString = vi.fn((item) => (item ? `item:${item.code}` : 'none'));

    render(
      <DropdownFilterField
        id="custom-filter"
        titleText="Custom"
        label="Select status"
        items={[{ code: 'A1' }, { code: 'B2' }]}
        selectedItem={{ code: 'B2' }}
        onChange={onChange}
        itemToString={customItemToString}
      />
    );

    expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-label', 'Select status');
    expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-selected', 'item:B2');
    expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-items', 'item:A1|item:B2');

    fireEvent.click(screen.getByRole('button', { name: 'Trigger First Item' }));
    fireEvent.click(screen.getByRole('button', { name: 'Trigger Null Item' }));

    expect(onChange).toHaveBeenNthCalledWith(1, { code: 'A1' });
    expect(onChange).toHaveBeenNthCalledWith(2, null);
  });

  it('falls back to empty string when selected item is null', () => {
    render(
      <DropdownFilterField
        id="empty-filter"
        titleText="Empty"
        items={[]}
        selectedItem={null}
        onChange={onChange}
      />
    );

    expect(screen.getByTestId('mock-dropdown')).toHaveAttribute('data-selected', '');
  });

  it('stops click propagation when stopPropagation is enabled', () => {
    const outerClickHandler = vi.fn();

    render(
      <div onClick={outerClickHandler}>
        <DropdownFilterField
          id="status-filter"
          titleText="Status"
          items={['Open']}
          selectedItem="Open"
          onChange={onChange}
          stopPropagation
        />
      </div>
    );

    fireEvent.click(screen.getByTestId('mock-layer'));

    expect(outerClickHandler).not.toHaveBeenCalled();
  });
});
