import React, { useEffect, useState } from 'react';
import { DataTable, IconButton } from '@carbon/react';
import { Column } from '@carbon/react/icons';
const {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
} = DataTable;

import {
  ColumnOrderState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { makeData } from './makeData';
import { TearsheetNarrow } from '@carbon/ibm-products';
import { Sortable } from './drag-drop/Sortable';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import { verticalListSortingStrategy } from '@dnd-kit/sortable';

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

export const CustomizeColumns = () => {
  const [showTearsheet, setShowTearsheet] = useState(false);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);
  const [tempNewOrder, setTempNewOrder] = useState(null);
  const [newVisibilityList, setNewVisibilityList] = useState(null);

  const [data] = useState(makeData(7));

  useEffect(() => {
    const dragItems = table.getAllLeafColumns().map((d) => d.id);
    setTempNewOrder(dragItems);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
      columnOrder,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
  });

  return (
    <>
      <TableContainer
        title="Customize column order"
        className="basic-table tanstack-example"
        style={{
          width: table.getCenterTotalSize(),
        }}>
        <TableToolbar aria-label={'Table toolbar'}>
          <TableToolbarContent>
            <IconButton
              kind={'ghost'}
              label="Customize column order"
              onClick={() => setShowTearsheet(true)}>
              <Column />
            </IconButton>
          </TableToolbarContent>
        </TableToolbar>
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
      <TearsheetNarrow
        open={showTearsheet}
        title="Customize column order"
        onClose={() => setShowTearsheet(false)}
        actions={[
          {
            kind: 'secondary',
            label: 'Cancel',
            onClick: () => setShowTearsheet(false),
          },
          {
            kind: 'primary',
            label: 'Submit',
            onClick: () => {
              if (tempNewOrder) {
                setColumnOrder(tempNewOrder);
              }
              setShowTearsheet(false);
              const cols = newVisibilityList ?? table.getAllLeafColumns();
              const nonSelectedItems = table
                .getAllLeafColumns()
                .filter((obj) => cols.every((s) => s.id !== obj.id));
              // Toggle visibility state for cols
              cols.forEach((col) => {
                col.toggleVisibility(true);
              });
              nonSelectedItems.forEach((col) => {
                col.toggleVisibility(false);
              });
            },
          },
        ]}>
        <Sortable
          active={showTearsheet}
          modifiers={[restrictToParentElement, restrictToVerticalAxis]}
          strategy={verticalListSortingStrategy}
          type="vertical"
          wrapperStyle={null}
          onDragEnd={(newOrder) => {
            setTimeout(() => {
              setTempNewOrder(newOrder);
            }, 5);
          }}
          onVisibilityChange={(cols) => {
            console.log(cols);
            setNewVisibilityList(cols);
          }}
          dragItems={tempNewOrder}
          originalColumns={table.getAllLeafColumns()}
          visibleColumns={table.getVisibleFlatColumns()}
        />
      </TearsheetNarrow>
    </>
  );
};
