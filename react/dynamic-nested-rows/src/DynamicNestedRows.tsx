import React, { useState } from 'react';

import {
  ExpandedState,
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import {
  DataTable,
  TableContainer,
  Button,
  InlineLoading,
} from '@carbon/react';
import { ChevronRight } from '@carbon/react/icons';
const { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } =
  DataTable;

import { makeData, Resource } from './makeData';
import { ExampleLink } from './ExampleLink';
import { Launch } from '@carbon/react/icons';
import * as packageJson from '../package.json';

export const DynamicNestedRows = () => {
  const [data, setData] = React.useState(() => makeData(5));
  const [rowsFetchingList, setRowsFetchingList] = useState([]);
  console.log(data);
  const columns = React.useMemo<ColumnDef<Resource>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ table }) => <div className="flex expand-spacer">Name</div>,
        cell: ({ row, getValue }) => {
          const foundManualSubRowCheck =
            typeof table?.options?.meta?.checkSubRows === 'function';
          const foundLoadingRow = !!rowsFetchingList.find(
            (a) => a.id === row.id
          );
          return (
            <div
              style={{
                // Since rows are flattened by default,
                // we can use the row.depth property
                // and paddingLeft to visually indicate the depth
                // of the row
                paddingLeft: `${
                  row.depth * 2 +
                  (!row.getCanExpand() && !foundManualSubRowCheck ? 2 : 0)
                }rem`,
              }}>
              <div className="flex">
                {row.getCanExpand() || foundManualSubRowCheck ? (
                  <Button
                    {...{
                      onClick: async () => {
                        // row.getToggleExpandedHandler();
                        const isRowExpanded = row.getIsExpanded();
                        const newSubRows =
                          await table?.options?.meta?.checkSubRows(row.id);
                        const clonedData = [...data];
                        const rowIndexToUpdate = clonedData.findIndex(
                          (r) => r.id === row.original.id
                        );
                        clonedData[rowIndexToUpdate].subRows = newSubRows;
                        setData(clonedData);
                        row.toggleExpanded(isRowExpanded ? false : true);
                      },
                      style: { cursor: 'pointer' },
                    }}
                    disabled={foundLoadingRow}
                    className="row-expander"
                    kind="ghost"
                    size="sm">
                    {row.getIsExpanded() ? (
                      <ChevronRight className="row-expanded-icon" />
                    ) : foundLoadingRow ? (
                      <InlineLoading
                        status="active"
                        iconDescription=""
                        description=""
                      />
                    ) : (
                      <ChevronRight />
                    )}
                  </Button>
                ) : null}{' '}
                {getValue<boolean>()}
              </div>
            </div>
          );
        },
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
    [rowsFetchingList]
  );

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
    meta: {
      checkSubRows: (rowId, subRowCount = 2) => {
        async function fetchData() {
          const row = table.getRow(rowId);
          console.log('subRows', row.subRows, row);
          if (row.subRows.length) return;
          setRowsFetchingList((prev) => [...prev, row]);
          // const response = await fetch('https://jsonplaceholder.typicode.com/comments');
          // const comments = await response.json();
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setRowsFetchingList((prev) => prev.filter((a) => a.id !== row.id));
          return makeData(subRowCount);
        }
        return fetchData();
      },
    },
  });

  return (
    <TableContainer
      title="Dynamic nested rows"
      className="tanstack-example"
      description={
        <span className="flex">
          <ExampleLink
            url={`${import.meta.env.VITE_CODE_SANDBOX_URL_ROOT}/${
              packageJson.name
            }`}
            icon={Launch}
            label="Code sandbox"
          />
          <ExampleLink
            url={`${import.meta.env.VITE_STACK_BLITZ_URL_ROOT}/${
              packageJson.name
            }`}
            icon={Launch}
            label="StackBlitz"
          />
        </span>
      }>
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
