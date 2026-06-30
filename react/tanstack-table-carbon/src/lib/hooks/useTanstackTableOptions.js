import {
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  getFacetedUniqueValues,
} from '@tanstack/react-table';
import { processColumnPinning } from '../utils/stickyColumnHelpers';

export const getTanstackTableState = ({
  globalFilter,
  sorting,
  enableVirtualization,
  paginationState,
  columnVisibility,
  columnOrder,
  columnFilters,
  selection,
  isRowExpansionEnabled,
  expansion,
  enableStickyColumns,
  columnPinning,
}) => ({
  globalFilter,
  sorting,
  ...(!enableVirtualization && {
    pagination: paginationState,
  }),
  columnVisibility,
  columnOrder,
  columnFilters,
  ...(selection.enableSelection && {
    rowSelection: selection.rowSelection,
  }),
  ...(isRowExpansionEnabled && {
    expanded: expansion.expanded,
  }),
  ...(enableStickyColumns &&
    columnPinning && {
      columnPinning: processColumnPinning(columnPinning),
    }),
});

export const getTanstackTableRowModels = ({
  isServerSideSorting,
  isServerSideFiltering,
  isServerSideSearch,
  enableVirtualization,
  isServerSidePagination,
  paginationEnabled,
  isRowExpansionEnabled,
  enableFilterSidePanel,
}) => ({
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: isServerSideSorting ? undefined : getSortedRowModel(),
  getFilteredRowModel:
    isServerSideFiltering || isServerSideSearch ? undefined : getFilteredRowModel(),
  getPaginationRowModel:
    enableVirtualization || isServerSidePagination || !paginationEnabled
      ? undefined
      : getPaginationRowModel(),
  getExpandedRowModel: isRowExpansionEnabled ? getExpandedRowModel() : undefined,
  getFacetedUniqueValues: enableFilterSidePanel ? getFacetedUniqueValues() : undefined,
});

export const getTanstackTableHandlers = ({
  handleSearchChange,
  handleSortingChange,
  enableVirtualization,
  handlePaginationChange,
  setColumnVisibility,
  setColumnOrder,
  handleColumnFiltersChange,
  selection,
  isRowExpansionEnabled,
  expansion,
}) => ({
  onGlobalFilterChange: handleSearchChange,
  onSortingChange: handleSortingChange,
  onPaginationChange: enableVirtualization ? undefined : handlePaginationChange,
  onColumnVisibilityChange: setColumnVisibility,
  onColumnOrderChange: setColumnOrder,
  onColumnFiltersChange: handleColumnFiltersChange,
  ...(selection.enableSelection && {
    onRowSelectionChange: selection.setRowSelection,
    enableRowSelection: true,
    enableMultiRowSelection: selection.isCheckbox,
  }),
  ...(isRowExpansionEnabled && {
    onExpandedChange: expansion.setExpanded,
    enableExpanding: true,
  }),
});

export const getTanstackTableManualOptions = ({
  manualPagination,
  isServerSideSorting,
  isServerSideFiltering,
  isServerSideSearch,
  isServerSidePagination,
  pagination,
}) => ({
  manualPagination,
  manualSorting: isServerSideSorting,
  manualFiltering: isServerSideFiltering || isServerSideSearch,
  pageCount: isServerSidePagination ? (pagination?.pageCount ?? -1) : undefined,
  rowCount: isServerSidePagination ? (pagination?.rowCount ?? 0) : undefined,
  enableSortingRemoval: true,
  sortDescFirst: false,
});

export const getTanstackTableInitialState = ({ enableStickyColumns, columnPinning }) => {
  if (!enableStickyColumns || !columnPinning) {
    return undefined;
  }

  return {
    columnPinning: processColumnPinning(columnPinning),
  };
};

export const getEditableTableMeta = ({ enableEditableCells, onDataChange }) => {
  if (!enableEditableCells) {
    return undefined;
  }

  return {
    updateData: (rowIndex, columnId, value) => {
      if (onDataChange) {
        onDataChange((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          })
        );
      }
    },
  };
};
