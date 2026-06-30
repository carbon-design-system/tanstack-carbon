import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import styles from '../scss/virtualizedTableSections.module.scss';
import {
  StandardTableBody,
  VirtualizedTableBody,
  VirtualizedTableHead,
} from '../virtualizedTableSections';

vi.mock('@tanstack/react-table', () => ({
  flexRender: (renderer, context) =>
    typeof renderer === 'function' ? renderer(context) : renderer,
}));

vi.mock('../editableCell', () => ({
  default: ({ children, id }) => (
    <td data-testid={`editable-text-${id}`}>{children}</td>
  ),
}));

vi.mock('../editableDateCell', () => ({
  default: ({ children, id }) => (
    <td data-testid={`editable-date-${id}`}>{children}</td>
  ),
}));

vi.mock('../editableSelectCell', () => ({
  default: ({ children, id }) => (
    <td data-testid={`editable-select-${id}`}>{children}</td>
  ),
}));

vi.mock('../noDataEmptyState', () => ({
  default: ({ title, subtitle }) => (
    <div data-testid="no-data-empty-state">
      <span>{title}</span>
      <span>{subtitle}</span>
    </div>
  ),
}));

vi.mock('../../utils/stickyColumnHelpers', () => ({
  getCommonPinningStyles: vi.fn(() => ({
    position: 'sticky',
    left: '0px',
    zIndex: 2,
  })),
}));

const createColumn = ({
  size = 180,
  pinned = false,
  sorted = false,
  sortable = true,
  editable = false,
  editableType,
  options,
  header = 'Header',
  cellRenderer = () => 'Cell Value',
} = {}) => ({
  getSize: () => size,
  getIsPinned: () => pinned,
  getIsSorted: () => sorted,
  getCanSort: () => sortable,
  getToggleSortingHandler: () => vi.fn(),
  getIsLastColumn: () => false,
  getIsFirstColumn: () => false,
  columnDef: {
    header,
    cell: cellRenderer,
    meta: editable
      ? {
          editable: true,
          editableType,
          options,
        }
      : {},
  },
});

const createHeader = ({
  id = 'header-1',
  column = createColumn(),
  colSpan = 1,
  isPlaceholder = false,
  context = {},
} = {}) => ({
  id,
  column,
  colSpan,
  isPlaceholder,
  getContext: () => context,
});

const createCell = ({
  id = 'cell-1',
  column = createColumn(),
  context = {},
} = {}) => ({
  id,
  column,
  getContext: () => context,
});

const createRow = ({
  id = 'row-1',
  selected = false,
  original = { id: 'original-1' },
  cells = [createCell()],
} = {}) => ({
  id,
  original,
  getIsSelected: () => selected,
  getVisibleCells: () => cells,
});

