import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SortableColumnItem from '../sortableColumnItem';

const mockUseSortable = vi.fn();

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: (...args) => mockUseSortable(...args),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn((transform) => (transform ? 'translate3d(10px, 20px, 0)' : '')),
    },
  },
}));

vi.mock('@carbon/icons-react', () => ({
  Draggable: ({ className }) => <div data-testid="draggable-icon" className={className} />,
  Locked: ({ className }) => <div data-testid="locked-icon" className={className} />,
}));

vi.mock('@carbon/react', () => ({
  Checkbox: ({ id, labelText, checked, onChange, disabled }) => (
    <label htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={onChange} />
      <span>{labelText}</span>
    </label>
  ),
}));

vi.mock('./scss/ColumnCustomizationPanel.module.scss', () => ({
  default: {
    columnItem: 'columnItem',
    dragging: 'dragging',
    pinned: 'pinned',
    dragIcon: 'dragIcon',
    disabled: 'disabled',
  },
}));

describe('SortableColumnItem', () => {
  it('renders unpinned column with draggable icon and toggles visibility', () => {
    const onToggleVisibility = vi.fn();
    const listeners = { onPointerDown: vi.fn() };

    mockUseSortable.mockReturnValue({
      attributes: { 'data-sortable': 'enabled' },
      listeners,
      setNodeRef: vi.fn(),
      transform: { x: 10, y: 20 },
      transition: 'transform 200ms ease',
      isDragging: true,
    });

    render(
      <SortableColumnItem
        column={{ id: 'name', columnDef: { header: 'Name' } }}
        columnVisibility={{ name: true }}
        onToggleVisibility={onToggleVisibility}
        isPinned={false}
      />
    );

    const checkbox = screen.getByLabelText('Name');
    expect(checkbox).toBeChecked();
    expect(screen.getByTestId('draggable-icon')).toBeInTheDocument();

    fireEvent.click(checkbox);
    expect(onToggleVisibility).toHaveBeenCalledWith('name');
  });

  it('renders pinned column with locked icon, disabled drag, and unchecked hidden state', () => {
    const onToggleVisibility = vi.fn();

    mockUseSortable.mockReturnValue({
      attributes: { 'data-sortable': 'disabled' },
      listeners: { onPointerDown: vi.fn() },
      setNodeRef: vi.fn(),
      transform: null,
      transition: undefined,
      isDragging: false,
    });

    render(
      <SortableColumnItem
        column={{ id: 'status', columnDef: { header: () => 'ignored function header' } }}
        columnVisibility={{ status: false }}
        onToggleVisibility={onToggleVisibility}
        isPinned
      />
    );

    const checkbox = screen.getByLabelText('status');
    expect(checkbox).not.toBeChecked();
    expect(checkbox).toBeDisabled();
    expect(screen.getByTestId('locked-icon')).toBeInTheDocument();
    expect(onToggleVisibility).not.toHaveBeenCalled();
  });
});
