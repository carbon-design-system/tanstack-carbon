import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  Button,
  CodeSnippet,
  DataTable,
  DataTableSize,
  Layer,
  Popover,
  PopoverContent,
  RadioButton,
  RadioButtonGroup,
  TableToolbar,
} from '@carbon/react';
import { NoDataEmptyState } from '@carbon/ibm-products';
import cx from 'classnames';

const {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbarSearch,
} = DataTable;

import {
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';

// A TanStack fork of Kent C. Dodds' match-sorter library that provides ranking information
import { rankItem } from '@tanstack/match-sorter-utils';
import { Launch, Settings } from '@carbon/react/icons';
import * as packageJson from '../../package.json';

import { makeData, Resource } from './makeData';

// Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

export const RowSettings = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rowSize, setRowSize] = useState<DataTableSize>('lg');

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
      enableGlobalFilter: false,
    }),
  ];

  const [data] = React.useState<Resource[]>(() => makeData(5));

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter, //define as a filter function that can be used in column definitions
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'fuzzy', //apply fuzzy filter to the global filter (most common use case for fuzzy filter)
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
    <div ref={tableWrap} className="tanstack-example">
      <TableContainer
        title="Row settings"
        className="basic-table"
        style={{
          width: table.getCenterTotalSize(),
        }}>
        <TableToolbar>
          <TableToolbarSearch
            defaultValue={globalFilter ?? ''}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setGlobalFilter(event.target.value)
            }
            placeholder="Search all columns..."
            persistent
          />
          <Layer>
            <Popover
              open={settingsOpen}
              isTabTip
              onRequestClose={() => setSettingsOpen(false)}
              align={'bottom-end'}>
              <Button
                aria-label="Row settings"
                type="button"
                aria-expanded={settingsOpen}
                kind="ghost"
                onClick={() => {
                  setSettingsOpen((prev) => !prev);
                }}
                className={'row-settings-trigger'}>
                <Settings />
              </Button>
              <PopoverContent className="row-settings-popover-content">
                <RadioButtonGroup
                  legendText="Row settings"
                  name="radio-button-default-group"
                  onChange={(size: DataTableSize) => setRowSize(size)}
                  orientation="vertical"
                  valueSelected={rowSize}>
                  <RadioButton labelText="Extra small" value="xs" id="xs" />
                  <RadioButton labelText="Small" value="sm" id="sm" />
                  <RadioButton labelText="Medium" value="md" id="md" />
                  <RadioButton labelText="Large" value="lg" id="lg" />
                  <RadioButton labelText="Extra large" value="xl" id="xl" />
                </RadioButtonGroup>
              </PopoverContent>
            </Popover>
          </Layer>
        </TableToolbar>
        <Table
          size={rowSize}
          useZebraStyles={false}
          aria-label="sample table"
          className={cx({
            ['empty-table-wrapper']:
              table.getFilteredRowModel().rows.length === 0,
          })}>
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
          <TableBody
            className={cx({
              ['empty-table-body']:
                table.getFilteredRowModel().rows.length === 0,
            })}>
            {table.getFilteredRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell>
                  <NoDataEmptyState
                    title="No results found"
                    subtitle="Try adjusting your search or filter options to find what you're looking for."
                    illustrationDescription="Test alt text"
                    className="empty-table"
                  />
                </TableCell>
              </TableRow>
            )}
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
    </div>
  );
};
