import { Column } from '@tanstack/react-table';

import { Resource } from './makeData';

// Sticky styles for the right pinned column are in example.scss.
export const getPinnedClassName = (column: Column<Resource>) =>
  column.getIsPinned() === 'right' ? 'draggable-rows__pinned-right' : undefined;
