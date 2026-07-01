import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MultiSelectFilterField from '../multiSelectFilterField';

const mockMultiSelect = vi.fn(
  ({
    id,
    titleText,
    label,
    items,
    selectedItems,
    itemToString,
    onChange,
    disabled,
    invalid,
    invalidText,
    size,
  }) => (
    <div
      data-testid="mock-multiselect"
      data-id={id}
      data-title={typeof titleText === 'string' ? titleText : 'node-title'}
      data-label={label}
      data-selected={selectedItems.map((item) => itemToString(item)).join('|')}
      data-disabled={String(Boolean(disabled))}
      data-invalid={String(Boolean(invalid))}
      data-invalid-text={invalidText || ''}
      data-size={size}
      data-items={items.map((item) => itemToString(item)).join('|')}
    >
      <button type="button" onClick={() => onChange({ selectedItems: [items[0]].filter(Boolean) })}>
        Trigger One Selected
      </button>
      <button type="button" onClick={() => onChange({ selectedItems: null })}>
        Trigger Null Selected
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
  MultiSelect: (props) => mockMultiSelect(props),
}));

describe('MultiSelectFilterField', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default itemToString behavior and mapped props', () => {
    render(
      <MultiSelectFilterField
        id="tags-filter"
        titleText="Tags"
        items={[{ text: 'IBM' }, { label: 'z/OS' }, { value: 'cloud' }, { id: 'security' }]}
        selectedItems={[{ text: 'IBM' }, { id: 'security' }]}
        onChange={onChange}
        error="Required"
        disabled
        size="sm"
      />
    );

    expect(screen.getByTestId('mock-layer')).toHaveAttribute('data-level', '1');
    expect(screen.getByTestId('mock-multiselect')).toHaveAttribute('data-id', 'tags-filter');
    expect(screen.getByTestId('mock-multiselect')).toHaveAttribute('data-title', 'Tags');
    expect(screen.getByTestId('mock-multiselect')).toHaveAttribute('data-label', 'Choose options');
    expect(screen.getByTestId('mock-multiselect')).toHaveAttribute('data-selected', 'IBM|security');
    expect(screen.getByTestId('mock-multiselect')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('mock-multiselect')).toHaveAttribute('data-invalid', 'true');
    expect(screen.getByTestId('mock-multiselect')).toHaveAttribute('data-invalid-text', 'Required');
    expect(screen.getByTestId('mock-multiselect')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByTestId('mock-multiselect')).toHaveAttribute(
      'data-items',
      'IBM|z/OS|cloud|security'
    );
  });

  it('uses custom itemToString and maps selected items changes to callback', () => {
    const customItemToString = vi.fn((item) => (item ? `item:${item.code}` : ''));

    render(
      <MultiSelectFilterField
        id="custom-tags"
        titleText="Custom Tags"
        label="Select tags"
        items={[{ code: 'A1' }, { code: 'B2' }]}
        selectedItems={[{ code: 'B2' }]}
        onChange={onChange}
        itemToString={customItemToString}
      />
    );

    expect(screen.getByTestId('mock-multiselect')).toHaveAttribute('data-label', 'Select tags');
    expect(screen.getByTestId('mock-multiselect')).toHaveAttribute('data-selected', 'item:B2');
    expect(screen.getByTestId('mock-multiselect')).toHaveAttribute('data-items', 'item:A1|item:B2');

    fireEvent.click(screen.getByRole('button', { name: 'Trigger One Selected' }));
    fireEvent.click(screen.getByRole('button', { name: 'Trigger Null Selected' }));

    expect(onChange).toHaveBeenNthCalledWith(1, [{ code: 'A1' }]);
    expect(onChange).toHaveBeenNthCalledWith(2, []);
  });

  it('renders empty selections and items safely', () => {
    render(
      <MultiSelectFilterField
        id="empty-tags"
        titleText="Empty Tags"
        items={[]}
        selectedItems={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByTestId('mock-multiselect')).toHaveAttribute('data-selected', '');
    expect(screen.getByTestId('mock-multiselect')).toHaveAttribute('data-items', '');
  });

  it('stops click propagation when stopPropagation is enabled', () => {
    const outerClickHandler = vi.fn();

    render(
      <div onClick={outerClickHandler}>
        <MultiSelectFilterField
          id="tags-filter"
          titleText="Tags"
          items={[{ text: 'IBM' }]}
          selectedItems={[{ text: 'IBM' }]}
          onChange={onChange}
          stopPropagation
        />
      </div>
    );

    fireEvent.click(screen.getByTestId('mock-layer'));

    expect(outerClickHandler).not.toHaveBeenCalled();
  });
});
