import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ExpandedState,
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  Row,
  createColumnHelper,
} from '@tanstack/react-table';
import { DataTable, TableContainer, Button, SkeletonText } from '@carbon/react';
import { ChevronRight } from '@carbon/react/icons';
const { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } =
  DataTable;

import { makeData, Resource } from './makeData';

function updateSubRows(
  resources: Resource[],
  uuid: string,
  newSubRows: Resource[]
) {
  return resources.map((resource: Resource) => {
    if (resource.uuid === uuid) {
      resource.subRows = newSubRows;
    } else if (resource.subRows) {
      updateSubRows(resource.subRows, uuid, newSubRows);
    }
    return resource;
  });
}

export const DynamicNestedRows = () => {
  const [data, setData] = React.useState(() => makeData(5));
  const [rowsFetchingList, setRowsFetchingList] = useState([]);
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
        const indicatorPos = row.depth * 2 + 1;
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
      header: () => (
        <div className="flex expand-spacer">
          <span className="row-content">Name</span>
        </div>
      ),
      cell: ({ row, getValue }) => {
        const foundManualSubRowCheck =
          typeof table?.options?.meta?.checkSubRows === 'function';
        const foundLoadingRow = !!rowsFetchingList.filter(
          (r) => r.id === row.id
        ).length;
        return (
          <div
            className="flex"
            style={{
              // Since rows are flattened by default,
              // we can use the row.depth property
              // and paddingLeft to visually indicate the depth
              // of the row
              paddingLeft: `${
                row.depth * 2 +
                ((row.getCanExpand() || foundManualSubRowCheck) && row.depth < 2
                  ? 0
                  : 0.5)
              }rem`,
            }}>
            {(row.getCanExpand() || foundManualSubRowCheck) && row.depth < 2 ? (
              <Button
                {...{
                  onClick: async () => {
                    if (foundLoadingRow) return;
                    const isRowExpanded = row.getIsExpanded();
                    if (!isRowExpanded && !row.subRows.length) {
                      const newSubRows =
                        await table?.options?.meta?.checkSubRows(row.id);

                      const clonedData = updateSubRows(
                        [...data],
                        row.original.uuid,
                        newSubRows
                      );
                      setData(clonedData);
                    }
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
                  row.depth * 2 + (row.depth || row.getIsExpanded() ? 2 : 0)
                }rem`,
              }}></div>
            <div
              className="expansion-indicator"
              style={{
                left: `${expIndPos}rem`,
              }}></div>
          </div>
        );
      },
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
    meta: {
      checkSubRows: (rowId, subRowCount = 2) => {
        async function fetchData() {
          const row = table.getRow(rowId);
          setRowsFetchingList((prev) => [...prev, row]);
          const isRowExpanded = row.getIsExpanded();
          row.toggleExpanded(isRowExpanded ? false : true);
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
    <TableContainer title="Dynamic nested rows" className="tanstack-example">
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
            const foundLoadingRow = rowsFetchingList.some(
              (r) => r.id === row.id
            );
            return (
              <React.Fragment key={row.id}>
                <TableRow
                  onMouseEnter={() => setHoveredRow(row)}
                  onMouseLeave={() => setHoveredRow({})}
                  className={
                    hoveredRowIds.includes(row.id) ? 'row-hovered' : ''
                  }>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell key={cell.id}>
                        {row.original?.isSkeleton ? (
                          <SkeletonText />
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
                {row.getIsExpanded() && foundLoadingRow && (
                  <TableRow
                    onMouseEnter={() => setHoveredRow(row)}
                    onMouseLeave={() => setHoveredRow({})}
                    className={
                      hoveredRowIds.includes(row.id) ? 'row-hovered' : ''
                    }>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell key={cell.id}>
                          {cell.column.id === 'name' ? (
                            <div
                              style={{
                                paddingLeft: `${row.depth * 2 + 2.5}rem`,
                              }}>
                              <SkeletonText />
                            </div>
                          ) : (
                            <SkeletonText />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
