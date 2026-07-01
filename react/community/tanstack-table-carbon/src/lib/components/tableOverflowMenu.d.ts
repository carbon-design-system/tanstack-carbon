import { ReactNode, MouseEvent } from 'react';
import { OverflowMenuProps } from '@carbon/react';

export interface TableOverflowMenuProps extends Omit<OverflowMenuProps, 'direction'> {
  /** Child elements - typically OverflowMenuItem components */
  children: ReactNode;

  /** Optional click handler - called after automatic direction calculation */
  onClick?: (event: MouseEvent<HTMLElement>) => void;

  /** Size of the overflow menu button */
  size?: 'sm' | 'md' | 'lg';

  /** Whether the menu is flipped (icon rotated) */
  flipped?: boolean;

  /** Additional class name */
  className?: string;

  /** Aria label for accessibility */
  ariaLabel?: string;

  /** Icon description for accessibility */
  iconDescription?: string;
}

declare const TableOverflowMenu: React.FC<TableOverflowMenuProps>;

export default TableOverflowMenu;
