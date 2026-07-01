/* eslint-disable custom/hooks-first */
import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
} from 'react';
import { useReactTable } from '@tanstack/react-table';
import { DataTable } from '@carbon/react';
import { useFilterSidePanel } from './components/filterPanel/hooks/useFilterSidePanel.js';
import useFilterSidePanelWidth from './components/filterPanel/hooks/useFilterSidePanelWidth.js';
import {
  ColumnCustomizationPanel,
  CustomTableSkeleton,
  FilterSidePanel,
  FilterTagsSummary,
  TableToolbar,
  PaginationSection,
} from './components/index.js';
import {
  VirtualizedTableHead,
  StandardTableBody,
  VirtualizedTableBody,
} from './components/virtualizedTableSections.jsx';
import { LabelsProvider } from './contexts/labelsContext.jsx';
import { useColumnCustomization } from './hooks/useColumnCustomization.js';
import { useColumnSettingsPersistence } from './hooks/useColumnSettingsPersistence.js';
import { useEditableCell } from './hooks/useEditableCell.js';
import useMenuCloseOnScroll from './hooks/useMenuCloseOnScroll.js';
import { usePaginationFeature } from './hooks/usePaginationFeature.js';
import { useRowExpansion } from './hooks/useRowExpansion.js';
import { useSortingFeature } from './hooks/useSortingFeature.js';
import useTableHeight from './hooks/useTableHeight.js';
import { useTableSearch } from './hooks/useTableSearch.js';
import { useTableSelection } from './hooks/useTableSelection.js';
import { useTableVirtualization } from './hooks/useTableVirtualization.js';
import {
  getTanstackTableFeatures,
  getSelectionFeatureConfig,
  getEditingFeatureConfig,
  getSideFilterPanelFeatureConfig,
  getSearchFeatureConfig,
  getColumnSettingsFeatureConfig,
  getTableModeFlags,
  getToolbarFeatureFlags,
  getStickyColumnConfig,
  getEmptyStateConfig,
} from './hooks/useTanstackTableFeatures.js';
import {
  getTanstackTableState,
  getTanstackTableRowModels,
  getTanstackTableHandlers,
  getTanstackTableManualOptions,
  getTanstackTableInitialState,
  getEditableTableMeta,
} from './hooks/useTanstackTableOptions.js';
import {
  getTanstackToolbarProps,
  getTanstackFilterPanelProps,
  getTanstackTableContentStyle,
  getTanstackFilterTagsProps,
  getTanstackTableProps,
  getVirtualizedTableHeadProps,
  getVirtualizedTableBodyProps,
  getStandardTableBodyProps,
  getColumnCustomizationPanelProps,
  getPaginationSectionFeature,
  getSkeletonProps,
} from './hooks/useTanstackTableRenderProps.js';
import styles from './tanstackTable.module.scss';
import {
  addSelectionColumn,
  addExpandColumn,
  enhanceColumnsWithSmartFiltering,
} from './utils/columnHelpers.jsx';

const { Table, TableContainer } = DataTable;

// NOTE: Type definitions for JSDoc IntelliSense support
/**
 * @typedef {import('./tanstackTable.js').TanstackTableProps} TanstackTableProps
 * @typedef {import('./tanstackTable.js').TableFeatures} TableFeatures
 * @typedef {import('./tanstackTable.js').PaginationFeature} PaginationFeature
 * @typedef {import('./tanstackTable.js').SelectionFeature} SelectionFeature
 * @typedef {import('./tanstackTable.js').SortingFeature} SortingFeature
 * @typedef {import('./tanstackTable.js').SearchFeature} SearchFeature
 * @typedef {import('./tanstackTable.js').VirtualizationFeature} VirtualizationFeature
 * @typedef {import('./tanstackTable.js').ExpansionFeature} ExpansionFeature
 * @typedef {import('./tanstackTable.js').EditingFeature} EditingFeature
 * @typedef {import('./tanstackTable.js').ColumnPinningFeature} ColumnPinningFeature
 * @typedef {import('./tanstackTable.js').ColumnSettingsFeature} ColumnSettingsFeature
 * @typedef {import('./tanstackTable.js').SideFilterPanelFeature} SideFilterPanelFeature
 */

