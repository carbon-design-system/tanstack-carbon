import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from '@carbon/react';
const { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } =
  DataTable;

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  Table as TanstackTable,
  Row,
} from '@tanstack/react-table';

import { makeData, Resource } from './makeData';
import './example.scss';
import {
  useVirtualizer,
  VirtualItem,
  Virtualizer,
} from '@tanstack/react-virtual';

export const Virtual = () => {
  const columnHelper = createColumnHelper<Resource>();

  const [isRendered, setIsRendered] = useState<boolean>(false);
  const [data] = useState(makeData(1000));

  useEffect(() => {
    // This method is used to achieve a sticky table header.
    // Although we have `tableContainerRef` as the scroll container to pass to TanStack via `getScrollElement`,
    // Carbon adds an extra wrapper (`.cds--data-table-content`) around the <table>, which breaks sticky header behavior.
    // To fix this, we need to pass the `.cds--data-table-content` element as the scroll container to TanStack.
    // However, this wrapper is only available after the <Table> has rendered, so we delay rendering the table body using `await undefined`.

    const renderReady = async () => {
      await undefined; // Simulates async logic
      setIsRendered(true);
    };

    renderReady();
  }, []);

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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="Virtualized-table tanstack-example"
      ref={tableContainerRef}
      style={{
        width: table.getCenterTotalSize(),
      }}>
      {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
      <Table>
        <TableHead
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              style={{
                display: 'flex',
                width: '100%',
              }}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHeader
                    key={header.id}
                    style={{
                      display: 'flex',
                      width: header.getSize(),
                      alignItems: 'center',
                    }}>
                    <div>
                      {flexRender(
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
        {isRendered && (
          <TableBodyComponent
            table={table}
            tableContainerRef={tableContainerRef}
          />
        )}
      </Table>
    </div>
  );
};

interface TableBodyProps {
  table: TanstackTable<Resource>;
  tableContainerRef: React.RefObject<HTMLDivElement>;
}

function TableBodyComponent({ table, tableContainerRef }: TableBodyProps) {
  const { rows } = table.getRowModel();

  // Important: Keep the row virtualizer in the lowest component possible to avoid unnecessary re-renders.
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 48, //estimate row height for accurate scrollbar dragging
    getScrollElement: () =>
      tableContainerRef.current.querySelector('.cds--data-table-content'),
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  return (
    <TableBody
      style={{
        display: 'grid',
        height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
        position: 'relative', //needed for absolute positioning of rows
      }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index] as Row<Resource>;
        return (
          <TableBodyRowComponent
            key={row.id}
            row={row}
            virtualRow={virtualRow}
            rowVirtualizer={rowVirtualizer}
          />
        );
      })}
    </TableBody>
  );
}

interface TableBodyRowProps {
  row: Row<Resource>;
  virtualRow: VirtualItem;
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
}

function TableBodyRowComponent({
  row,
  virtualRow,
  rowVirtualizer,
}: TableBodyRowProps) {
  return (
    <TableRow
      data-index={virtualRow.index} //needed for dynamic row height measurement
      ref={(node) => rowVirtualizer.measureElement(node as any)} //measure dynamic row height
      key={row.id}
      style={{
        display: 'flex',
        position: 'absolute',
        transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
        width: '100%',
      }}>
      {row.getVisibleCells().map((cell) => {
        return (
          <TableCell
            key={cell.id}
            style={{
              display: 'flex',
              width: cell.column.getSize(),
              alignItems: 'center',
            }}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
