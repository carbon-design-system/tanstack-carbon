/**
 * Get common pinning styles for sticky columns
 * @param {Object} column - TanStack column instance
 * @param {boolean} isHeader - Whether this is a header cell (true) or body cell (false)
 * @returns {Object} CSS styles for sticky column
 */
export const getCommonPinningStyles = (column, isHeader = false) => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinnedColumn =
    isPinned === 'right' && column.getIsFirstColumn('right');

  return {
    borderRight: isLastLeftPinnedColumn
      ? '1px solid var(--cds-border-subtle)'
      : 0,
    borderLeft: isFirstRightPinnedColumn
      ? '1px solid var(--cds-border-subtle)'
      : 0,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? 'sticky' : 'relative',
    /* NOTE: Only set explicit width when the developer defined a size on the column.
      TanStack defaults to 150 when no size is set — applying that blindly forces
      every pinned column to 150px even when the developer never specified a width. 
    */
    ...(column.columnDef?.size !== undefined && {
      width: `${column.getSize()}px`,
    }),
    zIndex: isPinned ? (isHeader ? 4 : 3) : 0,
    backgroundColor: isHeader ? 'var(--cds-layer-accent)' : 'null',
  };
};

/**
 * Process column pinning configuration
 * @param {Object} columnPinning - { left: ['col1'], right: ['col2'] }
 * @returns {Object} Processed column pinning state
 */
export const processColumnPinning = (columnPinning) => {
  if (!columnPinning) {
    return undefined;
  }

  return {
    left: columnPinning.left || [],
    right: columnPinning.right || [],
  };
};
