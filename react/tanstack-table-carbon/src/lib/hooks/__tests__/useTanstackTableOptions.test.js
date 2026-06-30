import { describe, expect, it, vi } from 'vitest';
import {
  getEditableTableMeta,
  getTanstackTableHandlers,
  getTanstackTableInitialState,
  getTanstackTableManualOptions,
  getTanstackTableRowModels,
  getTanstackTableState,
} from '../useTanstackTableOptions';

vi.mock('@tanstack/react-table', () => ({
  getCoreRowModel: vi.fn(() => 'coreRowModel'),
  getSortedRowModel: vi.fn(() => 'sortedRowModel'),
  getPaginationRowModel: vi.fn(() => 'paginationRowModel'),
  getFilteredRowModel: vi.fn(() => 'filteredRowModel'),
  getExpandedRowModel: vi.fn(() => 'expandedRowModel'),
  getFacetedUniqueValues: vi.fn(() => 'facetedUniqueValues'),
}));

vi.mock('../utils/stickyColumnHelpers', () => ({
  processColumnPinning: vi.fn((value) => ({
    processed: true,
    ...value,
  })),
}));

describe('useTanstackTableOptions helpers', () => {
  it('returns minimal state/handlers/manual options/initial state/meta for disabled features', () => {
    const state = getTanstackTableState({
      globalFilter: 'abc',
      sorting: [],
      enableVirtualization: true,
      paginationState: { pageIndex: 1, pageSize: 10 },
      columnVisibility: { a: true },
      columnOrder: ['a'],
      columnFilters: [],
      selection: { enableSelection: false, rowSelection: {} },
      isRowExpansionEnabled: false,
      expansion: { expanded: {} },
      enableStickyColumns: false,
      columnPinning: undefined,
    });

    expect(state).toEqual({
      globalFilter: 'abc',
      sorting: [],
      columnVisibility: { a: true },
      columnOrder: ['a'],
      columnFilters: [],
    });

    const handlers = getTanstackTableHandlers({
      handleSearchChange: vi.fn(),
      handleSortingChange: vi.fn(),
      enableVirtualization: true,
      handlePaginationChange: vi.fn(),
      setColumnVisibility: vi.fn(),
      setColumnOrder: vi.fn(),
      handleColumnFiltersChange: vi.fn(),
      selection: { enableSelection: false, isCheckbox: false, setRowSelection: vi.fn() },
      isRowExpansionEnabled: false,
      expansion: { setExpanded: vi.fn() },
    });

    expect(handlers.onPaginationChange).toBeUndefined();
    expect(handlers.enableRowSelection).toBeUndefined();
    expect(handlers.onExpandedChange).toBeUndefined();

    expect(
      getTanstackTableManualOptions({
        manualPagination: false,
        isServerSideSorting: false,
        isServerSideFiltering: false,
        isServerSideSearch: false,
        isServerSidePagination: false,
        pagination: undefined,
      })
    ).toEqual({
      manualPagination: false,
      manualSorting: false,
      manualFiltering: false,
      pageCount: undefined,
      rowCount: undefined,
      enableSortingRemoval: true,
      sortDescFirst: false,
    });

    expect(
      getTanstackTableInitialState({
        enableStickyColumns: false,
        columnPinning: { left: ['a'] },
      })
    ).toBeUndefined();

    expect(
      getEditableTableMeta({
        enableEditableCells: false,
        onDataChange: vi.fn(),
      })
    ).toBeUndefined();
  });

  it('returns enabled feature options and updates editable data', () => {
    const state = getTanstackTableState({
      globalFilter: 'abc',
      sorting: [{ id: 'name', desc: false }],
      enableVirtualization: false,
      paginationState: { pageIndex: 2, pageSize: 20 },
      columnVisibility: { a: true },
      columnOrder: ['a'],
      columnFilters: [{ id: 'a', value: 'x' }],
      selection: { enableSelection: true, rowSelection: { 0: true } },
      isRowExpansionEnabled: true,
      expansion: { expanded: { 0: true } },
      enableStickyColumns: true,
      columnPinning: { left: ['a'] },
    });

    expect(state.pagination).toEqual({ pageIndex: 2, pageSize: 20 });
    expect(state.rowSelection).toEqual({ 0: true });
    expect(state.expanded).toEqual({ 0: true });
    expect(state.columnPinning).toEqual({ left: ['a'], right: [] });

    const rowModels = getTanstackTableRowModels({
      isServerSideSorting: false,
      isServerSideFiltering: false,
      isServerSideSearch: false,
      enableVirtualization: false,
      isServerSidePagination: false,
      paginationEnabled: true,
      isRowExpansionEnabled: true,
      enableFilterSidePanel: true,
    });

    expect(rowModels).toEqual({
      getCoreRowModel: 'coreRowModel',
      getSortedRowModel: 'sortedRowModel',
      getFilteredRowModel: 'filteredRowModel',
      getPaginationRowModel: 'paginationRowModel',
      getExpandedRowModel: 'expandedRowModel',
      getFacetedUniqueValues: 'facetedUniqueValues',
    });

    const search = vi.fn();
    const sort = vi.fn();
    const paginate = vi.fn();
    const setColumnVisibility = vi.fn();
    const setColumnOrder = vi.fn();
    const setColumnFilters = vi.fn();
    const setRowSelection = vi.fn();
    const setExpanded = vi.fn();

    expect(
      getTanstackTableHandlers({
        handleSearchChange: search,
        handleSortingChange: sort,
        enableVirtualization: false,
        handlePaginationChange: paginate,
        setColumnVisibility,
        setColumnOrder,
        handleColumnFiltersChange: setColumnFilters,
        selection: {
          enableSelection: true,
          isCheckbox: true,
          setRowSelection,
        },
        isRowExpansionEnabled: true,
        expansion: { setExpanded },
      })
    ).toEqual({
      onGlobalFilterChange: search,
      onSortingChange: sort,
      onPaginationChange: paginate,
      onColumnVisibilityChange: setColumnVisibility,
      onColumnOrderChange: setColumnOrder,
      onColumnFiltersChange: setColumnFilters,
      onRowSelectionChange: setRowSelection,
      enableRowSelection: true,
      enableMultiRowSelection: true,
      onExpandedChange: setExpanded,
      enableExpanding: true,
    });

    expect(
      getTanstackTableManualOptions({
        manualPagination: true,
        isServerSideSorting: true,
        isServerSideFiltering: false,
        isServerSideSearch: true,
        isServerSidePagination: true,
        pagination: { pageCount: 9, rowCount: 123 },
      })
    ).toEqual({
      manualPagination: true,
      manualSorting: true,
      manualFiltering: true,
      pageCount: 9,
      rowCount: 123,
      enableSortingRemoval: true,
      sortDescFirst: false,
    });

    expect(
      getTanstackTableInitialState({
        enableStickyColumns: true,
        columnPinning: { right: ['overflow-menu'] },
      })
    ).toEqual({
      columnPinning: { left: [], right: ['overflow-menu'] },
    });

    const onDataChange = vi.fn();
    const meta = getEditableTableMeta({
      enableEditableCells: true,
      onDataChange,
    });

    meta.updateData(1, 'name', 'updated');

    const updater = onDataChange.mock.calls[0][0];
    expect(updater([{ name: 'row-0' }, { name: 'row-1', age: 30 }])).toEqual([
      { name: 'row-0' },
      { name: 'updated', age: 30 },
    ]);
  });
});
