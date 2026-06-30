import { useState, useRef, useEffect } from 'react';
import { useKeyPress } from './useKeyPress';

/**
 * useEditableCell Hook
 * Manages editable cell state and keyboard navigation
 * Based on TanStack's editable cells example
 *
 * @param {Object} tableContainerRef - Ref to the table container
 * @returns {Object} - Editable cell state and handlers
 */
export const useEditableCell = (tableContainerRef) => {
  const [editingId, setEditingId] = useState(null);
  const commandLeft = useKeyPress(['Meta+ArrowLeft']);
  const captureCommandLeft = useRef(false);

  useEffect(() => {
    captureCommandLeft.current = commandLeft;
  }, [commandLeft]);

  const removeActiveCell = () => {
    if (editingId) {
      return;
    }
    const allTableCells = tableContainerRef.current?.querySelectorAll('td');
    allTableCells?.forEach((cell) => {
      cell.tabIndex = -1;
    });
    document.activeElement?.blur();
  };

  const getActiveCell = () => {
    const activeCellElement = tableContainerRef.current?.querySelector('td[tabindex="0"]');
    return activeCellElement;
  };

  const addActiveCell = (target) => {
    if (editingId) {
      return;
    }
    const activeCell = target.closest('td');
    if (activeCell) {
      activeCell.tabIndex = 0;
      activeCell.focus();
    }
  };

  const handleFocusChange = (event) => {
    if (tableContainerRef?.current) {
      const tableBody = tableContainerRef?.current.querySelector('tbody');
      if (!tableBody?.contains(event.target)) {
        return;
      }
    }
    removeActiveCell();
    addActiveCell(event.target);
  };

  const getChildElementIndex = (node) => {
    return Array.prototype.indexOf.call(node.parentNode.children, node);
  };

  const handleKeyDownActiveCell = (event) => {
    const key = event.code;
    const activeCellElement = getActiveCell();

    if (commandLeft) {
      return;
    }

    if (!activeCellElement) {
      return;
    }

    switch (key) {
      case 'ArrowLeft': {
        // NOTE: Prevent scrolling
        event.preventDefault();
        if (activeCellElement.previousElementSibling) {
          removeActiveCell();
          addActiveCell(activeCellElement.previousElementSibling);
        }
        return;
      }
      case 'ArrowRight': {
        // NOTE: Prevent scrolling
        event.preventDefault();
        if (activeCellElement.nextElementSibling) {
          removeActiveCell();
          addActiveCell(activeCellElement.nextElementSibling);
        }
        return;
      }
      case 'ArrowUp': {
        // NOTE: Prevent scrolling
        event.preventDefault();
        const parentRow = activeCellElement.closest('tr');
        const activeCellRowIndex = getChildElementIndex(activeCellElement);
        if (parentRow.previousElementSibling) {
          const newParentRow = parentRow.previousElementSibling;
          const newRowCells = newParentRow.children;
          removeActiveCell();
          addActiveCell(newRowCells[activeCellRowIndex]);
        }
        return;
      }
      case 'ArrowDown': {
        // NOTE: Prevent scrolling
        event.preventDefault();
        const parentRow = activeCellElement.closest('tr');
        const activeCellRowIndex = getChildElementIndex(activeCellElement);
        if (parentRow.nextElementSibling) {
          const newParentRow = parentRow.nextElementSibling;
          const newRowCells = newParentRow.children;
          removeActiveCell();
          addActiveCell(newRowCells[activeCellRowIndex]);
        }
        return;
      }
      case 'Tab': {
        removeActiveCell();
        return;
      }
      case 'Enter': {
        return;
      }
    }
  };

  return {
    editingId,
    setEditingId,
    commandLeft,
    handleFocusChange,
    handleKeyDownActiveCell,
  };
};
