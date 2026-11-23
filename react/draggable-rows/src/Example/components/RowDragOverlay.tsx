import { CSSProperties } from 'react';

import { Row } from '@tanstack/react-table';
import { DataTable } from '@carbon/react';
import { DragOverlay } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { MOTION_DURATION, MOTION_EASING } from '../constants';
import { Resource } from '../makeData';
import { RowCells } from './DraggableRow';

const { Table, TableBody, TableRow } = DataTable;

// Visible part of the table (scroll container) and the full table width.
export type TableViewport = {
  left: number;
  width: number;
  scrollLeft: number;
  tableWidth: number;
};

// Copy of the dragged row that follows the pointer.
export const RowDragOverlay = ({
  activeRow,
  viewport,
  reducedMotion,
}: {
  activeRow?: Row<Resource>;
  viewport: TableViewport | null;
  reducedMotion: boolean;
}) => (
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
          const scroller = element?.querySelector('.cds--data-table-content');
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
);
