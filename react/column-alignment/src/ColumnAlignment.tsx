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
} from '@tanstack/react-table';
import { makeData } from './makeData';
import { ExampleLink } from './ExampleLink';
import { Launch } from '@carbon/react/icons';
import * as packageJson from '../package.json';
import { StatusIcon } from '@carbon/ibm-products';

type Resource = {
  id: string;
  name: string;
  rule: string;
  status: string;
  other: string;
  example: string;
};

const columnHelper = createColumnHelper<Resource>();

const getStatusIconValue = (kind) => {
  if (kind === 'disabled') {
    return 'fatal';
  }
  if (kind === 'starting') {
    return 'in-progress';
  }
  if (kind === 'active') {
    return 'running';
  }
  return 'running';
};

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
    header: () => <span className="center-align-cell">Status</span>,
    cell: (info) => {
      console.log(info.renderValue());
      const iconProps = {
        size: 'sm',
        theme: 'light',
        kind: getStatusIconValue(info.renderValue()),
        iconDescription: info.renderValue(),
      };
      // @ts-expect-error
      return <StatusIcon className="center-align-cell" {...iconProps} />;
    },
  }),
  columnHelper.accessor('other', {
    header: 'Other',
  }),
  columnHelper.accessor('example', {
    header: () => <span className="right-align-cell">Example</span>,
    cell: (info) => (
      <span className="right-align-cell">{info.renderValue()}</span>
    ),
  }),
];

export const ColumnAlignment = () => {
  const [data] = useState(makeData(7));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
      title="Column alignment"
      className="basic-table tanstack-example"
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
      }
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
