import React, { useLayoutEffect, useRef } from 'react';
import { DataTable } from '@carbon/react';
import { NoDataEmptyState } from '@carbon/ibm-products';
import cx from 'classnames';

const {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbarSearch,
} = DataTable;

import {
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';

// A TanStack fork of Kent C. Dodds' match-sorter library that provides ranking information
import { rankItem } from '@tanstack/match-sorter-utils';

import { makeData, Resource } from './makeData';

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

export const GlobalFilter = () => {
  const [globalFilter, setGlobalFilter] = React.useState('');

  const columnHelper = createColumnHelper<Resource>();
  const columns = [
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
      enableGlobalFilter: false,
    }),
  ];

  const [data] = React.useState<Resource[]>(() => makeData(5));

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter, //define as a filter function that can be used in column definitions
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'fuzzy', //apply fuzzy filter to the global filter (most common use case for fuzzy filter)
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // debugTable: true,
    // debugHeaders: true,
    // debugColumns: false,
  });

  const tableWrap = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    const tableWrapElement = tableWrap.current;
    if (tableWrapElement) {
      const tableElement = tableWrapElement.querySelector('table');
      tableElement.style.width = `${table.getCenterTotalSize()}px`;
    }
  }, [table]);

  console.log(table.getFilteredRowModel().rows.length);

  return (
    <div ref={tableWrap} className="tanstack-example">
      <TableContainer
        title="Global filter"
        className="basic-table"
        style={{
          width: table.getCenterTotalSize(),
        }}>
        <TableToolbarSearch
          defaultValue={globalFilter ?? ''}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setGlobalFilter(event.target.value)
          }
          placeholder="Search all columns..."
          persistent
        />
        <Table
          size="lg"
          useZebraStyles={false}
          aria-label="sample table"
          className={cx({
            ['empty-table-wrapper']:
              table.getFilteredRowModel().rows.length === 0,
          })}>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHeader
                    key={header.id}
                    style={{
                      width: header.getSize(),
                    }}>
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
          <TableBody
            className={cx({
              ['empty-table-body']:
                table.getFilteredRowModel().rows.length === 0,
            })}>
            {table.getFilteredRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell>
                  <NoDataEmptyState
                    title="No results found"
                    subtitle="Try adjusting your search or filter options to find what you're looking for."
                    illustrationDescription="Test alt text"
                    className="empty-table"
                  />
                </TableCell>
              </TableRow>
            )}
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                    }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
