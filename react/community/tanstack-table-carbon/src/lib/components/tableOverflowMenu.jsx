import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { OverflowMenu } from '@carbon/react';

/**
 * TableOverflowMenu Component
 * A wrapper around Carbon's OverflowMenu that automatically adjusts direction
 * based on available viewport space to prevent menu cutoff.
 *
 * This component is specifically designed for use within table cells where
 * overflow menus near the bottom of the viewport need to open upward.
 *
 * @param {Object} props - All props are passed through to Carbon's OverflowMenu
 * @param {Function} props.onClick - Optional onClick handler (will be called after direction calculation)
 * @param {React.ReactNode} props.children - OverflowMenuItem components
 *
 * @example
 * import { TableOverflowMenu } from '@/components/tanstackTable';
 *
 * <TableOverflowMenu size="md" flipped>
 *   <OverflowMenuItem itemText="View Details" onClick={() => {}} />
 *   <OverflowMenuItem itemText="Edit" onClick={() => {}} />
 *   <OverflowMenuItem itemText="Delete" isDelete onClick={() => {}} />
 * </TableOverflowMenu>
 */
const TableOverflowMenu = ({ children, onClick, ...props }) => {
  const [direction, setDirection] = useState('bottom');

  /**
   * Handles click event and calculates optimal menu direction
   * Opens menu upward if there's insufficient space below
   */
  const handleClick = (event) => {
    const child = event.currentTarget;
    const childRect = child.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - childRect.bottom;

    // NOTE: If less than 250px space below, open menu upward
    setDirection(spaceBelow < 250 ? 'top' : 'bottom');

    // NOTE: Call original onClick handler if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <OverflowMenu {...props} direction={direction} onClick={handleClick}>
      {children}
    </OverflowMenu>
  );
};

TableOverflowMenu.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

export default TableOverflowMenu;
