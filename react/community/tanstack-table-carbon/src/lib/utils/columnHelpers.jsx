import { ChevronRight } from '@carbon/icons-react';
import { SelectionHeader, SelectionCell } from '../components/selectionCell';
import styles from './columnHelpers.module.scss';

/**
 * Creates selection column configuration
 * @param {boolean} isCheckbox - Is checkbox selection
 * @param {boolean} isRadio - Is radio selection
 * @returns {Object} Column definition
 */
export const createSelectionColumn = (isCheckbox, isRadio, tableId) => ({
  id: 'select',
  size: 48,
  header: ({ table }) => <SelectionHeader table={table} isCheckbox={isCheckbox} tableId={tableId} />,
  cell: ({ row }) => <SelectionCell row={row} isCheckbox={isCheckbox} isRadio={isRadio} tableId={tableId} />,
  enableSorting: false,
  enableColumnFilter: false,
});

/**
 * Creates expand column configuration for row expansion
 * @param {Function} toggleRow - Function to toggle row expansion
 * @param {Function} toggleAllRows - Function to toggle all rows expansion
 * @param {boolean} isAllExpanded - Whether all rows are expanded
 * @returns {Object} Column definition
 */
export const createExpandColumn = (toggleRow, toggleAllRows, isAllExpanded) => ({
  id: 'expand',
  size: 48,
  header: () => (
    <button
      onClick={toggleAllRows}
      className={styles.expandButton}
      aria-label={isAllExpanded ? 'Collapse all rows' : 'Expand all rows'}
    >
      <ChevronRight
        size={16}
        className={`${styles.expandIcon} ${isAllExpanded ? styles.expandIconExpanded : styles.expandIconCollapsed}`}
      />
    </button>
  ),
  cell: ({ row }) => (
    <button
      onClick={() => toggleRow(row.id)}
      className={styles.expandButton}
      aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
    >
      <ChevronRight
        size={16}
        className={`${styles.expandIcon} ${row.getIsExpanded() ? styles.expandIconExpanded : styles.expandIconCollapsed}`}
      />
    </button>
  ),
  enableSorting: false,
  enableColumnFilter: false,
});

/**
 * Adds expand column to columns array if row expansion is enabled
 * @param {Array} columns - Original columns
 * @param {Object} expansion - Expansion state and handlers from useRowExpansion hook
 * @param {string} position - Position of expand column: 'first' (default), 'afterSelection', 'last'
 * @param {boolean} hasSelection - Whether selection column exists
 * @returns {Array} Columns with expand column if needed
 */
export const addExpandColumn = (columns, expansion, position = 'first', hasSelection = false) => {
  if (!expansion) {
    return columns;
  }

  const { toggleRow, toggleAllRows, isAllExpanded } = expansion;
  const expandColumn = createExpandColumn(toggleRow, toggleAllRows, isAllExpanded);

  if (position === 'last') {
    // NOTE: Add expand column at the end
    return [...columns, expandColumn];
  } else if (position === 'afterSelection' && hasSelection) {
    // NOTE: Add expand column after selection column (index 0 is selection)
    return [columns[0], expandColumn, ...columns.slice(1)];
  } else {
    // NOTE: Default: 'first' - add expand column at the beginning
    return [expandColumn, ...columns];
  }
};

/**
 * Enhances columns with smart filtering for formatted cells
 * Automatically adds filterFn for columns with cell formatters to search both raw and displayed values
 * @param {Array} columns - Original columns
 * @returns {Array} Enhanced columns with smart filtering
 */
export const enhanceColumnsWithSmartFiltering = (columns) => {
  return columns.map((column) => {
    // NOTE: Skip if column already has a custom filterFn
    if (column.filterFn) {
      return column;
    }

    // NOTE: If column has a cell formatter, add smart filtering
    if (column.cell && typeof column.cell === 'function') {
      return {
        ...column,
        filterFn: (row, columnId, filterValue) => {
          const rawValue = row.getValue(columnId);
          const searchTerm = String(filterValue).toLowerCase();

          // NOTE: Search in raw value
          if (String(rawValue).toLowerCase().includes(searchTerm)) {
            return true;
          }

          // NOTE: Try to get the formatted/displayed value
          try {
            // NOTE: Create a minimal mock for getValue to get formatted value
            const mockGetValue = () => rawValue;
            const formattedValue = column.cell({ getValue: mockGetValue, row });

            // NOTE: If formatted value is a React element, try to extract text content
            if (formattedValue && typeof formattedValue === 'object') {
              // NOTE: For React elements, we can't easily extract text, so skip
              return false;
            }

            // NOTE: Search in formatted value if it's a string
            if (formattedValue && typeof formattedValue === 'string') {
              return formattedValue.toLowerCase().includes(searchTerm);
            }
          } catch {
            // NOTE: If formatting fails, just use raw value (already checked above)
          }

          return false;
        },
      };
    }

    return column;
  });
};

/**
 * Adds selection column to columns array if needed
 * @param {Array} columns - Original columns
 * @param {string} selectionType - "checkbox", "radio", or null
 * @returns {Array} Columns with selection column if needed
 */
export const addSelectionColumn = (columns, selectionType, tableId = '') => {
  if (!selectionType) {
    return columns;
  }

  const isCheckbox = selectionType === 'checkbox';
  const isRadio = selectionType === 'radio';

  return [createSelectionColumn(isCheckbox, isRadio, tableId), ...columns];
};
