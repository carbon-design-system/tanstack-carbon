import { useState, useEffect } from 'react';

/**
 * Custom hook to manage table selection logic
 * @param {Object} table - TanStack table instance
 * @param {string} selectionType - "checkbox", "radio", or null
 * @param {Function} onSelectionChange - Callback when selection changes
 * @returns {Object} Selection state and helpers
 */
export const useTableSelection = (tableRef, selectionType, onSelectionChange) => {
  const [rowSelection, setRowSelection] = useState({});

  const enableSelection = selectionType === 'checkbox' || selectionType === 'radio';
  const isCheckbox = selectionType === 'checkbox';
  const isRadio = selectionType === 'radio';

  const selectedCount = Object.keys(rowSelection).length;
  const shouldShowBatchActions = selectedCount > 0;

  // NOTE: Notify parent of selection changes
  useEffect(() => {
    const table = tableRef?.current;
    if (onSelectionChange && enableSelection && table?.getSelectedRowModel) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, enableSelection, tableRef]);

  return {
    rowSelection,
    setRowSelection,
    enableSelection,
    isCheckbox,
    isRadio,
    selectedCount,
    shouldShowBatchActions,
  };
};
