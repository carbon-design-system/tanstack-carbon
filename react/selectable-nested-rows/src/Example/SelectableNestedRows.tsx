import React from 'react';

import {
  ExpandedState,
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
  // FilterFn,
  // PaginationState,
  // getPaginationRowModel,
  // getFilteredRowModel,
} from '@tanstack/react-table';
import { DataTable, Button, Checkbox } from '@carbon/react';
import { ChevronRight } from '@carbon/react/icons';
const {
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} = DataTable;

import { makeData, Resource } from './makeData';

export const SelectableNestedRows = () => {
  const columnHelper = createColumnHelper<Resource>();

  const columns = [
    columnHelper.accessor((row) => row.name, {
      id: 'name',
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
          {/* TableSelectAll throws DOM nesting error, using Checkbox instead to avoid this */}
          <Checkbox
            {...{
              className: 'row-selector',
              checked: table.getIsAllPageRowsSelected(),
              indeterminate: table.getIsSomePageRowsSelected(),
              onChange: () => {
                const isIndeterminate = table.getIsSomeRowsSelected();
                if (!isIndeterminate) {
                  table.toggleAllPageRowsSelected(true);
                }
                if (table.getIsAllPageRowsSelected()) {
                  table.toggleAllRowsSelected(false);
                  return;
                }
                if (isIndeterminate) {
                  table.toggleAllPageRowsSelected(true);
                  return;
                }
              },
              id: 'batch-checkbox',
              labelText: 'header checkbox',
              hideLabel: true,
            }}
          />
          <span className="row-content">Name</span>
        </div>
      ),
      cell: ({ row, getValue }) => (
        <div
          style={{
            // Since rows are flattened by default,
            // we can use the row.depth property
            // and paddingLeft to visually indicate the depth
            // of the row
            paddingLeft: `${row.depth * 2 + (row.getCanExpand() ? 0 : 1)}rem`,
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
            ) : null}
            <Checkbox
              {...{
                className: 'row-selector',
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
                id: `batch-checkbox__${row.id}`,
                labelText: 'row checkbox',
                hideLabel: true,
              }}
            />
            <span className="row-content">{getValue<boolean>()}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('rule', {
      header: 'Rule',
    }),
    columnHelper.accessor('status', {
      header: 'Status',
    }),
    columnHelper.accessor('other', {
      header: 'Other',
    }),
    columnHelper.accessor('example', {
      header: 'Example',
    }),
  ];

  const [data] = React.useState(() => makeData(10, 5, 3, 2));

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
