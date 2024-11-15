import React from 'react';

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  Row,
  SortingState,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DataTable, SkeletonText } from '@carbon/react';
const { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } =
  DataTable;

import { fetchData, Resource, ResourceApiResponse } from './makeData';

const fetchSize = 50;

export const InfiniteScroll = () => {
  const columnHelper = createColumnHelper<Resource>();
  //we need a reference to the scrolling element for logic down below
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const [sorting, setSorting] = React.useState<SortingState>([]);

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

  //react-query has a useInfiniteQuery hook that is perfect for this use case
  const { data, fetchNextPage, isFetching, isLoading } =
    useInfiniteQuery<ResourceApiResponse>({
      queryKey: [
        'people',
        sorting, // refetch when sorting changes
      ],
      queryFn: async ({ pageParam = 0 }) => {
        const start = (pageParam as number) * fetchSize;
        const fetchedData = await fetchData(start, fetchSize); // pretend api call
        return fetchedData;
      },
      initialPageParam: 0,
      getNextPageParam: (_lastGroup, groups) => groups.length,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    });

  //flatten the array of arrays from the useInfiniteQuery hook
  const flatData = React.useMemo(
    () => data?.pages?.flatMap((page) => page.data) ?? [],
    [data]
  );
  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData.length;

  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = React.useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  );

  //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  React.useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const table = useReactTable({
    data: flatData,
    columns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    // debugTable: true,
  });

  //scroll to top of table when sorting changes
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting(updater);
    if (table.getRowModel().rows.length) {
      rowVirtualizer.scrollToIndex?.(0);
    }
  };

  //since this table option is derived from table row model state, we're using the table.setOptions utility
  table.setOptions((prev) => ({
    ...prev,
    onSortingChange: handleSortingChange,
  }));

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 48, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <div className="virtual-example tanstack-example">
      <h4>Virtualized infinite scroll</h4>
      {/* {process.env.NODE_ENV === 'development' ? (
          <p className='virtual-description'>
            <strong>Notice:</strong> You are currently running React in
            development mode. Virtualized rendering performance will be slightly
            degraded until this application is built for production.
          </p>
        ) : null} */}
      ({flatData.length} of {totalDBRowCount} rows fetched)
      <div
        className="infinite-scroll-container"
        onScroll={(e) => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
        ref={tableContainerRef}
        style={{
          overflow: 'auto', //our scrollable table container
          position: 'relative', //needed for sticky header
          height: '600px', //should be a fixed height
          width: table.getCenterTotalSize(),
        }}>
        {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
        {/* @ts-expect-error adding `style` purposefully for example */}
        <Table style={{ display: 'grid', width: table.getCenterTotalSize() }}>
          <TableHead
            style={{
              display: 'grid',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                }}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHeader
                      key={header.id}
                      style={{
                        display: 'flex',
                        width: header.getSize(),
                      }}>
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : '',
                          onClick: header.column.getToggleSortingHandler(),
                        }}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </TableHeader>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody
            style={{
              display: 'grid',
              height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
              position: 'relative', //needed for absolute positioning of rows
            }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
              const row = rows[virtualRow.index] as Row<Resource>;
              return (
                <React.Fragment key={index}>
                  <TableRow
                    data-index={virtualRow.index} //needed for dynamic row height measurement
                    // ref={node => rowVirtualizer.measureElement(node)} //measure dynamic row height
                    key={row.id}
                    style={{
                      display: 'flex',
                      position: 'absolute',
                      transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                      width: '100%',
                    }}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell
                          key={cell.id}
                          style={{
                            display: 'flex',
                            width: cell.column.getSize(),
                            alignItems: 'center',
                          }}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  {/* {index === 0 && ( */}
                  {isFetching &&
                    rowVirtualizer.getVirtualItems().length - 1 === index && (
                      <TableRow
                        className="virtual-skeleton-row"
                        style={{
                          display: 'flex',
                          position: 'absolute',
                          transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                          width: '100%',
                          alignItems: 'center',
                          height: 48,
                        }}>
                        {columns.map((_, index) => (
                          <TableCell
                            key={index}
                            style={{
                              display: 'flex',
                              width: 148,
                              alignItems: 'center',
                              height: 48,
                            }}>
                            <SkeletonText />
                          </TableCell>
                        ))}
                      </TableRow>
                    )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
