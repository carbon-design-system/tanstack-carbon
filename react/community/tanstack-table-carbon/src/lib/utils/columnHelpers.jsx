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
  header: ({ table }) => (
    <SelectionHeader table={table} isCheckbox={isCheckbox} tableId={tableId} />
  ),
  cell: ({ row }) => (
    <SelectionCell
      row={row}
      isCheckbox={isCheckbox}
      isRadio={isRadio}
      tableId={tableId}
    />
  ),
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
export const createExpandColumn = (
  toggleRow,
  toggleAllRows,
  isAllExpanded
) => ({
  id: 'expand',
  size: 48,
  header: () => (
    <button
      onClick={toggleAllRows}
      className={styles.expandButton}
      aria-label={isAllExpanded ? 'Collapse all rows' : 'Expand all rows'}>
      <ChevronRight
        size={16}
        className={`${styles.expandIcon} ${
          isAllExpanded ? styles.expandIconExpanded : styles.expandIconCollapsed
        }`}
      />
    </button>
  ),
  cell: ({ row }) => (
    <button
      onClick={() => toggleRow(row.id)}
      className={styles.expandButton}
      aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}>
      <ChevronRight
        size={16}
        className={`${styles.expandIcon} ${
          row.getIsExpanded()
            ? styles.expandIconExpanded
            : styles.expandIconCollapsed
        }`}
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
export const addExpandColumn = (
  columns,
  expansion,
  position = 'first',
  hasSelection = false
) => {
  if (!expansion) {
    return columns;
  }

  const { toggleRow, toggleAllRows, isAllExpanded } = expansion;
  const expandColumn = createExpandColumn(
    toggleRow,
    toggleAllRows,
    isAllExpanded
  );

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

    const filterVariant = column.meta?.filterVariant;

    // NOTE: Date range filter — filterValue is { start: Date, end: Date } from Carbon DatePicker.
    // Raw value is read from row.original[accessorKey] — supports plain ISO dates ("2024-03-15")
    // and full ISO timestamps ("2024-03-15T00:00:00+00:00"). split('T')[0] strips the time/
    // timezone component before parsing so the local calendar date is always used correctly.
    if (filterVariant === 'dateRange') {
      return {
        ...column,
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue || (!filterValue.start && !filterValue.end)) {
            return true;
          }
          const accessorKey = column.accessorKey ?? columnId;
          const raw = row.original[accessorKey];
          if (!raw) {
            return false;
          }
          const [y, m, d] = String(raw).split('T')[0].split('-').map(Number);
          const rowTime = new Date(y, m - 1, d).getTime();
          const startTime = filterValue.start
            ? new Date(filterValue.start).setHours(0, 0, 0, 0)
            : -Infinity;
          const endTime = filterValue.end
            ? new Date(filterValue.end).setHours(23, 59, 59, 999)
            : Infinity;
          return rowTime >= startTime && rowTime <= endTime;
        },
      };
    }

    // NOTE: Single date filter — filterValue is a Date object from Carbon DatePicker.
    // Raw value is read from row.original[accessorKey] — supports plain ISO dates ("2024-03-15")
    // and full ISO timestamps ("2024-03-15T00:00:00+00:00"). split('T')[0] strips the time/
    // timezone component before parsing so the local calendar date is always used correctly.
    if (filterVariant === 'date') {
      return {
        ...column,
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue) {
            return true;
          }
          const accessorKey = column.accessorKey ?? columnId;
          const raw = row.original[accessorKey];
          if (!raw) {
            return false;
          }
          const [y, m, d] = String(raw).split('T')[0].split('-').map(Number);
          const rowTime = new Date(y, m - 1, d).setHours(0, 0, 0, 0);
          const filterTime = new Date(filterValue).setHours(0, 0, 0, 0);
          return rowTime === filterTime;
        },
      };
    }

    // NOTE: Slider filter — filterValue is { min, max }.
    // Raw column value is a number. Pass if min <= value <= max.
    if (filterVariant === 'slider') {
      return {
        ...column,
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue) {
            return true;
          }
          const raw = Number(row.getValue(columnId));
          if (isNaN(raw)) {
            return true;
          }
          const min =
            filterValue.min !== undefined ? Number(filterValue.min) : -Infinity;
          const max =
            filterValue.max !== undefined ? Number(filterValue.max) : Infinity;
          return raw >= min && raw <= max;
        },
      };
    }

    // NOTE: Number filter — filterValue is the exact number (or empty string) from the
    // NumberInput. When empty, all rows pass. When set, only rows whose numeric column
    // value equals the entered number are shown.
    if (filterVariant === 'number') {
      return {
        ...column,
        filterFn: (row, columnId, filterValue) => {
          if (
            filterValue === '' ||
            filterValue === undefined ||
            filterValue === null
          ) {
            return true;
          }
          const raw = row.getValue(columnId);
          return Number(raw) === Number(filterValue);
        },
      };
    }

    // NOTE: Radio / select filter — filterValue is one exact option from the column's unique
    // values. The default string filter uses "includes", so "Male" would also match "Female".
    if (filterVariant === 'radio' || filterVariant === 'select') {
      return {
        ...column,
        filterFn: (row, columnId, filterValue) => {
          if (filterValue === '' || filterValue === undefined || filterValue === null) {
            return true;
          }
          return String(row.getValue(columnId)) === String(filterValue);
        },
      };
    }

    // NOTE: Time filter — filterValue is a string like "09:30 AM".
    // Raw column value is typically "09:30" (HH:MM, no period).
    // Match if the raw value is contained within the filter string or vice-versa.
    if (filterVariant === 'time') {
      return {
        ...column,
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue) {
            return true;
          }
          const raw = String(row.getValue(columnId) ?? '')
            .toLowerCase()
            .trim();
          const filter = String(filterValue).toLowerCase().trim();
          if (!raw) {
            return false;
          }
          return filter.includes(raw) || raw.includes(filter);
        },
      };
    }

    // NOTE: For columns with a cell formatter — add smart filtering that searches
    // both the raw value and the formatted string value (if cell returns a string).
    if (column.cell && typeof column.cell === 'function') {
      return {
        ...column,
        filterFn: (row, columnId, filterValue) => {
          const rawValue = row.getValue(columnId);
          const searchTerm = String(filterValue).toLowerCase();

          if (String(rawValue).toLowerCase().includes(searchTerm)) {
            return true;
          }

          try {
            const formattedValue = column.cell({
              getValue: () => rawValue,
              row,
            });
            if (formattedValue && typeof formattedValue === 'object') {
              return false;
            }
            if (formattedValue && typeof formattedValue === 'string') {
              return formattedValue.toLowerCase().includes(searchTerm);
            }
          } catch {
            // ignore
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
