import React from 'react';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingFn,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Button, DataTable, TableContainer } from '@carbon/react';
import { ArrowUp } from '@carbon/react/icons';
import cx from 'classnames';
import { ExampleAiLabel } from './ExampleAiLabel';

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

export const SortableWithAiLabel = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<Resource>[]>(
    () => [
      {
        accessorKey: 'name',
        cell: (info) => info.getValue(),
        header: () => <span>Name</span>,
      },
      {
        accessorFn: (row) => row.rule,
        id: 'rule',
        cell: (info) => info.getValue(),
        header: () => <span>Rule</span>,
        sortUndefined: 'last', //force undefined values to the end
        sortDescFirst: false, //first sort order will be ascending (nullable values can mess up auto detection of sort order)
        meta: {
          slug: () => <ExampleAiLabel />,
        },
      },
      {
        accessorKey: 'status',
        header: () => 'Status',
        sortingFn: sortStatusFn,
      },
      {
        accessorKey: 'other',
        header: () => <span>Other</span>,
        sortUndefined: 'last', //force undefined values to the end
      },
      {
        accessorKey: 'example',
        header: 'Example',
      },
    ],
    []
  );

  const [data] = React.useState(() => makeData(1000));

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    onSortingChange: setSorting, //optionally control sorting state in your own scope for easy access
    state: {
      sorting,
    },
  });

  return (
    <TableContainer
      title="Column, AI label with sorting"
      className="tanstack-example">
      <Table className="sortable-example">
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const slug = header.column.columnDef.meta?.slug;
                const SlugComponent =
                  typeof slug === 'function'
                    ? header.column.columnDef.meta?.slug
                    : null;
                return (
                  <TableHeader
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cx([
                      { ['ai-label-is-present']: typeof slug !== 'undefined' },
                    ])}>
                    {header.isPlaceholder ? null : (
                      <>
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
                          {{
                            asc: <ArrowUp />,
                            desc: (
                              <ArrowUp className="descending-sorting-icon" />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </Button>
                        {SlugComponent && <SlugComponent />}
                      </>
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
                    const isAiCell = cell.column.columnDef.meta?.slug;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cx({
                          ['ai-cell']: typeof isAiCell !== 'undefined',
                        })}>
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
