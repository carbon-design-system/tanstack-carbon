import React from 'react';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import { Checkbox, DataTable, Pagination, TableContainer } from '@carbon/react';
import { Download, Draggable, Save, TrashCan } from '@carbon/react/icons';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { DraggableRow } from './components/DraggableRow';
import { MoveToPositionModal } from './components/MoveToPositionModal';
import { RowActions } from './components/RowActions';
import { RowDragOverlay, TableViewport } from './components/RowDragOverlay';
import { PAGE_SIZE, TOTAL_ITEMS } from './constants';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { makeData, Resource } from './makeData';
import { getPinnedClassName } from './utils';

const {
  Table,
  TableBatchAction,
  TableBatchActions,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
} = DataTable;

export const DraggableRows = () => {
  const reducedMotion = usePrefersReducedMotion();
  const [data, setData] = React.useState(() => makeData(TOTAL_ITEMS));
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const [viewport, setViewport] = React.useState<TableViewport | null>(null);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  // `null` means the move dialog is closed; the position is 1-based.
  const [moveTarget, setMoveTarget] = React.useState<{
    resource: Resource;
    index: number;
  } | null>(null);
  const [targetPosition, setTargetPosition] = React.useState<number>(1);

  // Moves a row in the whole list and shows the page it lands on.
  const moveRow = React.useCallback((id: string, newIndex: number) => {
    setData((data) => {
      const oldIndex = data.findIndex((item) => item.id === id);
      if (oldIndex === -1 || newIndex < 0 || newIndex >= data.length) {
        return data;
      }
      return arrayMove(data, oldIndex, newIndex);
    });
    setPagination((pagination) => ({
      ...pagination,
      pageIndex: Math.floor(newIndex / pagination.pageSize),
    }));
  }, []);

  const openMoveDialog = React.useCallback(
    (resource: Resource, index: number) => {
      setTargetPosition(index + 1);
      setMoveTarget({ resource, index });
    },
    []
  );

  const closeMoveDialog = () => setMoveTarget(null);

  const isTargetPositionValid =
    Number.isInteger(targetPosition) &&
    targetPosition >= 1 &&
    targetPosition <= data.length;

  const submitMoveDialog = () => {
    if (moveTarget && isTargetPositionValid) {
      moveRow(moveTarget.resource.id, targetPosition - 1);
      closeMoveDialog();
    }
  };

  const columns = React.useMemo<ColumnDef<Resource>[]>(
    () => [
      {
        id: 'drag-icon',
        header: () => <span className="cds--visually-hidden">Reorder</span>,
        cell: () => <Draggable />,
      },
      {
        id: 'select',
        // TableSelectAll throws a DOM nesting error, so Checkbox is used.
        header: ({ table }) => (
          <Checkbox
            id="select-all-page-rows"
            labelText="Select all rows on this page"
            hideLabel
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            id={`select-row__${row.id}`}
            labelText={`Select row ${row.original.name}`}
            hideLabel
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'rule',
        header: 'Rule',
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
      {
        accessorKey: 'other',
        header: 'Other',
      },
      {
        accessorKey: 'example',
        header: 'Example',
      },
      {
        id: 'actions',
        header: () => <span className="cds--visually-hidden">Actions</span>,
        cell: ({ row, table }) => (
          <RowActions
            resource={row.original}
            index={row.index}
            total={table.options.data.length}
            onMove={moveRow}
            onMoveToPosition={openMoveDialog}
          />
        ),
      },
    ],
    [moveRow, openMoveDialog]
  );

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    // Keeps the current page after reordering.
    autoResetPageIndex: false,
    initialState: { columnPinning: { right: ['actions'] } },
    getRowId: (row) => row.id, // selection stays with the row when reordered
    state: { pagination, rowSelection },
  });

  // Only the rows on the current page are sortable.
  const pageRows = table.getRowModel().rows;
  const pageRowIds = React.useMemo<UniqueIdentifier[]>(
    () => pageRows.map((row) => row.id),
    [pageRows]
  );

  const selectedCount = Object.keys(rowSelection).length;
  const shouldShowBatchActions = selectedCount > 0;

  const activeRow = activeId
    ? pageRows.find((row) => row.id === activeId)
    : undefined;

  // Limits the overlay to the visible part of the table.
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    const scroller = (event.activatorEvent.target as Element | null)?.closest(
      '.cds--data-table-content'
    );
    setViewport(
      scroller
        ? {
            left: scroller.getBoundingClientRect().left,
            width: scroller.clientWidth,
            scrollLeft: scroller.scrollLeft,
            tableWidth: scroller.scrollWidth,
          }
        : null
    );
  };

  const handleDragStop = () => {
    setActiveId(null);
    setViewport(null);
  };

  // Reorder rows after drag & drop.
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    handleDragStop();
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = data.findIndex(({ id }) => id === active.id);
        const newIndex = data.findIndex(({ id }) => id === over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  };

  // Mouse and touch need a small movement or press, so clicks don't drag.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    // Creates div elements, so don't nest it inside <table>.
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragStop}
      sensors={sensors}>
      <TableContainer title="Draggable rows" className="tanstack-example">
        <TableToolbar aria-label="Table toolbar">
          <TableBatchActions
            shouldShowBatchActions={shouldShowBatchActions}
            totalSelected={selectedCount}
            totalCount={data.length}
            onCancel={() => table.resetRowSelection()}
            onSelectAll={() => table.toggleAllRowsSelected(true)}>
            <TableBatchAction
              tabIndex={shouldShowBatchActions ? 0 : -1}
              renderIcon={TrashCan}
              onClick={() => table.resetRowSelection()}>
              Delete
            </TableBatchAction>
            <TableBatchAction
              tabIndex={shouldShowBatchActions ? 0 : -1}
              renderIcon={Save}
              onClick={() => table.resetRowSelection()}>
              Save
            </TableBatchAction>
            <TableBatchAction
              tabIndex={shouldShowBatchActions ? 0 : -1}
              renderIcon={Download}
              onClick={() => table.resetRowSelection()}>
              Download
            </TableBatchAction>
          </TableBatchActions>
        </TableToolbar>
        <Table className="draggable-rows-example">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHeader
                    key={header.id}
                    colSpan={header.colSpan}
                    className={getPinnedClassName(header.column)}>
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
            <SortableContext
              items={pageRowIds}
              strategy={verticalListSortingStrategy}>
              {pageRows.map((row) => (
                <DraggableRow
                  key={row.id}
                  row={row}
                  reducedMotion={reducedMotion}
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
        <Pagination
          page={pagination.pageIndex + 1}
          pageSize={pagination.pageSize}
          pageSizes={[PAGE_SIZE]}
          totalItems={data.length}
          backwardText="Previous page"
          forwardText="Next page"
          itemsPerPageText="Items per page:"
          onChange={({ page }) => table.setPageIndex(page - 1)}
        />
      </TableContainer>
      <MoveToPositionModal
        open={moveTarget !== null}
        resourceName={moveTarget?.resource.name}
        total={data.length}
        position={targetPosition}
        isValid={isTargetPositionValid}
        onPositionChange={setTargetPosition}
        onClose={closeMoveDialog}
        onSubmit={submitMoveDialog}
      />
      <RowDragOverlay
        activeRow={activeRow}
        viewport={viewport}
        reducedMotion={reducedMotion}
      />
    </DndContext>
  );
};
