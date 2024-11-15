import { useRef, useState, useLayoutEffect } from 'react';
import { DataTable } from '@carbon/react';
const {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} = DataTable;

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnResizeMode,
} from '@tanstack/react-table';
import { makeData } from './makeData';

type Resource = {
  id: string;
  name: string;
  rule: string;
  status: string;
  other: string;
  example: string;
};

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
  }),
];

export const ResizableCols = () => {
  const [data] = useState(makeData(7));

  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode,
  });

  const tableWrap = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    const tableWrapElement = tableWrap.current;
    if (tableWrapElement) {
      const tableElement = tableWrapElement.querySelector('table');
      tableElement.style.width = `${table.getCenterTotalSize()}px`;
    }
  }, [table]);

  return (
    <TableContainer
      title="Resizable columns"
      className="basic-table tanstack-example"
      style={{
        width: table.getCenterTotalSize(),
      }}>
      <Table size="lg" useZebraStyles={false} aria-label="sample table">
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
                  <div
                    {...{
                      onDoubleClick: () => header.column.resetSize(),
                      onMouseDown: header.getResizeHandler(),
                      onTouchStart: header.getResizeHandler(),
                      className: `resizer ${
                        table.options.columnResizeDirection
                      } ${header.column.getIsResizing() ? 'isResizing' : ''}`,
                      style: {
                        transform:
                          columnResizeMode === 'onEnd' &&
                          header.column.getIsResizing()
                            ? `translateX(${
                                (table.options.columnResizeDirection === 'rtl'
                                  ? -1
                                  : 1) *
                                (table.getState().columnSizingInfo
                                  .deltaOffset ?? 0)
                              }px)`
                            : '',
                      },
                    }}
                  />
                </TableHeader>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
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
  );
};
