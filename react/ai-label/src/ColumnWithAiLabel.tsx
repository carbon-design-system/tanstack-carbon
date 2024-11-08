import React from 'react';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { DataTable, TableContainer } from '@carbon/react';
import cx from 'classnames';
import { ExampleAiLabel } from './ExampleAiLabel';

const { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } =
  DataTable;

import { makeData, Resource } from './makeData';

export const ColumnWithAiLabel = () => {
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
        meta: {
          slug: () => <ExampleAiLabel />,
        },
      },
      {
        accessorKey: 'status',
        header: () => 'Status',
      },
      {
        accessorKey: 'other',
        header: () => <span>Other</span>,
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
  });

  return (
    <TableContainer title="Column, AI label" className="tanstack-example">
      <Table className="ai-column-example">
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const slug = header.column.columnDef.meta?.slug;
                const SlugComponent =
                  typeof slug === 'function'
                    ? header.column.columnDef.meta?.slug
                    : null;
                console.log(SlugComponent);
                return (
                  <TableHeader
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cx([
                      'ai-column',
                      { ['ai-label-is-present']: typeof slug !== 'undefined' },
                    ])}>
                    {header.isPlaceholder ? null : (
                      <>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
