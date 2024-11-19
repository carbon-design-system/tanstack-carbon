import React, {
  Dispatch,
  SetStateAction,
  useState,
  useRef,
  useEffect,
} from 'react';
import { animate } from 'motion';
import cx from 'classnames';
import {
  DataTable,
  IconButton,
  Layer,
  TextInput,
  Dropdown,
  ButtonSet,
  Button,
  Checkbox,
  NumberInput,
} from '@carbon/react';
import { Close, Filter } from '@carbon/react/icons';
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
  TableToolbarSearch,
} = DataTable;

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  FilterFn,
  getFilteredRowModel,
  ColumnFiltersState,
  Column,
  Header,
  getFacetedUniqueValues,
  ColumnFilter,
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';

import { makeData } from './makeData';
import { TagOverflow, pkg } from '@carbon/ibm-products';

pkg.component.TagOverflow = true;

type Resource = {
  id: string;
  name: string;
  rule: string;
  status: string;
  other: string;
  example: string;
};

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
    filterFn: 'arrIncludesSome',
    meta: {
      filterVariant: 'checkbox',
    },
  }),
  columnHelper.accessor('status', {
    header: () => <span>Status</span>,
    meta: {
      filterVariant: 'select',
    },
  }),
  columnHelper.accessor('other', {
    header: 'Other',
  }),
  columnHelper.accessor('example', {
    header: 'Example',
    filterFn: 'weakEquals',
    meta: {
      filterVariant: 'number',
    },
  }),
];

