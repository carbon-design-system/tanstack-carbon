import React from 'react';

import {
  ExpandedState,
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { DataTable, Button, Checkbox } from '@carbon/react';
import {
  ChevronRight,
  TrashCan,
  Add,
  Save,
  Download,
} from '@carbon/react/icons';

const {
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableBatchActions,
  TableBatchAction,
  TableToolbarContent,
  TableToolbarAction,
  TableToolbarMenu,
} = DataTable;

import { makeData, Resource } from './makeData';

export const SelectableNestedRows = () => {
  const [data] = React.useState(() => makeData(10, 3, 3, 2));

  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // expansion indicator: state variables
  const [hoveredRowIds, setHoveredRowIds] = React.useState([]);
  const [expIndPos, setExpIndPos] = React.useState(0);

  // expansion indicator: method to get row ids of all sub-rows
  const getAllSubRowIds = (row) => {
    const ids = [];

    const collectIds = (row) => {
      if (row.subRows && row.subRows.length > 0) {
        for (const subRow of row.subRows) {
          ids.push(subRow.id);
          collectIds(subRow); // Recursive for deep nesting
        }
      }
    };

    collectIds(row);

    return ids;
  };

  // for expansion indicator
  const onRowHover = (row) => {
    if (row.getCanExpand && row.getIsExpanded()) {
      const indicatorPos = row.depth * 2 + 1;
      setExpIndPos(indicatorPos);
      setHoveredRowIds(getAllSubRowIds(row));
    } else {
      setHoveredRowIds([]);
    }
  };

  const columnHelper = createColumnHelper<Resource>();

  const columns = [
    columnHelper.accessor((row) => row.name, {
      id: 'name',
      header: ({ table }) => (
        <div className="flex">
          <Button
            {...{
              onClick: table.getToggleAllRowsExpandedHandler(),
            }}
            className="row-expander"
            kind="ghost"
            size="sm">
            {table.getIsAllRowsExpanded() ? (
              <ChevronRight className="row-expanded-icon" />
            ) : (
              <ChevronRight />
            )}
          </Button>
          {/* TableSelectAll throws DOM nesting error, using Checkbox instead to avoid this */}
          <Checkbox
            {...{
              className: 'row-selector',
              checked: table.getIsAllPageRowsSelected(),
              indeterminate: table.getIsSomePageRowsSelected(),
              onChange: () => {
                const isIndeterminate = table.getIsSomeRowsSelected();
                if (!isIndeterminate) {
                  table.toggleAllPageRowsSelected(true);
                }
                if (table.getIsAllPageRowsSelected()) {
                  table.toggleAllRowsSelected(false);
                  return;
                }
                if (isIndeterminate) {
                  table.toggleAllPageRowsSelected(true);
                  return;
                }
              },
              id: 'batch-checkbox',
              labelText: 'header checkbox',
              hideLabel: true,
            }}
          />
          <span className="row-content">Name</span>
        </div>
      ),
      cell: ({ row, getValue }) => (
        <>
          <div
            style={{
              // Since rows are flattened by default,
              // we can use the row.depth property
              // and paddingLeft to visually indicate the depth
              // of the row
              paddingLeft: `${row.depth * 2 + (row.getCanExpand() ? 0 : 2)}rem`,
            }}
            className="flex">
            {row.getCanExpand() ? (
              <Button
                {...{
                  onClick: row.getToggleExpandedHandler(),
                  style: { cursor: 'pointer' },
                }}
                className="row-expander"
                kind="ghost"
                size="sm">
                {row.getIsExpanded() ? (
                  <ChevronRight className="row-expanded-icon" />
                ) : (
                  <ChevronRight />
                )}
              </Button>
            ) : null}
            <Checkbox
              {...{
                className: 'row-selector',
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
                id: `batch-checkbox__${row.id}`,
                labelText: 'row checkbox',
                hideLabel: true,
              }}
            />
            <span className="row-content">{getValue<boolean>()}</span>
            <div
              className="border-line"
              style={{
                width: `${
                  row.depth * 2 + (row.depth || row.getIsExpanded() ? 3 : 0)
                }rem`,
              }}></div>
            <div
              className="expansion-indicator"
              style={{
                left: `${expIndPos}rem`,
              }}></div>
          </div>
        </>
      ),
    }),
    columnHelper.accessor('rule', {
      header: 'Rule',
    }),
    columnHelper.accessor('status', {
      header: 'Status',
    }),
    columnHelper.accessor('other', {
      header: 'Other',
    }),
    columnHelper.accessor('example', {
      header: 'Example',
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    getSubRows: (row) => row.subRows,
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: (row) => row.original.status !== 'disabled', // conditionally disable rows
    onRowSelectionChange: setRowSelection,
  });

  const shouldShowBatchActions = Object.keys(rowSelection).length > 0;

  return (
    <TableContainer
      title="Selectable nested rows"
      className="tanstack-example"
      style={{
        width: table.getCenterTotalSize(),
      }}>
      <TableToolbar aria-label={'Table toolbar'}>
        <TableBatchActions
          shouldShowBatchActions={shouldShowBatchActions}
          totalSelected={Object.keys(rowSelection).length ?? 0}
          onCancel={() => table.resetRowSelection()}
          onSelectAll={() => {
            table.toggleAllRowsSelected(true);
          }}
          totalCount={table.getRowModel().flatRows.length}>
          <TableBatchAction
            tabIndex={shouldShowBatchActions ? 0 : -1}
            renderIcon={TrashCan}
            onClick={() => table.resetRowSelection()}>
            Delete
          </TableBatchAction>
          <TableBatchAction
            hasIconOnly
            iconDescription="Add"
            tabIndex={shouldShowBatchActions ? 0 : -1}
            renderIcon={Add}
            onClick={() => table.resetRowSelection()}>
            Add
          </TableBatchAction>
          <TableBatchAction
            hasIconOnly
            iconDescription="Save"
            tabIndex={shouldShowBatchActions ? 0 : -1}
            renderIcon={Save}
            onClick={() => table.resetRowSelection()}>
            Save
          </TableBatchAction>
          <TableBatchAction
            tabIndex={shouldShowBatchActions ? 0 : -1}
            renderIcon={Download}
            onClick={() => table.resetRowSelection()}>
            Download
          </TableBatchAction>
        </TableBatchActions>
        <TableToolbarContent aria-hidden={shouldShowBatchActions}>
          <TableToolbarMenu tabIndex={shouldShowBatchActions ? -1 : 0}>
            <TableToolbarAction onClick={() => alert('Alert 1')}>
              Action 1
            </TableToolbarAction>
            <TableToolbarAction onClick={() => alert('Alert 2')}>
              Action 2
            </TableToolbarAction>
            <TableToolbarAction onClick={() => alert('Alert 3')}>
              Action 3
            </TableToolbarAction>
          </TableToolbarMenu>
          <Button
            tabIndex={shouldShowBatchActions ? -1 : 0}
            onClick={() => {}}
            kind="primary">
            Add new
          </Button>
        </TableToolbarContent>
      </TableToolbar>
      <Table size="lg" useZebraStyles={false} aria-label="sample table">
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHeader key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHeader>
                );
              })}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            return (
              <TableRow
                key={row.id}
                onMouseEnter={() => onRowHover(row)}
                onMouseLeave={() => setHoveredRowIds([])}
                className={hoveredRowIds.includes(row.id) ? 'row-hovered' : ''}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
