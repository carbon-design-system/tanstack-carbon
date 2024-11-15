import React from 'react';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';
import { makeData, Resource } from './makeData';
import { DataTable, IconButton, TableContainer } from '@carbon/react';
import { TrashCan, Edit } from '@carbon/react/icons';
const { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } =
  DataTable;

export const RowActions = () => {
  const onDelete = (row: Resource) => {
    console.log(row);
  };
  const onEdit = (row: Resource) => {
    console.log(row);
  };
  const columnHelper = createColumnHelper<Resource>();
  const defaultCols = [
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
      id: 'example',
    }),
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex">
            <IconButton
              size="sm"
              label="Delete"
              onClick={() => onDelete(row)}
              kind="ghost"
              // autoAlign
            >
              <TrashCan />
            </IconButton>
            <IconButton
              size="sm"
              label="Delete"
              onClick={() => onEdit(row)}
              kind="ghost"
              // autoAlign
            >
              <Edit />
            </IconButton>
          </div>
        );
      },
    },
  ];
  const [data] = React.useState(() => makeData(5));
  const [columns] = React.useState(() => [...defaultCols]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnPinning: {
        left: ['name'],
        right: ['actions'],
      },
    },
  });

  return (
    <TableContainer
      title="Row actions"
      className="tanstack-example sticky-example">
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHeader key={header.id} colSpan={header.colSpan}>
                    <div className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </div>
                  </TableHeader>
                );
              })}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
