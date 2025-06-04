import React, { useRef, useState, useLayoutEffect } from 'react';
import { Checkbox, DataTable, Pagination, Button } from '@carbon/react';
import { TrashCan, Add, Save, Download } from '@carbon/react/icons';
const {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableBatchActions,
  TableBatchAction,
  TableToolbarContent,
  TableToolbarSearch,
  TableToolbarAction,
  TableToolbarMenu,
} = DataTable;

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  FilterFn,
  PaginationState,
  getPaginationRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';

// A TanStack fork of Kent C. Dodds' match-sorter library that provides ranking information
import { rankItem } from '@tanstack/match-sorter-utils';

import { makeData, Resource } from './makeData';
import './example.scss';

// Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

export const BatchActions = () => {
  const columnHelper = createColumnHelper<Resource>();

  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = React.useState({});
  const [data] = useState(makeData(200));
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = [
    {
      id: 'select',
      width: 48,
      header: ({ table }) => (
        // --- Row Selection behavior overview ---
        //   1. "Header Checkbox" selects/deselects only the rows visible on the current page.
        //      Exception: In tables with infinite or virtual scroll, this behavior may differ and is an implementation choice.
        //      In such cases, the checkbox may be configured to select/deselect all rows in the table.
        //   2. "Select All" button in Batch Actions Toolbar always selects all rows in the entire table, regardless of pagination or scroll mode.
        //   3. "Cancel" button in Batch Actions Toolbar always deselects all rows in the entire table.

        // TableSelectAll throws DOM nesting error, using Checkbox instead to avoid this
        <Checkbox
          {...{
            checked: table.getIsAllPageRowsSelected(),
            indeterminate: table.getIsSomePageRowsSelected(),
            onChange: table.getToggleAllPageRowsSelectedHandler(),
            id: 'batch-checkbox',
            labelText: 'header checkbox',
            hideLabel: true,
          }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
            id: `batch-checkbox__${row.id}`,
            labelText: 'row checkbox',
            hideLabel: true,
          }}
        />
      ),
    },
    columnHelper.accessor((row) => row.name, {
      id: 'name',
      cell: (info) => <i>{info.getValue()}</i>,
      header: () => <span>Name</span>,
    }),
    columnHelper.accessor('rule', {
      header: () => 'Rule',
      cell: (info) => info.renderValue(),
    }),
    columnHelper.accessor('status', {
      header: () => <span>Status</span>,
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
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination,
      rowSelection,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'fuzzy', //apply fuzzy filter to the global filter (most common use case for fuzzy filter)
    filterFns: {
      fuzzy: fuzzyFilter, //define as a filter function that can be used in column definitions
    },
    // enableRowSelection: true, //enable row selection for all rows
    enableRowSelection: (row) => row.original.status !== 'disabled', // conditionally disable rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection
    onRowSelectionChange: setRowSelection,
  });

  const tableWrap = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    const tableWrapElement = tableWrap.current;
    if (tableWrapElement) {
      const tableElement = tableWrapElement.querySelector('table');
      tableElement.style.width = `${table.getCenterTotalSize()}px`;
    }
  }, [table]);

  const shouldShowBatchActions = Object.keys(rowSelection).length > 0;

  return (
    <TableContainer
      title="Batch actions, global filter"
      className="basic-table tanstack-example"
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
          totalCount={data?.length}>
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
            Delete
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
          <TableToolbarSearch
            tabIndex={shouldShowBatchActions ? -1 : 0}
            defaultValue={globalFilter ?? ''}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setGlobalFilter(event.target.value)
            }
            placeholder="Search all columns..."
          />
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
              {headerGroup.headers.map((header) => (
                <TableHeader key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHeader>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        page={table.getState().pagination.pageIndex + 1}
        totalItems={data.length}
        pagesUnknown={false}
        pageInputDisabled={undefined}
        pageSizeInputDisabled={undefined}
        backwardText={'Previous page'}
        forwardText={'Next page'}
        pageSize={table.getState().pagination.pageSize}
        pageSizes={[10, 20, 30, 40, 50]}
        itemsPerPageText={'Items per page:'}
        onChange={({ pageSize, page }) => {
          table.setPageSize(Number(pageSize));
          table.setPageIndex(page - 1);
        }}
      />
    </TableContainer>
  );
};