/**
 * TanstackTable - A feature-rich data table component built on TanStack Table
 *
 * @param {TanstackTableProps} props - Component props
 * @returns {React.ReactElement}
 *
 * @example
 * // Basic usage with selection and pagination
 * <TanstackTable
 *   data={users}
 *   columns={columns}
 *   features={{
 *     selection: {
 *       type: 'checkbox',
 *       onChange: (selectedRows) => console.log(selectedRows),
 *       batchActions: [
 *         { label: 'Delete', icon: TrashIcon, onClick: (rows) => deleteRows(rows) }
 *       ]
 *     },
 *     pagination: { pageSize: 20, pageSizeOptions: [10, 20, 50] },
 *     sorting: { onChange: (sorting) => console.log(sorting) }
 *   }}
 * />
 */
const TanstackTable = ({
  data = [],
  columns = [],
  isLoading = false,
  toolbar = null,
  features = null,
  emptyState = {
    title: 'No data available',
    subtitle: 'Try adjusting your filters',
    render: null,
  },
  height = null,
  tableSize = 'md',
  useZebraStyles = false,
  labels = {},
}) => {
  const tableId = useId();
  const [columnFilters, setColumnFilters] = useState([]);

  const {
    pagination,
    sorting: sortingFeature,
    search: searchFeature,
    virtualization,
    columnPinning,
    columnSettings,
    selection: selectionFeature,
    editing: editingFeature,
    expansion: expansionFeature,
    sideFilterPanel: sideFilterPanelFeature,
  } = getTanstackTableFeatures(features);

  const {
    type: selectionType,
    batchActions,
    onChange: selectionOnChange,
  } = getSelectionFeatureConfig(selectionFeature);

  const { enabled: enableEditableCells, onDataChange } =
    getEditingFeatureConfig(editingFeature);

  const enableVirtualization = !!virtualization;

  const {
    hasCustomConfig: hasCustomSideFilterConfig,
    width: sideFilterWidth,
    onAdvancedFilterClick,
    onApply: sideFilterOnApply,
    onReset: sideFilterOnReset,
    customFilters,
  } = getSideFilterPanelFeatureConfig(sideFilterPanelFeature);

  // Ref for table container (used for editable cells)
  const tableContainerRef = useRef(null);

  // Use custom hook for dynamic height management
  const { wrapperRef, skeletonRef } = useTableHeight(height, data.length);

  // Use editable cell hook for keyboard navigation
  const editableCell = useEditableCell(tableContainerRef);

  // Close overflow menus on scroll
  useMenuCloseOnScroll(tableContainerRef);

  const sortingState = useSortingFeature(sortingFeature);
  const { sorting, handleSortingChange, isServerSideSorting } = sortingState;

  const { onChange: searchOnChange, debounceDelay: searchDebounceDelay } =
    getSearchFeatureConfig(searchFeature);

  const {
    isServerSideSearch,
    isServerSidePagination,
    isServerSideFiltering,
    isServerSideTable,
  } = getTableModeFlags({
    searchOnChange,
    sortingServerSide: isServerSideSorting,
    paginationOnChange: pagination?.onChange,
    hasCustomSideFilterConfig,
  });

  const {
    visibility: controlledColumnVisibility,
    order: controlledColumnOrder,
    onVisibilityChange: onColumnVisibilityChange,
    onOrderChange: onColumnOrderChange,
    localStorageKey,
  } = getColumnSettingsFeatureConfig(columnSettings);

  // Use persistence hook for column settings (handles both localStorage and controlled modes)
  const columnSettingsPersistence = useColumnSettingsPersistence({
    localStorageKey,
    isServerSideTable,
    controlledVisibility: controlledColumnVisibility,
    controlledOrder: controlledColumnOrder,
    onVisibilityChange: onColumnVisibilityChange,
    onOrderChange: onColumnOrderChange,
  });

  // Extract visibility and order from persistence hook
  const columnVisibility = columnSettingsPersistence.visibility;
  const columnOrder = columnSettingsPersistence.order;
  const setColumnVisibility = columnSettingsPersistence.setVisibility;
  const setColumnOrder = columnSettingsPersistence.setOrder;

  // If expansion feature exists, enable row expansion
  const isRowExpansionEnabled = !!expansionFeature;

  const { enableStickyColumns } = getStickyColumnConfig(columnPinning);

  const { enableFilterSidePanel, enableCustomizeColumn } =
    getToolbarFeatureFlags(toolbar);

  const {
    title: emptyStateTitle,
    subtitle: emptyStateSubtitle,
    render: emptyStateRender,
  } = getEmptyStateConfig(emptyState);

  // Add selection column and enhance with smart filtering
  const tableColumns = useMemo(() => {
    // First enhance columns with smart filtering for formatted cells
    const enhancedColumns = enhanceColumnsWithSmartFiltering(columns);
    // Then add selection column if needed
    return addSelectionColumn(enhancedColumns, selectionType, tableId);
  }, [columns, selectionType, tableId]);

  // Use consolidated search hook with debouncing and formatted value search
  const {
    globalFilter,
    immediateSearchValue,
    handleSearchChange,
    globalFilterFn,
  } = useTableSearch({
    onSearchChange: searchOnChange,
    debounceDelay: searchDebounceDelay,
    columns: tableColumns,
  });

  // Handle column filter changes
  const handleColumnFiltersChange = useCallback((updater) => {
    setColumnFilters(updater);
  }, []);

  // Handle removing a single filter tag
  const handleRemoveFilter = useCallback((columnId, value, isArray) => {
    setColumnFilters((prev) => {
      return prev
        .map((filter) => {
          if (filter.id === columnId) {
            if (isArray && Array.isArray(filter.value)) {
              // Remove specific value from array
              const newValue = filter.value.filter((v) => v !== value);
              return newValue.length > 0
                ? { ...filter, value: newValue }
                : null;
            } else {
              // Remove entire filter for non-array values
              return null;
            }
          }
          return filter;
        })
        .filter(Boolean);
    });
  }, []);

  // Handle clearing all filters
  const handleClearAllFilters = useCallback(() => {
    setColumnFilters([]);
  }, []);

  const paginationFeature = usePaginationFeature({
    pagination,
    enableVirtualization,
    dataLength: data.length,
    isServerSidePagination,
  });

  const tableRef = useRef(null);

  const selection = useTableSelection(
    tableRef,
    selectionType,
    selectionOnChange
  );

  // Use row expansion hook (handles expansion logic)
  const expansion = useRowExpansion(
    tableRef,
    expansionFeature?.onExpandedChange
  );

  // Add expand column to table columns if row expansion is enabled
  const finalTableColumns = useMemo(() => {
    if (isRowExpansionEnabled) {
      const expandPosition = expansionFeature?.expandColumnPosition || 'first';
      const hasSelection = !!selectionType;
      return addExpandColumn(
        tableColumns,
        expansion,
        expandPosition,
        hasSelection
      );
    }
    return tableColumns;
  }, [
    tableColumns,
    isRowExpansionEnabled,
    expansion,
    expansionFeature?.expandColumnPosition,
    selectionType,
  ]);

  const tableState = getTanstackTableState({
    globalFilter,
    sorting,
    enableVirtualization,
    paginationState: paginationFeature.paginationState,
    columnVisibility,
    columnOrder,
    columnFilters,
    selection,
    isRowExpansionEnabled,
    expansion,
    enableStickyColumns,
    columnPinning,
  });

  const tableHandlers = getTanstackTableHandlers({
    handleSearchChange,
    handleSortingChange,
    enableVirtualization,
    handlePaginationChange: paginationFeature.handlePaginationChange,
    setColumnVisibility,
    setColumnOrder,
    handleColumnFiltersChange,
    selection,
    isRowExpansionEnabled,
    expansion,
  });

  const tableRowModels = getTanstackTableRowModels({
    isServerSideSorting,
    isServerSideFiltering,
    isServerSideSearch,
    enableVirtualization,
    isServerSidePagination,
    paginationEnabled: paginationFeature.enabled,
    isRowExpansionEnabled,
    enableFilterSidePanel,
  });

  const tableManualOptions = getTanstackTableManualOptions({
    manualPagination: paginationFeature.tableOptions.manualPagination,
    isServerSideSorting,
    isServerSideFiltering,
    isServerSideSearch,
    isServerSidePagination,
    pagination,
  });

  const tableInitialState = getTanstackTableInitialState({
    enableStickyColumns,
    columnPinning,
  });

  const tableMeta = getEditableTableMeta({
    enableEditableCells,
    onDataChange,
  });

  // Initialize table with all controlled feature state in config
  const table = useReactTable({
    data,
    columns: finalTableColumns,
    /* NOTE: Override TanStack's default column size of 150 with undefined so that
    columns without an explicit size do not get forced to 150px in the DOM.
    Our rendering code checks column.columnDef.size !== undefined to decide
    whether to apply inline width/minWidth styles. 
    */
    defaultColumn: { size: undefined, minSize: undefined, maxSize: undefined },
    state: tableState,
    ...tableHandlers,
    globalFilterFn: isServerSideSearch ? undefined : globalFilterFn,
    ...tableRowModels,
    ...tableManualOptions,
    ...(tableInitialState && {
      initialState: tableInitialState,
    }),
    meta: tableMeta,
  });

  tableRef.current = table;

  // Use column customization hook (only if enabled)
  const customization = useColumnCustomization(
    enableCustomizeColumn ? table : null,
    columnSettings?.onOrderChange,
    columnSettings?.onVisibilityChange
  );

  // Use filter panel hook (only if enabled) - provides filter state management and custom filter functions
  const filterPanel = useFilterSidePanel(
    enableFilterSidePanel ? table : null,
    null
  );

  // Configure filter functions for columns with array-based filters (OR logic)
  // Only apply in client-side mode when developer is not providing custom side filter handling
  useMemo(() => {
    if (
      enableFilterSidePanel &&
      filterPanel.arrayFilterFn &&
      !isServerSideFiltering &&
      !hasCustomSideFilterConfig
    ) {
      tableColumns.forEach((col) => {
        const filterVariant = col.meta?.filterVariant;
        // Apply OR logic for filter types that support multiple selections
        if (filterVariant === 'checkbox' || filterVariant === 'multiselect') {
          col.filterFn = filterPanel.arrayFilterFn;
        }
      });
    }
  }, [
    tableColumns,
    enableFilterSidePanel,
    filterPanel.arrayFilterFn,
    isServerSideFiltering,
    hasCustomSideFilterConfig,
  ]);
  // Use custom hook to measure filter side panel width
  const { ref: sidePanelRef, width: sidePanelWidth } = useFilterSidePanelWidth(
    filterPanel.showFilterPanel,
    '[data-filter-panel]'
  );

  const virtualizationState = useTableVirtualization({
    table,
    tableContainerRef,
    enabled: enableVirtualization,
    estimateSize: virtualization?.estimateSize ?? 48,
    overscan: virtualization?.overscan ?? 5,
  });

  const bodyRows = virtualizationState.rows;
  const virtualRows = virtualizationState.virtualRows;
  const shouldRenderVirtualizedBody =
    enableVirtualization && virtualizationState.isRendered;

  useEffect(() => {
    if (!shouldRenderVirtualizedBody || !tableContainerRef.current) {
      return;
    }

    const scrollElement = tableContainerRef.current.querySelector(
      '.cds--data-table-content'
    );
    if (!scrollElement) {
      return;
    }

    scrollElement.scrollTop = 0;
    virtualizationState.rowVirtualizer?.measure();
  }, [
    shouldRenderVirtualizedBody,
    virtualizationState.rowVirtualizer,
    table.getState().sorting,
    table.getState().columnFilters,
    table.getState().globalFilter,
  ]);

  const toolbarProps = getTanstackToolbarProps({
    selection,
    selectionType,
    dataLength: data.length,
    table,
    batchActions,
    toolbar,
    handleSearchChange,
    immediateSearchValue,
    filterPanel,
    customization,
  });

  const filterPanelProps = getTanstackFilterPanelProps({
    filterPanel,
    table,
    columnFilters,
    sideFilterWidth,
    tableSize,
    onAdvancedFilterClick,
    customFilters,
    sideFilterOnApply,
    sideFilterOnReset,
  });

  const tableContentStyle = getTanstackTableContentStyle({
    enableFilterSidePanel,
    isFilterPanelOpen: filterPanel.showFilterPanel,
    sidePanelWidth,
  });

  const filterTagsProps = getTanstackFilterTagsProps({
    columnFilters,
    handleRemoveFilter,
    handleClearAllFilters,
    table,
  });

  const carbonTableProps = getTanstackTableProps({
    tableSize,
    useZebraStyles,
    shouldRenderVirtualizedBody,
    table,
    enableEditableCells,
    editableCell,
  });

  const virtualizedHeadProps = getVirtualizedTableHeadProps({
    table,
    shouldRenderVirtualizedBody,
    enableStickyColumns,
  });

  const virtualizedBodyProps = getVirtualizedTableBodyProps({
    bodyRows,
    virtualRows,
    rowVirtualizer: virtualizationState.rowVirtualizer,
    table,
    tableColumns,
    enableStickyColumns,
    enableEditableCells,
    editableCell,
    tableContainerRef,
    emptyStateRender,
    emptyStateTitle,
    emptyStateSubtitle,
    totalSize: virtualizationState.totalSize,
  });

  const standardBodyProps = getStandardTableBodyProps({
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

  const paginationSectionFeature = getPaginationSectionFeature({
    paginationFeature,
    table,
  });

  const columnCustomizationPanelProps = getColumnCustomizationPanelProps({
    customization,
    table,
  });

  const skeletonProps = getSkeletonProps({
    tableSize,
    columns: finalTableColumns,
    initialPageSize: paginationFeature.initialPageSize,
    useZebraStyles,
    showPagination: paginationFeature.enabled,
    showToolbar: !!toolbar,
    height,
  });

  if (isLoading) {
    return (
      <div ref={skeletonRef}>
        <CustomTableSkeleton {...skeletonProps} />
      </div>
    );
  }

  return (
    <LabelsProvider labels={labels}>
      <div className={styles.tableWrapper} ref={wrapperRef}>
        <TableContainer>
          <TableToolbar {...toolbarProps} />

          {/* Filter Panel */}
          <div ref={sidePanelRef}>
            {enableFilterSidePanel && <FilterSidePanel {...filterPanelProps} />}
          </div>

          {/* Table */}
          <div
            ref={tableContainerRef}
            className={styles.tableContentWrapper}
            style={tableContentStyle}>
            {/* Filter Tags Summary */}
            {enableFilterSidePanel && (
              <FilterTagsSummary {...filterTagsProps} />
            )}

            <Table {...carbonTableProps}>
              <VirtualizedTableHead {...virtualizedHeadProps} />

              {shouldRenderVirtualizedBody ? (
                <VirtualizedTableBody {...virtualizedBodyProps} />
              ) : (
                <StandardTableBody {...standardBodyProps} />
              )}
            </Table>

            {/* Pagination */}
            <PaginationSection
              feature={paginationSectionFeature}
              table={table}
            />
          </div>
        </TableContainer>

        {/* Column Customization Panel */}
        {enableCustomizeColumn && (
          <ColumnCustomizationPanel {...columnCustomizationPanelProps} />
        )}
      </div>
    </LabelsProvider>
  );
};

export default TanstackTable;
