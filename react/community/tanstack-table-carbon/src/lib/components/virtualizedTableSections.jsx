import React from 'react';
import { flexRender } from '@tanstack/react-table';
import { DataTable } from '@carbon/react';
import { getCommonPinningStyles } from '../utils/stickyColumnHelpers';
import EditableCell from './editableCell';
import EditableDateCell from './editableDateCell';
import EditableSelectCell from './editableSelectCell';
import NoDataEmptyState from './noDataEmptyState';
import styles from './scss/virtualizedTableSections.module.scss';

const { TableBody, TableCell, TableHead, TableHeader, TableRow } = DataTable;

const getEditableCellComponent = (editableType) => {
  if (editableType === 'select') {
    return EditableSelectCell;
  }
  if (editableType === 'date') {
    return EditableDateCell;
  }
  return EditableCell;
};

const applyCellStyles = (
  element,
  column,
  enableStickyColumns,
  isHeader = false
) => {
  if (!element) {
    return;
  }

  /* 
  NOTE: Only apply explicit width when the column definition has a size set by the developer,
    or when the column is pinned (sticky positioning requires an explicit width).
    Without this guard, TanStack's default size of 150 is applied to every th/td even
    when the developer has not specified any column widths. 
    Columns without an explicit size get flex:1 so they share remaining row width
    equally — this is only relevant in the virtualized (display:flex) row layout.
  */
  if (
    column.columnDef.size !== undefined ||
    (enableStickyColumns && column.getIsPinned())
  ) {
    const width = `${column.getSize()}px`;
    element.style.width = width;
    element.style.minWidth = width;
    element.style.flex = '';
  } else {
    element.style.width = '';
    element.style.minWidth = '';
    element.style.flex = '1';
  }

  if (enableStickyColumns && column.getIsPinned()) {
    Object.assign(element.style, getCommonPinningStyles(column, isHeader));
  }
};

const renderBodyCell = ({
  cell,
  enableStickyColumns,
  enableEditableCells,
  editableCell,
  table,
  tableContainerRef,
}) => {
  const isPinned = cell.column.getIsPinned();
  const cellRef = (element) =>
    applyCellStyles(element, cell.column, enableStickyColumns, false);

  if (enableEditableCells && cell.column.columnDef.meta?.editable) {
    const editableType = cell.column.columnDef.meta?.editableType || 'text';
    const CellComponent = getEditableCellComponent(editableType);

    return (
      <CellComponent
        key={cell.id}
        tableContainerRef={tableContainerRef}
        table={table}
        cell={cell}
        editingId={editableCell.editingId}
        setEditingId={editableCell.setEditingId}
        id={cell.id}
        tabIndex={-1}
        options={cell.column.columnDef.meta?.options}
        style={
          cell.column.columnDef.size !== undefined
            ? {
                width: `${cell.column.getSize()}px`,
                minWidth: `${cell.column.getSize()}px`,
              }
            : undefined
        }>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </CellComponent>
    );
  }

  return (
    <TableCell
      key={cell.id}
      ref={cellRef}
      className={enableStickyColumns && isPinned ? 'stickyCell' : ''}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
};

export const VirtualizedTableHead = ({
  table,
  shouldRenderVirtualizedBody,
  enableStickyColumns,
}) => {
  return (
    <TableHead
      className={
        shouldRenderVirtualizedBody ? styles.virtualizedTableHead : undefined
      }>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow
          key={headerGroup.id}
          className={
            shouldRenderVirtualizedBody
              ? styles.virtualizedHeaderRow
              : undefined
          }>
          {headerGroup.headers.map((header) => {
            const { column } = header;
            const sortState = column.getIsSorted();

            const headerRef = (element) => {
              if (!element) {
                return;
              }
              applyCellStyles(element, column, enableStickyColumns, true);
            };

            return (
              <TableHeader
                key={header.id}
                colSpan={header.colSpan}
                isSortable={column.getCanSort()}
                isSortHeader={!!sortState}
                sortDirection={sortState ? sortState.toUpperCase() : 'NONE'}
                onClick={column.getToggleSortingHandler()}
                ref={headerRef}
                className={
                  shouldRenderVirtualizedBody
                    ? styles.virtualizedTableHeader
                    : undefined
                }
                style={
                  shouldRenderVirtualizedBody
                    ? column.columnDef.size !== undefined
                      ? { width: column.getSize() }
                      : { flex: '1' }
                    : undefined
                }>
                {header.isPlaceholder
                  ? null
                  : flexRender(column.columnDef.header, header.getContext())}
              </TableHeader>
            );
          })}
        </TableRow>
      ))}
    </TableHead>
  );
};

