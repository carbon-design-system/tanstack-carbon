import React, { CSSProperties } from 'react';

import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  Row,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Checkbox,
  DataTable,
  Modal,
  NumberInput,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  TableContainer,
} from '@carbon/react';
import {
  ArrowDown,
  ArrowsVertical,
  ArrowUp,
  Download,
  Draggable,
  Save,
  TrashCan,
  type CarbonIconType,
} from '@carbon/react/icons';
import { durationModerate01, motion } from '@carbon/motion';
import cx from 'classnames';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const {
  Table,
  TableBatchAction,
  TableBatchActions,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
} = DataTable;

import { makeData, Resource } from './makeData';

const TOTAL_ITEMS = 25;
const PAGE_SIZE = 10;

// Carbon motion tokens; dnd-kit expects the duration in milliseconds.
const MOTION_DURATION = parseInt(durationModerate01, 10);
const MOTION_EASING = motion('standard', 'productive');

// Turns animations off when the user prefers reduced motion.
const usePrefersReducedMotion = () => {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = React.useState(
    () => window.matchMedia(query).matches
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return reduced;
};

// Visible part of the table (scroll container) and the full table width.
type TableViewport = {
  left: number;
  width: number;
  scrollLeft: number;
  tableWidth: number;
};

// Sticky styles for the right pinned column are in example.scss.
const getPinnedClassName = (column: Column<Resource>) =>
  column.getIsPinned() === 'right' ? 'draggable-rows__pinned-right' : undefined;

// Overflow menu item label with a decorative icon.
const MenuItemLabel = ({
  icon: Icon,
  children,
}: {
  icon: CarbonIconType;
  children: string;
}) => (
  <span className="draggable-rows__menu-item">
    <Icon size={16} aria-hidden />
    <span className="draggable-rows__menu-item-text">{children}</span>
  </span>
);

// `index` is the position in the whole list, not on the current page.
const RowActions = ({
  resource,
  index,
  total,
  onMove,
  onMoveToPosition,
}: {
  resource: Resource;
  index: number;
  total: number;
  onMove: (id: string, newIndex: number) => void;
  onMoveToPosition: (resource: Resource, index: number) => void;
}) => (
  <OverflowMenu
    size="sm"
    flipped
    autoAlign
    menuOptionsClass="draggable-rows__menu"
    aria-label={`Actions for ${resource.name}`}
    iconDescription={`Actions for ${resource.name}`}>
    <OverflowMenuItem
      itemText={<MenuItemLabel icon={ArrowUp}>Move up</MenuItemLabel>}
      disabled={index === 0}
      onClick={() => onMove(resource.id, index - 1)}
    />
    <OverflowMenuItem
      itemText={<MenuItemLabel icon={ArrowDown}>Move down</MenuItemLabel>}
      disabled={index === total - 1}
      onClick={() => onMove(resource.id, index + 1)}
    />
    <OverflowMenuItem
      itemText={
        <MenuItemLabel icon={ArrowsVertical}>
          Move to custom position
        </MenuItemLabel>
      }
      onClick={() => onMoveToPosition(resource, index)}
    />
  </OverflowMenu>
);

// Props that dnd-kit needs on the drag handle.
type HandleProps = {
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  attributes: ReturnType<typeof useSortable>['attributes'];
  listeners: ReturnType<typeof useSortable>['listeners'];
};

// The overlay copy gets its own checkbox, because ids must be unique.
const RowCells = ({
  row,
  overlay = false,
  handleProps,
}: {
  row: Row<Resource>;
  overlay?: boolean;
  handleProps?: HandleProps;
}) => (
  <>
    {row.getVisibleCells().map((cell) => {
      if (cell.column.id === 'drag-icon' && handleProps) {
        return (
          <TableCell
            key={cell.id}
            ref={handleProps.setActivatorNodeRef}
            className="draggable-row__handle"
            {...handleProps.attributes}
            {...handleProps.listeners}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      }
      return (
        <TableCell key={cell.id} className={getPinnedClassName(cell.column)}>
          {overlay && cell.column.id === 'select' ? (
            <Checkbox
              id={`select-row__${row.id}--overlay`}
              labelText="Select row"
              hideLabel
              checked={row.getIsSelected()}
              readOnly
              tabIndex={-1}
            />
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </TableCell>
      );
    })}
  </>
);

// Only the drag icon cell is the drag handle.
const DraggableRow = ({
  row,
  reducedMotion,
}: {
  row: Row<Resource>;
  reducedMotion: boolean;
}) => {
  const {
    attributes,
    listeners,
    transform,
    transition,
    setNodeRef,
    setActivatorNodeRef,
    isDragging,
    over,
  } = useSortable({
    id: row.original.id,
    // Keeps the cell semantics of the table (the default role is "button").
    attributes: { role: 'cell' },
    transition: reducedMotion
      ? null
      : { duration: MOTION_DURATION, easing: MOTION_EASING },
  });

  // The dragged row is over another row, so its slot moved.
  const isDropZone = isDragging && !!over && over.id !== row.original.id;

  return (
    <TableRow
      ref={setNodeRef}
      isSelected={row.getIsSelected()}
      aria-selected={row.getIsSelected()}
      className={cx('draggable-row', {
        'draggable-row--dragging': isDragging,
        'draggable-row--drop-zone': isDropZone,
      })}
      // dnd-kit computes these on every frame while dragging.
      style={{ transform: CSS.Translate.toString(transform), transition }}>
      <RowCells
        row={row}
        handleProps={{ setActivatorNodeRef, attributes, listeners }}
      />
    </TableRow>
  );
};

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
      <Modal
        open={moveTarget !== null}
        size="xs"
        modalHeading="Move to custom position"
        primaryButtonText="Move"
        secondaryButtonText="Cancel"
        primaryButtonDisabled={!isTargetPositionValid}
        onRequestClose={closeMoveDialog}
        onRequestSubmit={submitMoveDialog}>
        <NumberInput
          id="move-to-position"
          label={`Position of ${moveTarget?.resource.name ?? 'row'}`}
          helperText={`Enter a position from 1 to ${data.length}.`}
          invalidText={`Enter a whole number from 1 to ${data.length}.`}
          min={1}
          max={data.length}
          step={1}
          value={targetPosition}
          invalid={!isTargetPositionValid}
          allowEmpty
          onChange={(_event, { value }) =>
            setTargetPosition(value === '' ? NaN : Number(value))
          }
        />
      </Modal>
      <DragOverlay
        // Keeps the overlay inside the visible part of the table.
        style={viewport ? { left: viewport.left, width: viewport.width } : {}}
        dropAnimation={
          reducedMotion
            ? null
            : {
                duration: MOTION_DURATION,
                easing: MOTION_EASING,
                // Only the vertical movement is animated.
                keyframes: ({ transform }) => [
                  { transform: CSS.Transform.toString(transform.initial) },
                  {
                    transform: CSS.Transform.toString({
                      ...transform.final,
                      x: transform.initial.x,
                      scaleX: transform.initial.scaleX,
                      scaleY: transform.initial.scaleY,
                    }),
                  },
                ],
              }
        }>
        {activeRow ? (
          <div
            className="draggable-rows-overlay__viewport"
            style={
              viewport
                ? ({
                    '--draggable-rows-table-width': `${viewport.tableWidth}px`,
                  } as CSSProperties)
                : {}
            }
            ref={(element) => {
              // Same scroll position as the table in the page.
              const scroller = element?.querySelector(
                '.cds--data-table-content'
              );
              if (scroller && viewport) {
                scroller.scrollLeft = viewport.scrollLeft;
              }
            }}>
            <Table className="draggable-rows-overlay">
              <TableBody>
                <TableRow className="draggable-row">
                  <RowCells row={activeRow} overlay />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
