import editableStyles from '../components/scss/editableCell.module.scss';
import styles from '../tanstackTable.module.scss';

export const getTanstackToolbarProps = ({
  selection,
  selectionType,
  dataLength,
  table,
  batchActions,
  toolbar,
  handleSearchChange,
  immediateSearchValue,
  filterPanel,
  customization,
}) => ({
  enableSelection: selection.enableSelection,
  selectionType,
  shouldShowBatchActions: selection.shouldShowBatchActions,
  selectedCount: selection.selectedCount,
  totalCount: dataLength,
  onCancelSelection: () => table.resetRowSelection(),
  onSelectAll: () => table.toggleAllRowsSelected(true),
  batchActions,
  table,
  toolbar,
  onSearchChange: handleSearchChange,
  searchValue: immediateSearchValue,
  onToggleFilterPanel: filterPanel.toggleFilterPanel,
  onOpenCustomizePanel: customization.openCustomizePanel,
});

export const getTanstackFilterPanelProps = ({
  filterPanel,
  table,
  columnFilters,
  sideFilterWidth,
  tableSize,
  onAdvancedFilterClick,
  customFilters,
  sideFilterOnApply,
  sideFilterOnReset,
}) => ({
  open: filterPanel.showFilterPanel,
  onClose: filterPanel.closeFilterPanel,
  columns: table.getAllLeafColumns(),
  columnFilters,
  onApplyFilters: filterPanel.applyFilters,
  onClearFilters: filterPanel.clearFilters,
  width: sideFilterWidth,
  size: tableSize,
  onAdvancedFilterClick,
  customFilterConfig: customFilters?.config,
  onCustomFiltersApply: customFilters?.onApply,
  onCustomFiltersReset: customFilters?.onReset,
  onSidePanelApply: sideFilterOnApply,
  onSidePanelReset: sideFilterOnReset,
});

export const getTanstackTableContentStyle = ({
  enableFilterSidePanel,
  isFilterPanelOpen,
  sidePanelWidth,
}) => ({
  marginLeft:
    enableFilterSidePanel && isFilterPanelOpen ? `${sidePanelWidth}px` : '0',
  transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
});

export const getTanstackFilterTagsProps = ({
  columnFilters,
  handleRemoveFilter,
  handleClearAllFilters,
  table,
}) => ({
  columnFilters,
  onRemoveFilter: handleRemoveFilter,
  onClearAll: handleClearAllFilters,
  table,
});

export const getTanstackTableProps = ({
  tableSize,
  useZebraStyles,
  shouldRenderVirtualizedBody,
  table,
  enableEditableCells,
  editableCell,
}) => {
  // NOTE: Build className based on conditions
  const classNames = [
    shouldRenderVirtualizedBody && styles.virtualTbl,
    enableEditableCells && editableStyles.editableTbl,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    size: tableSize,
    useZebraStyles,
    'aria-label': 'data table',
    className: classNames || undefined,
    style: shouldRenderVirtualizedBody
      ? {
          // minWidth = sum of all column sizes (floor for horizontal scroll).
          // width: 100% = fill container so unsized columns with flex:1 can grow.
          minWidth: table.getCenterTotalSize(),
          width: '100%',
        }
      : undefined,
    ...(enableEditableCells && {
      onClick: editableCell.handleFocusChange,
      onKeyDown: !editableCell.editingId
        ? editableCell.handleKeyDownActiveCell
        : undefined,
      role: 'grid', // added CSS based on this in editableCell.module.scss
    }),
  };
};

export const getVirtualizedTableHeadProps = ({
  table,
  shouldRenderVirtualizedBody,
  enableStickyColumns,
}) => ({
  table,
  shouldRenderVirtualizedBody,
  enableStickyColumns,
});

export const getVirtualizedTableBodyProps = ({
  bodyRows,
  virtualRows,
  rowVirtualizer,
  table,
  tableColumns,
  enableStickyColumns,
  enableEditableCells,
  editableCell,
  tableContainerRef,
  emptyStateRender,
  emptyStateTitle,
  emptyStateSubtitle,
  totalSize,
}) => ({
  bodyRows,
  virtualRows,
  rowVirtualizer,
  table,
  tableColumns,
  enableStickyColumns,
  enableEditableCells,
  editableCell,
  tableContainerRef,
  emptyStateRender,
  emptyStateTitle,
  emptyStateSubtitle,
  totalSize,
});

export const getStandardTableBodyProps = ({
  table,
  tableColumns,
  enableStickyColumns,
  enableEditableCells,
  editableCell,
  tableContainerRef,
  isRowExpansionEnabled,
  expansion,
  expansionFeature,
  finalTableColumns,
  emptyStateRender,
  emptyStateTitle,
  emptyStateSubtitle,
}) => ({
  table,
  tableColumns,
  enableStickyColumns,
  enableEditableCells,
  editableCell,
  tableContainerRef,
  isRowExpansionEnabled,
  expansion,
  expansionFeature,
  finalTableColumns,
  emptyStateRender,
  emptyStateTitle,
  emptyStateSubtitle,
});

export const getColumnCustomizationPanelProps = ({ customization, table }) => ({
  open: customization.showCustomizePanel,
  columns: table.getAllLeafColumns(),
  columnOrder: customization.tempColumnOrder,
  columnVisibility: customization.tempColumnVisibility,
  onClose: customization.closeCustomizePanel,
  onApply: customization.applyCustomization,
  onToggleVisibility: customization.toggleColumnVisibility,
  onReorder: customization.reorderColumns,
});

export const getPaginationSectionFeature = ({ paginationFeature, table }) => ({
  ...paginationFeature,
  totalItems: table.getFilteredRowModel().rows.length,
});

export const getSkeletonProps = ({
  tableSize,
  columns,
  initialPageSize,
  useZebraStyles,
  showPagination,
  showToolbar,
  height,
}) => {
  return {
    columns,
    rowCount: initialPageSize,
    tableSize,
    useZebraStyles,
    showPagination,
    showToolbar,
    height,
  };
};
