import React, { useState } from 'react';
import { DataTable } from '@carbon/react';
const {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
} = DataTable;

import {
  createColumnHelper,
  ExpandedStateList,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getExpandedRowModel,
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

export const RowExpansion = () => {
  const [data] = useState(makeData(7));
  const [expanded, setExpanded] = useState<ExpandedStateList>({});
  const [isAllExpanded, setIsAllExpanded] = useState<boolean>(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(), // If not provided, responsible for manual control of expansion
    state: {
      expanded,
    },
  });

  return (
    <TableContainer
      title="Row expansion"
      className="basic-table tanstack-example"
      style={{
        width: table.getCenterTotalSize(),
      }}>
      <Table size="lg" useZebraStyles={false} aria-label="sample table">
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              <TableExpandHeader
                // TS error occurs unless both aria-label and ariaLabel are provided
                aria-label="expand row"
                ariaLabel="expand row"
                enableToggle
                onExpand={() => {
                  const newExpandState = {};
                  if (!isAllExpanded) {
                    table.getRowModel().rows.map((row) => {
                      newExpandState[row.id] = true;
                    });
                    setIsAllExpanded(true);
                    setExpanded(newExpandState);
                  } else {
                    setIsAllExpanded(false);
                    setExpanded({});
                  }
                }}
                isExpanded={false}
              />
              {headerGroup.headers.map((header) => (
                <TableHeader key={header.id}>
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
            <React.Fragment key={row.id}>
              <TableExpandRow
                key={row.id}
                onExpand={() => {
                  const isRowExpanded = !!expanded[row.id];
                  if (isRowExpanded) {
                    const newExpansionState = { ...expanded, [row.id]: false };
                    setExpanded(newExpansionState);
                    return;
                  }
                  const newExpansionState = { ...expanded, [row.id]: true };
                  setExpanded(newExpansionState);
                }}
                isExpanded={!!expanded[row.id]}
                aria-label="Row expander">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableExpandRow>
              <TableExpandedRow
                colSpan={columns.length + 1}
                className="demo-expanded-td">
                <h6>Expandable row content</h6>
                <div>Description here</div>
              </TableExpandedRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