describe('virtualizedTableSections', () => {
  it('renders sticky virtualized headers with sorting state and skips placeholders', () => {
    const sortableColumn = createColumn({
      size: 220,
      pinned: 'left',
      sorted: 'asc',
      header: () => 'Name',
    });

    const placeholderColumn = createColumn({
      size: 120,
      header: () => 'Hidden',
    });

    const table = {
      getHeaderGroups: () => [
        {
          id: 'group-1',
          headers: [
            createHeader({
              id: 'header-name',
              column: sortableColumn,
            }),
            createHeader({
              id: 'header-placeholder',
              column: placeholderColumn,
              isPlaceholder: true,
            }),
          ],
        },
      ],
    };

    render(
      <table>
        <VirtualizedTableHead
          table={table}
          shouldRenderVirtualizedBody
          enableStickyColumns
        />
      </table>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('renders empty state in standard body when there are no rows', () => {
    const table = {
      getRowModel: () => ({
        rows: [],
      }),
    };

    render(
      <table>
        <StandardTableBody
          table={table}
          tableColumns={[{ id: 'one' }, { id: 'two' }]}
          enableStickyColumns={false}
          enableEditableCells={false}
          editableCell={{ editingId: null, setEditingId: vi.fn() }}
          tableContainerRef={{ current: null }}
          isRowExpansionEnabled={false}
          expansion={{ expanded: {} }}
          expansionFeature={{}}
          finalTableColumns={[{ id: 'one' }, { id: 'two' }]}
          emptyStateTitle="No records"
          emptyStateSubtitle="Try again later"
        />
      </table>
    );

    expect(screen.getByTestId('no-data-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No records')).toBeInTheDocument();
    expect(screen.getByText('Try again later')).toBeInTheDocument();
  });

  it('renders editable cells and expanded row content in standard body', () => {
    const textColumn = createColumn({
      editable: true,
      editableType: 'text',
      cellRenderer: () => 'Editable text',
    });
    const dateColumn = createColumn({
      editable: true,
      editableType: 'date',
      cellRenderer: () => 'Editable date',
    });
    const selectColumn = createColumn({
      editable: true,
      editableType: 'select',
      options: [{ value: 'one', label: 'One' }],
      cellRenderer: () => 'Editable select',
    });

    const row = createRow({
      id: 'row-1',
      selected: true,
      original: { name: 'expanded row' },
      cells: [
        createCell({ id: 'text-cell', column: textColumn }),
        createCell({ id: 'date-cell', column: dateColumn }),
        createCell({ id: 'select-cell', column: selectColumn }),
      ],
    });

    const table = {
      getRowModel: () => ({
        rows: [row],
      }),
    };

    render(
      <table>
        <StandardTableBody
          table={table}
          tableColumns={[{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }]}
          enableStickyColumns={false}
          enableEditableCells
          editableCell={{ editingId: 'text-cell', setEditingId: vi.fn() }}
          tableContainerRef={{ current: null }}
          isRowExpansionEnabled
          expansion={{ expanded: { 'row-1': true } }}
          expansionFeature={{
            renderExpandedRow: (original) => <div>{original.name}</div>,
          }}
          finalTableColumns={[{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }]}
          emptyStateTitle="unused"
          emptyStateSubtitle="unused"
        />
      </table>
    );

    expect(screen.getByTestId('editable-text-text-cell')).toBeInTheDocument();
    expect(screen.getByTestId('editable-date-date-cell')).toBeInTheDocument();
    expect(
      screen.getByTestId('editable-select-select-cell')
    ).toBeInTheDocument();
    expect(screen.getByText('expanded row')).toBeInTheDocument();
  });

  it('renders virtualized rows, ignores missing rows, and uses custom empty state', () => {
    const measureElement = vi.fn();
    const bodyRow = createRow({
      id: 'row-virtual-1',
      cells: [
        createCell({
          id: 'body-cell-1',
          column: createColumn({
            editable: false,
            pinned: 'left',
            cellRenderer: () => 'Virtual cell',
          }),
        }),
      ],
    });

    const { rerender } = render(
      <table>
        <VirtualizedTableBody
          bodyRows={[bodyRow]}
          virtualRows={[
            { index: 0, start: 10 },
            { index: 1, start: 40 },
          ]}
          rowVirtualizer={{ measureElement }}
          table={{}}
          tableColumns={[{ id: 'c1' }]}
          enableStickyColumns
          enableEditableCells={false}
          editableCell={{ editingId: null, setEditingId: vi.fn() }}
          tableContainerRef={{ current: null }}
          emptyStateRender={<div>Custom empty state</div>}
          emptyStateTitle="unused"
          emptyStateSubtitle="unused"
          totalSize={500}
        />
      </table>
    );

    expect(screen.getByText('Virtual cell')).toBeInTheDocument();

    rerender(
      <table>
        <VirtualizedTableBody
          bodyRows={[]}
          virtualRows={[]}
          rowVirtualizer={{ measureElement }}
          table={{}}
          tableColumns={[{ id: 'c1' }]}
          enableStickyColumns={false}
          enableEditableCells={false}
          editableCell={{ editingId: null, setEditingId: vi.fn() }}
          tableContainerRef={{ current: null }}
          emptyStateRender={<div>Custom empty state</div>}
          emptyStateTitle="unused"
          emptyStateSubtitle="unused"
          totalSize={0}
        />
      </table>
    );

    expect(screen.getByText('Custom empty state')).toBeInTheDocument();
  });
  it('renders a non-editable cell without inline width when column has no size defined', () => {
    // NOTE: Covers the style=undefined branch (line 86) when columnDef.size is undefined
    const column = createColumn({ editable: false });
    delete column.columnDef.size; // ensure size is absent

    const row = createRow({
      cells: [createCell({ id: 'no-size-cell', column })],
    });

    const { container } = render(
      <table>
        <StandardTableBody
          table={{ getRowModel: () => ({ rows: [row] }) }}
          tableColumns={[{ id: 'c1' }]}
          enableStickyColumns={false}
          enableEditableCells={false}
          editableCell={{ editingId: null, setEditingId: vi.fn() }}
          tableContainerRef={{ current: null }}
          isRowExpansionEnabled={false}
          expansion={{ expanded: {} }}
          expansionFeature={{}}
          finalTableColumns={[{ id: 'c1' }]}
          emptyStateTitle="unused"
          emptyStateSubtitle="unused"
        />
      </table>
    );

    const cell = container.querySelector('td');
    expect(cell).toBeInTheDocument();
    expect(cell.style.width).toBe('');
  });

  it('falls back to text editable type when editableType is undefined', () => {
    // NOTE: Covers the `editableType || 'text'` fallback (line 71)
    const column = createColumn({ editable: true, editableType: undefined });
    const row = createRow({
      cells: [createCell({ id: 'fallback-cell', column })],
    });

    render(
      <table>
        <StandardTableBody
          table={{ getRowModel: () => ({ rows: [row] }) }}
          tableColumns={[{ id: 'c1' }]}
          enableStickyColumns={false}
          enableEditableCells
          editableCell={{ editingId: null, setEditingId: vi.fn() }}
          tableContainerRef={{ current: null }}
          isRowExpansionEnabled={false}
          expansion={{ expanded: {} }}
          expansionFeature={{}}
          finalTableColumns={[{ id: 'c1' }]}
          emptyStateTitle="unused"
          emptyStateSubtitle="unused"
        />
      </table>
    );

    // NOTE: Falls back to EditableCell (text) mock
    expect(
      screen.getByTestId('editable-text-fallback-cell')
    ).toBeInTheDocument();
  });

  it('fires handleParentRowHover on mouse enter/leave of an expanded parent row', () => {
    // NOTE: Covers lines 181-188 (handleParentRowHover) and 226-232 (onMouseEnter/Leave props)
    const row = createRow({
      id: 'hover-row',
      cells: [createCell({ id: 'hover-cell' })],
    });

    const { container } = render(
      <table>
        <StandardTableBody
          table={{ getRowModel: () => ({ rows: [row] }) }}
          tableColumns={[{ id: 'c1' }]}
          enableStickyColumns={false}
          enableEditableCells={false}
          editableCell={{ editingId: null, setEditingId: vi.fn() }}
          tableContainerRef={{ current: null }}
          isRowExpansionEnabled
          expansion={{ expanded: { 'hover-row': true } }}
          expansionFeature={{ renderExpandedRow: () => <div>expanded</div> }}
          finalTableColumns={[{ id: 'c1' }]}
          emptyStateTitle="unused"
          emptyStateSubtitle="unused"
        />
      </table>
    );

    const rows = container.querySelectorAll(
      'tr[data-row-id], tr[data-parent-row-id]'
    );
    const parentRow = rows[0];
    const expandedRow = rows[1];

    // NOTE: Verify the correct attributes are on the right rows
    expect(parentRow).toHaveAttribute('data-row-id', 'hover-row');
    expect(expandedRow).toHaveAttribute('data-parent-row-id', 'hover-row');

    // NOTE: Simulate mouseEnter on parent → adds hoveredExpanded to expanded sibling
    fireEvent.mouseEnter(parentRow);
    expect(expandedRow.classList.contains(styles.hoveredExpanded)).toBe(true);

    // NOTE: Simulate mouseLeave on parent → removes hoveredExpanded
    fireEvent.mouseLeave(parentRow);
    expect(expandedRow.classList.contains(styles.hoveredExpanded)).toBe(false);
  });

  it('fires handleExpandedRowHover on mouse enter/leave of the expanded content row', () => {
    // NOTE: Covers lines 193-199 (handleExpandedRowHover) and 251-252 (onMouseEnter/Leave props)
    const row = createRow({
      id: 'hover-row-2',
      cells: [createCell({ id: 'hover-cell-2' })],
    });

    const { container } = render(
      <table>
        <StandardTableBody
          table={{ getRowModel: () => ({ rows: [row] }) }}
          tableColumns={[{ id: 'c1' }]}
          enableStickyColumns={false}
          enableEditableCells={false}
          editableCell={{ editingId: null, setEditingId: vi.fn() }}
          tableContainerRef={{ current: null }}
          isRowExpansionEnabled
          expansion={{ expanded: { 'hover-row-2': true } }}
          expansionFeature={{ renderExpandedRow: () => <div>expanded</div> }}
          finalTableColumns={[{ id: 'c1' }]}
          emptyStateTitle="unused"
          emptyStateSubtitle="unused"
        />
      </table>
    );

    const rows = container.querySelectorAll(
      'tr[data-row-id], tr[data-parent-row-id]'
    );
    const parentRow = rows[0];
    const expandedRow = rows[1];

    // NOTE: Simulate mouseEnter on expanded row → adds hoveredParent to parent
    fireEvent.mouseEnter(expandedRow);
    expect(parentRow.classList.contains(styles.hoveredParent)).toBe(true);

    // NOTE: Simulate mouseLeave on expanded row → removes hoveredParent
    fireEvent.mouseLeave(expandedRow);
    expect(parentRow.classList.contains(styles.hoveredParent)).toBe(false);
  });

  it('renders virtualized rows without rowVirtualizer (rowVirtualizer is null)', () => {
    // NOTE: Covers the rowVirtualizer?.measureElement null branch (line 292)
    const row = createRow({
      id: 'row-no-virtualizer',
      cells: [
        createCell({
          id: 'cell-no-virt',
          column: createColumn({ editable: false }),
        }),
      ],
    });

    render(
      <table>
        <VirtualizedTableBody
          bodyRows={[row]}
          virtualRows={[{ index: 0, start: 0 }]}
          rowVirtualizer={null}
          table={{}}
          tableColumns={[{ id: 'c1' }]}
          enableStickyColumns={false}
          enableEditableCells={false}
          editableCell={{ editingId: null, setEditingId: vi.fn() }}
          tableContainerRef={{ current: null }}
          emptyStateRender={null}
          emptyStateTitle="unused"
          emptyStateSubtitle="unused"
          totalSize={100}
        />
      </table>
    );

    expect(screen.getByText('Cell Value')).toBeInTheDocument();
  });
});
