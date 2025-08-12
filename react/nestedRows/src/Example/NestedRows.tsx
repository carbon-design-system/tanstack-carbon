import React, { useCallback, useEffect, useMemo } from 'react';

import {
  ExpandedState,
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  Row,
  createColumnHelper,
} from '@tanstack/react-table';
import { DataTable, TableContainer, Button } from '@carbon/react';
import { ChevronRight } from '@carbon/react/icons';
const { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } =
  DataTable;

import { makeData, Resource } from './makeData';

export const NestedRows = () => {
  const [data] = React.useState(() => makeData(10, 5, 3));

  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  // expansion indicator: state variables
  const [hoveredRow, setHoveredRow] = React.useState<any>({});
  const [hoveredRowIds, setHoveredRowIds] = React.useState([]);
  const [expIndPos, setExpIndPos] = React.useState(0);

  // expansion indicator: method to get row ids of all sub-rows
  const getAllSubRowIds = useMemo(() => {
    return (row: Row<Resource>): string[] => {
      const ids = [];

      const collectIds = (row) => {
        if (row.subRows && row.subRows.length > 0) {
          for (const subRow of row.subRows) {
            ids.push(subRow.id);
            collectIds(subRow); // Recursive for deep nesting
          }
        }
      };

      collectIds(row);

      return ids;
    };
  }, []);

  // for expansion indicator
  const onRowHover = useCallback(
    (row: Row<Resource>) => {
      if (row.getCanExpand && row.getIsExpanded()) {
        const indicatorPos = row.depth * 2 + 1.5;
        setExpIndPos(indicatorPos);
        setHoveredRowIds(getAllSubRowIds(row));
      } else {
        setHoveredRowIds([]);
      }
    },
    [getAllSubRowIds]
  );

  useEffect(() => {
    onRowHover(hoveredRow);
  }, [hoveredRow, onRowHover]);

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
          </Button>{' '}
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
            paddingLeft: `${
              row.depth * 2 +
              (row.depth ? (row.getCanExpand() ? 0.5 : 1.5) : 0.5)
            }rem`,
          }}
          className="flex">
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
          <span className="row-content">{getValue<boolean>()}</span>
          <div
            className="border-line"
            style={{
              width: `${
                row.depth * 2 +
                (!row.depth && !row.getIsExpanded()
                  ? 0
                  : row.getCanExpand()
                  ? 3
                  : 1)
              }rem`,
            }}></div>
          <div
            className="expansion-indicator"
            style={{
              left: `${expIndPos}rem`,
            }}></div>
        </div>
      ),
    }),
    columnHelper.accessor((row) => row.rule, {
      id: 'rule',
      header: () => <span>Rule</span>,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('status', {
      header: () => 'Status',
    }),
    columnHelper.accessor('other', {
      header: () => <span>Other</span>,
    }),
  ];

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
    <TableContainer title="Nested rows" className="tanstack-example">
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
              <TableRow
                key={row.id}
                onMouseEnter={() => setHoveredRow(row)}
                onMouseLeave={() => setHoveredRow({})}
                className={hoveredRowIds.includes(row.id) ? 'row-hovered' : ''}>
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
