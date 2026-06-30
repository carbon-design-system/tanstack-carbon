import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ColumnCustomizationPanel from '../columnCustomizationPanel';

let capturedOnDragEnd;

vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual('@dnd-kit/core');
  return {
    ...actual,
    DndContext: ({ children, onDragEnd }) => {
      capturedOnDragEnd = onDragEnd;
      return (
        <div data-testid="dnd-context" data-on-drag-end={Boolean(onDragEnd)}>
          {children}
        </div>
      );
    },
    useSensor: vi.fn(() => ({})),
    useSensors: vi.fn(() => []),
  };
});

vi.mock('@dnd-kit/sortable', async () => {
  const actual = await vi.importActual('@dnd-kit/sortable');
  return {
    ...actual,
    SortableContext: ({ children, disabled, items }) => (
      <div
        data-testid="sortable-context"
        data-disabled={String(disabled)}
        data-items={JSON.stringify(items)}
      >
        {children}
      </div>
    ),
  };
});

vi.mock('../sortableColumnItem', () => ({
  default: ({ column, columnVisibility, onToggleVisibility, isPinned }) => {
    const header =
      typeof column.columnDef.header === 'function'
        ? column.id
        : column.columnDef.header || column.id;

    return (
      <div data-testid={`sortable-column-${column.id}`} data-pinned={String(isPinned)}>
        <span>{header}</span>
        <button type="button" onClick={() => onToggleVisibility(column.id)} disabled={isPinned}>
          Toggle {column.id}
        </button>
        <span>{columnVisibility[column.id] !== false ? 'visible' : 'hidden'}</span>
      </div>
    );
  },
}));

const createColumn = (
  id,
  header,
  { pinned = false, showInColumnCustomization = true, headerIsFunction = false } = {}
) => ({
  id,
  columnDef: {
    header: headerIsFunction ? () => header : header,
    meta: {
      showInColumnCustomization,
    },
  },
  getIsPinned: () => pinned,
});

describe('ColumnCustomizationPanel', () => {
  const columns = [
    createColumn('select', 'Select'),
    createColumn('name', 'Name'),
    createColumn('email', 'Email'),
    createColumn('age', 'Age'),
    createColumn('pinned', 'Pinned', { pinned: true }),
    createColumn('hiddenCustomizable', 'Hidden Customizable', {
      showInColumnCustomization: false,
    }),
    createColumn('dynamicHeader', 'Dynamic Header', { headerIsFunction: true }),
  ];

  let onClose;
  let onApply;
  let onToggleVisibility;
  let onReorder;

  const renderPanel = (overrideProps = {}) =>
    render(
      <ColumnCustomizationPanel
        open={true}
        columns={columns}
        columnOrder={[
          'select',
          'name',
          'email',
          'age',
          'pinned',
          'hiddenCustomizable',
          'dynamicHeader',
        ]}
        columnVisibility={{
          name: true,
          email: false,
          age: true,
          pinned: true,
          dynamicHeader: true,
        }}
        onClose={onClose}
        onApply={onApply}
        onToggleVisibility={onToggleVisibility}
        onReorder={onReorder}
        {...overrideProps}
      />
    );

  beforeEach(() => {
    capturedOnDragEnd = undefined;
    onClose = vi.fn();
    onApply = vi.fn();
    onToggleVisibility = vi.fn();
    onReorder = vi.fn();
  });

  it('renders only customizable columns and shows correct visible count', () => {
    renderPanel();

    expect(screen.getByText('Customize display (4/5)')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Pinned')).toBeInTheDocument();
    expect(screen.getByText('dynamicHeader')).toBeInTheDocument();

    expect(screen.queryByText('Select')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden Customizable')).not.toBeInTheDocument();
  });

  it('filters columns by search term and supports clearing the search', async () => {
    const user = userEvent.setup();
    renderPanel();

    const searchInput = screen.getByRole('searchbox', { name: /search columns/i });
    await user.type(searchInput, 'em');

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    expect(screen.queryByText('Age')).not.toBeInTheDocument();

    await user.clear(searchInput);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('select all makes hidden unpinned filtered columns visible', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByLabelText('Select All'));

    expect(onToggleVisibility).toHaveBeenCalledWith('email');
    expect(onToggleVisibility).not.toHaveBeenCalledWith('name');
    expect(onToggleVisibility).not.toHaveBeenCalledWith('age');
    expect(onToggleVisibility).not.toHaveBeenCalledWith('pinned');
  });

  it('select all deselects visible unpinned columns when all are visible', async () => {
    const user = userEvent.setup();

    renderPanel({
      columnVisibility: {
        name: true,
        email: true,
        age: true,
        pinned: true,
        dynamicHeader: true,
      },
    });

    await user.click(screen.getByLabelText('Select All'));

    expect(onToggleVisibility).toHaveBeenCalledWith('name');
    expect(onToggleVisibility).toHaveBeenCalledWith('email');
    expect(onToggleVisibility).toHaveBeenCalledWith('age');
    expect(onToggleVisibility).toHaveBeenCalledWith('dynamicHeader');
    expect(onToggleVisibility).not.toHaveBeenCalledWith('pinned');
  });

  it('select all only affects currently filtered columns', async () => {
    const user = userEvent.setup();
    renderPanel();

    const searchInput = screen.getByRole('searchbox', { name: /search columns/i });
    await user.type(searchInput, 'em');
    await user.click(screen.getByLabelText('Select All'));

    expect(onToggleVisibility).toHaveBeenCalledTimes(1);
    expect(onToggleVisibility).toHaveBeenCalledWith('email');
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onApply when apply is clicked', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: /apply/i }));

    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('disables sortable drag when search term is present', async () => {
    const user = userEvent.setup();
    renderPanel();

    const sortableContext = screen.getByTestId('sortable-context');
    expect(sortableContext).toHaveAttribute('data-disabled', 'false');

    const searchInput = screen.getByRole('searchbox', { name: /search columns/i });
    await user.type(searchInput, 'na');

    expect(screen.getByTestId('sortable-context')).toHaveAttribute('data-disabled', 'true');
  });
  it('reorders columns when dragged to a different non-pinned target', () => {
    renderPanel();

    expect(typeof capturedOnDragEnd).toBe('function');

    fireEvent.dragEnd(screen.getByTestId('dnd-context'));
    capturedOnDragEnd({
      active: { id: 'name' },
      over: { id: 'email' },
    });

    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder).toHaveBeenCalledWith([
      'select',
      'email',
      'name',
      'age',
      'pinned',
      'hiddenCustomizable',
      'dynamicHeader',
    ]);
  });

  it('does not reorder columns when dropped on a pinned target', () => {
    renderPanel();

    expect(typeof capturedOnDragEnd).toBe('function');

    fireEvent.dragEnd(screen.getByTestId('dnd-context'));
    capturedOnDragEnd({
      active: { id: 'name' },
      over: { id: 'pinned' },
    });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('does not reorder columns when dropped on the same column', () => {
    renderPanel();

    expect(typeof capturedOnDragEnd).toBe('function');

    fireEvent.dragEnd(screen.getByTestId('dnd-context'));
    capturedOnDragEnd({
      active: { id: 'name' },
      over: { id: 'name' },
    });

    expect(onReorder).not.toHaveBeenCalled();
  });
});