export const FilterPanel = () => {
  const [data] = useState(makeData(7));
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [localFilters, setLocalFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter, //define as a filter function that can be used in column definitions
    },
    state: {
      globalFilter,
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'fuzzy', //apply fuzzy filter to the global filter (most common use case for fuzzy filter)
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  interface ExtendedColFilter extends ColumnFilter {
    label: string;
    onClose: () => void;
    filter: boolean;
  }

  const buildTagFilters = () => {
    const tagFilters = columnFilters.map((c: ExtendedColFilter) => {
      const buildTag = (col, checkboxParentColumnData?: ColumnFilter) => {
        const tagData = {} as ExtendedColFilter;
        tagData.label =
          typeof col === 'string'
            ? `${checkboxParentColumnData.id}: ${col}`
            : `${col.id}: ${col.value}`;
        tagData.onClose = () => {
          if (typeof col === 'string') {
            const groupValues = checkboxParentColumnData.value as string[];
            const newGroupValues = groupValues.filter((val) => val !== col);
            const foundLocalIndex = localFilters.findIndex(
              (f) => f.id === checkboxParentColumnData.id
            );
            const foundColumnIndex = columnFilters.findIndex(
              (f) => f.id === checkboxParentColumnData.id
            );
            const tempLocal = [...localFilters];
            const tempColumnFilters = [...columnFilters];
            if (foundLocalIndex > -1) {
              tempLocal.splice(foundLocalIndex, 1);
              if (!newGroupValues.length) {
                setLocalFilters(tempLocal);
              } else {
                setLocalFilters([
                  ...tempLocal,
                  { id: checkboxParentColumnData.id, value: newGroupValues },
                ]);
              }
            }
            if (foundColumnIndex > -1) {
              tempColumnFilters.splice(foundColumnIndex, 1);
              if (!newGroupValues.length) {
                setColumnFilters(tempColumnFilters);
              } else {
                setColumnFilters([
                  ...tempColumnFilters,
                  { id: checkboxParentColumnData.id, value: newGroupValues },
                ]);
              }
            }
            return;
          }
          const parentData =
            typeof col === 'string' ? checkboxParentColumnData : col;
          const foundLocalIndex = localFilters.findIndex(
            (f) => f.id === parentData.id && f.value === parentData.value
          );
          const foundColumnIndex = columnFilters.findIndex(
            (f) => f.id === parentData.id && f.value === parentData.value
          );
          const tempFilters = [...localFilters];
          const tempColumnFilters = [...columnFilters];
          if (foundColumnIndex > -1) {
            tempColumnFilters.splice(foundColumnIndex, 1);
            setColumnFilters(tempColumnFilters);
          }
          if (foundLocalIndex > -1) {
            tempFilters.splice(foundLocalIndex, 1);
            setLocalFilters(tempFilters);
          }
          const tableFullColumn = table.getColumn(parentData.id);
          tableFullColumn.setFilterValue(undefined);
        };
        tagData.filter = true;
        tagData.id = typeof col === 'string' ? col : col.id;
        return tagData;
      };
      if (Array.isArray(c.value)) {
        return c.value.map((val) => buildTag(val, c));
      }
      return buildTag(c);
    });
    return tagFilters.flat();
  };

  const returnFocusToFlyoutTrigger = () => {
    if (popoverRef?.current) {
      const triggerButton = popoverRef?.current.querySelector('button');
      triggerButton?.focus();
    }
  };

  const containerRef = useRef();
  const popoverRef = useRef<HTMLSpanElement>();

  useEffect(() => {
    const tableContainer = containerRef?.current;
    if (tableContainer as HTMLDivElement) {
      const tableContent = (tableContainer as HTMLDivElement)?.querySelector(
        '.cds--data-table-content'
      );
      if (tableContent) {
        (tableContainer as HTMLDivElement)?.style.setProperty(
          '--table-height',
          `${(tableContent as HTMLDivElement)?.clientHeight}px`
        );
      }
    }
  }, []);

  const animatePanel = () => {
    if (popoverOpen) {
      animate(
        '.panel--container',
        {
          opacity: [1, 0],
          transform: [`translateX(0px)`, `translateX(-320px)`],
        },
        {
          duration: 0.25,
        }
      );
      // .cds--data-table-content
      animate(
        '.cds--data-table-content',
        {
          width: '100%',
          transform: 'translateX(0px)',
        },
        {
          duration: 0.25,
        }
      );
    } else {
      animate(
        '.panel--container',
        {
          opacity: [0, 1],
          transform: [`translateX(-320px)`, `translateX(0px)`],
        },
        {
          duration: 0.25,
        }
      );
      animate(
        '.filter-panel-example .cds--data-table-content',
        {
          width: 'calc(100% - 336px)',
          transform: 'translateX(336px)',
        },
        {
          duration: 0.25,
        }
      );
    }
  };

  return (
    <div ref={containerRef}>
      <TableContainer
        title="Filter panel"
        className="basic-table tanstack-example filter-flyout-example filter-panel-example"
        style={{
          width: table.getCenterTotalSize(),
        }}>
        <TableToolbar>
          <TableToolbarContent>
            <IconButton
              onClick={() => {
                setPopoverOpen((prev) => !prev);
                animatePanel();
              }}
              label="Filter"
              kind="ghost"
              className={cx({
                [`filter--panel__triggering-icon-open`]: popoverOpen,
              })}>
              <Filter />
            </IconButton>
            <TableToolbarSearch
              defaultValue={globalFilter ?? ''}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setGlobalFilter(event.target.value)
              }
              placeholder="Search all columns..."
              persistent
            />
          </TableToolbarContent>
        </TableToolbar>
        {buildTagFilters().length ? (
          <div className="filter--summary">
            <TagOverflow
              className={cx({
                ['tag-overflow-flyout-example']: buildTagFilters().length,
              })}
              // @ts-expect-error `filter` should be boolean in tag overflow component
              items={buildTagFilters()}
              containingElementRef={containerRef}
              measurementOffset={140}
            />
            <Button
              kind="ghost"
              onClick={() => {
                setLocalFilters([]);
                table.resetColumnFilters();
              }}>
              Clear filters
            </Button>
          </div>
        ) : null}
        <div className="panel--container">
          {popoverOpen && (
            <>
              <div className="filter--panel__content">
                <div className="filter--panel__header">
                  <IconButton
                    wrapperClasses="filter--panel__close-wrapper"
                    kind="ghost"
                    className="filter--panel__close"
                    aria-label="Close"
                    label="Close"
                    onClick={() => {
                      setPopoverOpen(false);
                      animatePanel();
                    }}>
                    <Close />
                  </IconButton>
                  <p className="flyout--label">Filter</p>
                </div>
                <div className="flyout--container">
                  <div className="flyout--container__filters">
                    {table.getHeaderGroups().map((headerGroup, index) => (
                      <React.Fragment key={index}>
                        {headerGroup.headers.map((header, index) => {
                          if (header.column.getCanFilter()) {
                            return (
                              <div className="filter-flyout-item" key={index}>
                                {popoverOpen && (
                                  <FilterColumn
                                    header={header}
                                    column={header.column}
                                    setLocalFilters={setLocalFilters}
                                    localFilters={localFilters}
                                  />
                                )}
                              </div>
                            );
                          }
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <ButtonSet className="filter-panel-button-set">
                  <Button
                    kind="secondary"
                    onClick={() => {
                      table.resetColumnFilters();
                      setPopoverOpen(false);
                      returnFocusToFlyoutTrigger();
                      setLocalFilters([]);
                      animatePanel();
                    }}>
                    Clear
                  </Button>
                  <Button
                    kind="primary"
                    onClick={() => {
                      setColumnFilters(localFilters);
                      setPopoverOpen(false);
                      returnFocusToFlyoutTrigger();
                      animatePanel();
                    }}>
                    Filter
                  </Button>
                </ButtonSet>
              </div>
            </>
          )}
        </div>
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
                    className="cell"
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

const FilterColumn = ({
  column,
  header,
  setLocalFilters,
  localFilters,
}: {
  column: Column<any, unknown>;
  header: Header<any, unknown>;
  setLocalFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
  localFilters: ColumnFiltersState;
}) => {
  const { filterVariant } = column.columnDef.meta ?? {};

  const sortedUniqueValues = React.useMemo(
    () =>
      Array.from(column.getFacetedUniqueValues().keys()).sort().slice(0, 5000),
    [column]
  );

  const getCheckboxState = (value) => {
    const foundFilter = localFilters.find((c) => c.id === column.id);
    const isChecked = foundFilter
      ? (
          localFilters.find((c) => c.id === column.id)?.value as string[]
        ).includes(value)
      : false;
    return !!isChecked;
  };

  return filterVariant === 'select' ? (
    <Layer level={2}>
      <Dropdown
        id="dropdown-filter"
        titleText={`Filter ${column.id}`}
        label="Choose a status"
        items={sortedUniqueValues}
        initialSelectedItem={
          localFilters.find((c) => c.id === column.id)?.value as string
        }
        renderSelectedItem={() => (
          <div className="flyout-dropdown-selected-item">
            {localFilters.find((c) => c.id === column.id)?.value as string}
          </div>
        )}
        itemToElement={(item: { value: any }) => (
          <div className="flyout-dropdown-selected-item">{item.value}</div>
        )}
        onChange={({ selectedItem }) => {
          const temp = [...localFilters];
          const foundIndex = temp.findIndex((c) => c.id === column.id);
          if (foundIndex > -1) {
            temp.splice(foundIndex, 1);
            temp.push({ id: column.id, value: selectedItem });
            setLocalFilters(temp);
            return;
          }
          setLocalFilters([...temp, { id: column.id, value: selectedItem }]);
        }}
      />
    </Layer>
  ) : filterVariant === 'checkbox' ? (
    <Layer level={2}>
      <p className="filter-checkbox-group-label">{column.id}</p>
      {sortedUniqueValues.map((value: string) => (
        <Checkbox
          key={value}
          id={value}
          labelText={value}
          checked={getCheckboxState(value)}
          onChange={(_, { checked, id }) => {
            const temp = [...localFilters];
            const foundLocalFilter = temp.filter((f) => f.id === column.id);
            const foundFilterIndex = foundLocalFilter.length
              ? temp.findIndex((f) => f.id === foundLocalFilter[0].id)
              : -1;
            // This means there is only one checkbox selected
            if (checked) {
              if (foundFilterIndex > -1) {
                const foundFilterValues = foundLocalFilter[0].value as [];
                temp.splice(foundFilterIndex, 1);
                temp.push({ id: column.id, value: [...foundFilterValues, id] });
                setLocalFilters(temp);
                return;
              }
              setLocalFilters([...temp, { id: column.id, value: [id] }]);
              return;
            }
            if (!checked) {
              if (foundFilterIndex > -1) {
                const foundFilterValues = foundLocalFilter[0].value as [];
                const newFoundFilterValues = foundFilterValues.filter(
                  (item) => item !== id
                );
                temp.splice(foundFilterIndex, 1);
                if (newFoundFilterValues && newFoundFilterValues.length) {
                  temp.push({ id: column.id, value: newFoundFilterValues });
                }
                setLocalFilters(temp);
              }
            }
          }}
        />
      ))}
    </Layer>
  ) : filterVariant === 'number' ? (
    <Layer level={2}>
      <NumberInput
        id={column.id}
        // value={(columnFilterValue ?? 0) as number}
        value={localFilters.find((c) => c.id === column.id)?.value as number}
        hideSteppers
        label={column.id}
        onChange={(_, { value }) => {
          const temp = [...localFilters];
          const foundLocalFilter = temp.filter((f) => f.id === column.id);
          const foundFilterIndex = foundLocalFilter.length
            ? temp.findIndex((f) => f.id === foundLocalFilter[0].id)
            : -1;
          if (foundFilterIndex > -1) {
            temp.splice(foundFilterIndex, 1);
            temp.push({ id: column.id, value });
            setLocalFilters(temp);
            return;
          } else {
            setLocalFilters([...temp, { id: column.id, value }]);
            return;
          }
        }}
      />
    </Layer>
  ) : (
    <Layer level={2}>
      <TextInput
        onChange={(event) => {
          // column.setFilterValue(event.target.value) // instant filter option
          const temp = [...localFilters];
          const foundLocalFilter = temp.filter((f) => f.id === column.id);
          const foundFilterIndex = foundLocalFilter.length
            ? temp.findIndex((f) => f.id === foundLocalFilter[0].id)
            : -1;
          if (foundFilterIndex > -1) {
            temp.splice(foundFilterIndex, 1);
            temp.push({ id: column.id, value: event.target.value });
            setLocalFilters(temp);
            return;
          } else {
            setLocalFilters([
              ...temp,
              { id: column.id, value: event.target.value },
            ]);
            return;
          }
        }}
        placeholder={`Filter ${column.id}`}
        type="text"
        value={
          (localFilters.find((c) => c.id === column.id)?.value as string) ?? ''
        }
        labelText={flexRender(
          header.column.columnDef.header,
          header.getContext()
        )}
        id={column.id}
      />
    </Layer>
  );
};
