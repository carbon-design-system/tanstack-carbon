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
    /* NOTE: Pinned (sticky) columns always need an explicit width and min-width so that:
      1. The cell does not grow/shrink with its content — sticky cells must be fixed-size.
      2. column.getStart('left') / column.getAfter('right') stay accurate — TanStack
         computes those offsets from column.getSize(), so the DOM width and TanStack's
         internal value must agree. If the DOM width is content-driven, the next pinned
         column's left/right offset will be wrong (overlap or gap).
      When no size is set by the developer, column.getSize() returns TanStack's default
      of 150px — a known fixed value that keeps offsets correct.
    */
    ...(isPinned && {
      width: `${column.getSize()}px`,
      minWidth: `${column.getSize()}px`,
    }),
    zIndex: isPinned ? (isHeader ? 4 : 3) : 0,
    ...(isHeader && isPinned && { backgroundColor: 'var(--cds-layer-accent)' }),
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
