import { useState } from 'react';

/**
 * Custom hook to manage row expansion state and logic
 * @param {Object} tableRef - Ref containing TanStack table instance
 * @param {Function} onExpandedChange - Optional callback when expansion state changes
 * @returns {Object} Expansion state and handlers
 */
export const useRowExpansion = (tableRef, onExpandedChange) => {
  const [expanded, setExpanded] = useState({});
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const handleExpandedChange = (updater) => {
    const newExpanded = typeof updater === 'function' ? updater(expanded) : updater;
    setExpanded(newExpanded);

    if (onExpandedChange) {
      onExpandedChange(newExpanded);
    }
  };

  const toggleAllRows = () => {
    const table = tableRef?.current;
    const newExpandState = {};

    if (!table) {
      return;
    }

    if (!isAllExpanded) {
      table.getRowModel().rows.forEach((row) => {
        newExpandState[row.id] = true;
      });
      setIsAllExpanded(true);
    } else {
      setIsAllExpanded(false);
    }

    handleExpandedChange(newExpandState);
  };

  const toggleRow = (rowId) => {
    const isRowExpanded = !!expanded[rowId];
    const newExpansionState = { ...expanded, [rowId]: !isRowExpanded };
    handleExpandedChange(newExpansionState);
  };

  return {
    expanded,
    isAllExpanded,
    setExpanded: handleExpandedChange,
    toggleAllRows,
    toggleRow,
  };
};
