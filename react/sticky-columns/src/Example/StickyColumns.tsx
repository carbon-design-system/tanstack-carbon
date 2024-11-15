import React, { CSSProperties } from 'react';

import {
  Column,
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

//These are the important styles to make sticky column pinning work!
//Apply styles like this using your CSS strategy of choice with this kind of logic to head cells, data cells, footer cells, etc.
//View the index.css file for more needed styles such as border-collapse: separate
const getCommonPinningStyles = (column: Column<Resource>): CSSProperties => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinnedColumn =
    isPinned === 'right' && column.getIsFirstColumn('right');

  return {
    borderRight: isLastLeftPinnedColumn
      ? '1px solid var(--cds-border-subtle)'
      : 0,
    borderLeft: isFirstRightPinnedColumn
      ? '1px solid var(--cds-border-subtle)'
      : 0,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
    backgroundColor: 'var(--cds-layer)',
  };
};

export const StickyColumns = () => {
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
              kind="ghost">
              <TrashCan />
            </IconButton>
            <IconButton
              size="sm"
              label="Delete"
              onClick={() => onEdit(row)}
              kind="ghost">
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
      title="Sticky columns"
      className="tanstack-example sticky-example"
      style={{
        width: 500,
      }}>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const { column } = header;

                return (
                  <TableHeader
                    key={header.id}
                    colSpan={header.colSpan}
                    //IMPORTANT: This is where the magic happens!
                    style={{ ...getCommonPinningStyles(column) }}>
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
                const { column } = cell;
                return (
                  <TableCell
                    key={cell.id}
                    //IMPORTANT: This is where the magic happens!
                    style={{ ...getCommonPinningStyles(column) }}>
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
