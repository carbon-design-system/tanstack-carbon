import { useState, useEffect } from 'react';

/**
 * Custom hook to manage column visibility and order customization
 * @param {Object} table - TanStack table instance
 * @param {Function} onColumnOrderChange - Optional callback when column order changes
 * @param {Function} onColumnVisibilityChange - Optional callback when column visibility changes
 * @returns {Object} Column customization state and handlers
 */
export const useColumnCustomization = (table, onColumnOrderChange, onColumnVisibilityChange) => {
  const [showCustomizePanel, setShowCustomizePanel] = useState(false);
  const [tempColumnOrder, setTempColumnOrder] = useState([]);
  const [tempColumnVisibility, setTempColumnVisibility] = useState({});

  // NOTE: Initialize temp states when panel opens
  useEffect(() => {
    if (showCustomizePanel && table) {
      const allColumns = table.getAllLeafColumns();
      setTempColumnOrder(allColumns.map((col) => col.id));

      const visibilityState = {};
      allColumns.forEach((col) => {
        visibilityState[col.id] = col.getIsVisible();
      });
      setTempColumnVisibility(visibilityState);
    }
  }, [showCustomizePanel]);

  const openCustomizePanel = () => {
    setShowCustomizePanel(true);
  };

  const closeCustomizePanel = () => {
    setShowCustomizePanel(false);
  };

  const applyCustomization = () => {
    // NOTE: Apply column order
    if (tempColumnOrder.length > 0) {
      table.setColumnOrder(tempColumnOrder);
      if (onColumnOrderChange) {
        onColumnOrderChange(tempColumnOrder);
      }
    }

    // NOTE: Apply column visibility - use table.setColumnVisibility to update the state properly
    table.setColumnVisibility(tempColumnVisibility);

    if (onColumnVisibilityChange) {
      onColumnVisibilityChange(tempColumnVisibility);
    }

    setShowCustomizePanel(false);
  };

  const toggleColumnVisibility = (columnId) => {
    setTempColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const reorderColumns = (newOrder) => {
    setTempColumnOrder(newOrder);
  };

  return {
    showCustomizePanel,
    tempColumnOrder,
    tempColumnVisibility,
    openCustomizePanel,
    closeCustomizePanel,
    applyCustomization,
    toggleColumnVisibility,
    reorderColumns,
  };
};
