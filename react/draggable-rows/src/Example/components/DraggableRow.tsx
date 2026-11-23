import { flexRender, Row } from '@tanstack/react-table';
import { Checkbox, DataTable } from '@carbon/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import cx from 'classnames';

import { MOTION_DURATION, MOTION_EASING } from '../constants';
import { Resource } from '../makeData';
import { getPinnedClassName } from '../utils';

const { TableCell, TableRow } = DataTable;

// Props that dnd-kit needs on the drag handle.
type HandleProps = {
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  attributes: ReturnType<typeof useSortable>['attributes'];
  listeners: ReturnType<typeof useSortable>['listeners'];
};

// The overlay copy gets its own checkbox, because ids must be unique.
export const RowCells = ({
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
export const DraggableRow = ({
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
