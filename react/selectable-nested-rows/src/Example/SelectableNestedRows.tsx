import React from 'react';

import {
  ExpandedState,
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { DataTable, TableContainer, Button } from '@carbon/react';
import { ChevronRight } from '@carbon/react/icons';
const { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } =
  DataTable;

import { makeData, Resource } from './makeData';

export const SelectableNestedRows = () => {
  const columns = React.useMemo<ColumnDef<Resource>[]>(
    () => [
      {
        accessorKey: 'name',
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
            Name
          </div>
        ),
        cell: ({ row, getValue }) => (
          <div
            style={{
              // Since rows are flattened by default,
              // we can use the row.depth property
              // and paddingLeft to visually indicate the depth
              // of the row
              paddingLeft: `${
                row.depth * 2 + (!row.getCanExpand() ? 2 : 0)
              }rem`,
            }}>
            <div className="flex">
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
              ) : null}{' '}
              {getValue<boolean>()}
            </div>
          </div>
        ),
      },
      {
        accessorFn: (row) => row.rule,
        id: 'rule',
        cell: (info) => info.getValue(),
        header: () => <span>Rule</span>,
      },
      {
        accessorKey: 'status',
        header: () => 'Status',
      },
      {
        accessorKey: 'other',
        header: () => <span>Other</span>,
      },
    ],
    []
  );

  const [data] = React.useState(() => makeData(10, 5, 3));

  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    // filterFromLeafRows: true,
    // maxLeafRowFilterDepth: 0,
    // debugTable: true,
  });

  return (
    <TableContainer title="Selectable nested rows" className="tanstack-example">
      <Table>
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
