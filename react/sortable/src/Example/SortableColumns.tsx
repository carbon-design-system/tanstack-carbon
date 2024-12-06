import React from 'react';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortDirection,
  SortingFn,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Button, DataTable, TableContainer } from '@carbon/react';
import { ArrowUp } from '@carbon/react/icons';
import cx from 'classnames';

const { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } =
  DataTable;

import { makeData, Resource } from './makeData';

//custom sorting logic for one of our enum columns
const sortStatusFn: SortingFn<Resource> = (rowA, rowB) => {
  const statusA = rowA.original.status;
  const statusB = rowB.original.status;
  const statusOrder = ['starting', 'active', 'disabled'];
  return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB);
};

export const SortableColumns = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<Resource>[]>(
    () => [
      {
        accessorKey: 'name',
        cell: (info) => info.getValue(),
        header: () => <span>Name</span>,
        //this column will sort in ascending order by default since it is a string column
      },
      {
        accessorFn: (row) => row.rule,
        id: 'rule',
        cell: (info) => info.getValue(),
        header: () => <span>Rule</span>,
        sortUndefined: 'last', //force undefined values to the end
        sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
      },
      {
        accessorKey: 'status',
        header: () => 'Status',
        sortingFn: sortStatusFn, //use our custom sorting function for this enum column

        //this column will sort in descending order by default since it is a number column
      },
      {
        accessorKey: 'other',
        header: () => <span>Other</span>,
        sortUndefined: 'last', //force undefined values to the end
      },
      {
        accessorKey: 'example',
        header: 'Example',
        // enableSorting: false, //disable sorting for this column
      },
      // {
      //   accessorKey: 'createdAt',
      //   header: 'Created At',
      //   // sortingFn: 'datetime' //make sure table knows this is a datetime column (usually can detect if no null values)
      // },
    ],
    []
  );

  const [data] = React.useState(() => makeData(1000));

  const table = useReactTable({
    columns,
    data,
    // debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    onSortingChange: setSorting, //optionally control sorting state in your own scope for easy access
    // sortingFns: {
    //   sortStatusFn, //or provide our custom sorting function globally for all columns to be able to use
    // },
    //no need to pass pageCount or rowCount with client-side pagination as it is calculated automatically
    state: {
      sorting,
    },
    // autoResetPageIndex: false, // turn off page index reset when sorting or filtering - default on/true
    // enableMultiSort: false, //Don't allow shift key to sort multiple columns - default on/true
    // enableSorting: false, // - default on/true
    // enableSortingRemoval: false, //Don't allow - default on/true
    // isMultiSortEvent: (e) => true, //Make all clicks multi-sort - default requires `shift` key
    // maxMultiSortColCount: 3, // only allow 3 columns to be sorted at once - default is Infinity
  });

  //access sorting state from the table instance
  // console.log(table.getState().sorting)

  return (
    <TableContainer title="Column sorting" className="tanstack-example">
      <Table className="sortable-example">
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHeader key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <Button
                        kind="ghost"
                        className={cx('sortable-button-header', {
                          ['cursor-pointer']: header.column.getCanSort(),
                          ['select-none']: header.column.getCanSort(),
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                        title={
                          header.column.getCanSort()
                            ? header.column.getNextSortingOrder() === 'asc'
                              ? 'Sort ascending'
                              : header.column.getNextSortingOrder() === 'desc'
                              ? 'Sort descending'
                              : 'Clear sort'
                            : undefined
                        }>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {/*
                          This syntax is slightly odd so adding some additional context,
                          this uses index notation to choose an object property, either
                          one of the SortDirection values will be chosen (ie `asc` or `desc`)
                          or false, which means null will be applied here
                         */}
                        {{
                          asc: <ArrowUp />,
                          desc: <ArrowUp className="descending-sorting-icon" />,
                        }[header.column.getIsSorted() as SortDirection] ?? null}
                      </Button>
                    )}
                  </TableHeader>
                );
              })}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table
            .getRowModel()
            .rows.slice(0, 10)
            .map((row) => {
              return (
                <TableRow key={row.id}>
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
