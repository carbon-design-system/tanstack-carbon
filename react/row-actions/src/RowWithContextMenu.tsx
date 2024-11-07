import React, { useRef } from 'react';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';
import { makeData, Resource } from './makeData';
import {
  DataTable,
  Menu,
  MenuItem,
  TableContainer,
  useContextMenu,
} from '@carbon/react';
const { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } =
  DataTable;
import { ExampleLink } from './ExampleLink';
import { Launch, TrashCan } from '@carbon/react/icons';
import * as packageJson from '../package.json';

const ContextRow = ({ row, children, updateData, data }) => {
  const el = useRef(null);
  const menuProps = useContextMenu(el);
  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  const removeItem = () => {
    const indexToRemove = data.findIndex(
      (r: Resource) => r.id === row.original.id
    );
    const newData = [
      ...data.slice(0, indexToRemove),
      ...data.slice(indexToRemove + 1),
    ];
    updateData(newData);
  };

  // Forced to use native tr element because forwardRef isn't used in TableRow from @carbon/react
  // const mode = 'basic' as const;
  return (
    <>
      <tr key={row.id} onContextMenu={handleContextMenu} ref={el}>
        {children}
      </tr>
      {/* @ts-ignore not sure what's going on here with `mode` prop */}
      <Menu label="testing 123" {...menuProps}>
        <MenuItem
          onClick={removeItem}
          label="Delete"
          renderIcon={(props) => <TrashCan {...props} />}
        />
      </Menu>
    </>
  );
};

export const RowWithContextMenu = () => {
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
  ];
  const [data, setData] = React.useState(() => makeData(5));
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
      title="Row with context menu"
      className="tanstack-example sticky-example"
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
            <ContextRow row={row} key={row.id} updateData={setData} data={data}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </ContextRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