export const StandardTableBody = ({
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
}) => {
  const rows = table.getRowModel().rows;

  const handleParentRowHover = React.useCallback((event, isHovering) => {
    const parentRow = event.currentTarget;
    const expandedRow = parentRow.nextElementSibling;
    if (expandedRow && expandedRow.hasAttribute('data-parent-row-id')) {
      if (isHovering) {
        expandedRow.classList.add(styles.hoveredExpanded);
      } else {
        expandedRow.classList.remove(styles.hoveredExpanded);
      }
    }
  }, []);

  const handleExpandedRowHover = React.useCallback((event, isHovering) => {
    const expandedRow = event.currentTarget;
    const parentRow = expandedRow.previousElementSibling;
    if (parentRow && parentRow.hasAttribute('data-row-id')) {
      if (isHovering) {
        parentRow.classList.add(styles.hoveredParent);
      } else {
        parentRow.classList.remove(styles.hoveredParent);
      }
    }
  }, []);

  return (
    <TableBody>
      {rows.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={tableColumns.length}
            className="emptyCell_tanstackTable">
            <div className="emptyStateDt">
              {emptyStateRender || (
                <NoDataEmptyState
                  title={emptyStateTitle}
                  subtitle={emptyStateSubtitle}
                />
              )}
            </div>
          </TableCell>
        </TableRow>
      ) : (
        rows.map((row) => (
          <React.Fragment key={row.id}>
            <TableRow
              isSelected={row.getIsSelected()}
              className={
                isRowExpansionEnabled && expansion.expanded[row.id]
                  ? styles.expandableRow
                  : ''
              }
              data-row-id={row.id}
              onMouseEnter={
                isRowExpansionEnabled && expansion.expanded[row.id]
                  ? (e) => handleParentRowHover(e, true)
                  : undefined
              }
              onMouseLeave={
                isRowExpansionEnabled && expansion.expanded[row.id]
                  ? (e) => handleParentRowHover(e, false)
                  : undefined
              }>
              {row.getVisibleCells().map((cell) =>
                renderBodyCell({
                  cell,
                  enableStickyColumns,
                  enableEditableCells,
                  editableCell,
                  table,
                  tableContainerRef,
                })
              )}
            </TableRow>
            {isRowExpansionEnabled && expansion.expanded[row.id] && (
              <TableRow
                className={styles.expandedContentRow}
                data-parent-row-id={row.id}
                onMouseEnter={(e) => handleExpandedRowHover(e, true)}
                onMouseLeave={(e) => handleExpandedRowHover(e, false)}>
                <TableCell colSpan={finalTableColumns.length}>
                  {expansionFeature?.renderExpandedRow?.(row.original)}
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))
      )}
    </TableBody>
  );
};

export const VirtualizedTableBody = ({
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
}) => {
  return (
    <TableBody
      className={styles.virtualizedTableBody}
      style={{
        height: `${totalSize}px`,
      }}>
      {bodyRows.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={tableColumns.length}
            className="emptyCell_tanstackTable">
            <div className="emptyStateDt">
              {emptyStateRender || (
                <NoDataEmptyState
                  title={emptyStateTitle}
                  subtitle={emptyStateSubtitle}
                />
              )}
            </div>
          </TableCell>
        </TableRow>
      ) : (
        virtualRows.map((virtualRow) => {
          const row = bodyRows[virtualRow.index];
          if (!row) {
            return null;
          }

          return (
            <TableRow
              key={row.id}
              data-index={virtualRow.index}
              ref={(node) => rowVirtualizer?.measureElement(node)}
              isSelected={row.getIsSelected()}
              className={styles.virtualizedTableRow}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}>
              {row.getVisibleCells().map((cell) =>
                renderBodyCell({
                  cell,
                  enableStickyColumns,
                  enableEditableCells,
                  editableCell,
                  table,
                  tableContainerRef,
                })
              )}
            </TableRow>
          );
        })
      )}
    </TableBody>
  );
};

export default {
  VirtualizedTableHead,
  StandardTableBody,
  VirtualizedTableBody,
};
