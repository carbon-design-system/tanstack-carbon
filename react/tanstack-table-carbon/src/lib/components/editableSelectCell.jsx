import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Edit } from '@carbon/icons-react';
import { TableCell, Dropdown } from '@carbon/react';
import styles from './scss/editableCell.module.scss';

/**
 * EditableSelectCell Component
 * Renders a table cell with dropdown/select for editing
 * Based on TanStack's editable cells example
 *
 * @param {Object} tableContainerRef - Ref to the table container
 * @param {Object} table - TanStack table instance
 * @param {Object} cell - Cell instance from TanStack
 * @param {string} editingId - ID of the currently editing cell
 * @param {Function} setEditingId - Function to set editing cell ID
 * @param {string} id - Unique ID for this cell
 * @param {Array} options - Array of options for the dropdown
 * @param {ReactNode} children - Cell content
 */
const EditableSelectCell = ({
  tableContainerRef,
  table,
  cell,
  editingId,
  setEditingId,
  id,
  options = [],
  children,
  ...rest
}) => {
  const dropdownRef = useRef(null);
  const [dropdownDirection, setDropdownDirection] = useState('bottom');

  useEffect(() => {
    if (editingId !== `cell__${id}`) {
      return;
    }

    const updateDropdownDirection = () => {
      const dropdownNode = dropdownRef.current;
      const scrollContainer =
        tableContainerRef?.current?.querySelector('.cds--data-table-content') ||
        tableContainerRef?.current;

      if (!dropdownNode || !scrollContainer) {
        return;
      }

      const dropdownRect = dropdownNode.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const estimatedMenuHeight = Math.min(Math.max(options.length, 1) * 40 + 16, 240);
      const availableBelow = containerRect.bottom - dropdownRect.bottom;
      const availableAbove = dropdownRect.top - containerRect.top;

      setDropdownDirection(
        availableBelow < estimatedMenuHeight && availableAbove > availableBelow ? 'top' : 'bottom'
      );
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setEditingId(null);
      }
    };

    updateDropdownDirection();
    window.addEventListener('resize', updateDropdownDirection);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', updateDropdownDirection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingId, id, options.length, tableContainerRef]);

  const enterEditMode = useCallback(
    (cellId) => {
      setEditingId(cellId);

      // NOTE: Auto-focus and open dropdown after entering edit mode so keyboard navigation works
      setTimeout(() => {
        const button = dropdownRef.current?.querySelector('.cds--list-box__field');
        if (button) {
          button.focus();
          button.click();
        }
      }, 200);
    },
    [setEditingId]
  );

  const handleKeyDownCapture = useCallback(
    (event) => {
      if (event.code === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setEditingId(null);
        setTimeout(() => {
          const activeCell = tableContainerRef?.current?.querySelector(`#cell__${id}`);
          if (activeCell) {
            activeCell.tabIndex = 0;
            activeCell.focus();
          }
        }, 100);
      }
    },
    [setEditingId, tableContainerRef, id]
  );

  const handleEditableCellKeyDown = useCallback(
    (event) => {
      if (event.code !== 'Enter') {
        return;
      }
      enterEditMode(event.target.id);
    },
    [enterEditMode]
  );

  const handleDoubleClick = useCallback(
    (event) => {
      enterEditMode(event.currentTarget.id);
    },
    [enterEditMode]
  );

  const handleSelectChange = useCallback(
    ({ selectedItem }) => {
      if (selectedItem) {
        const value = selectedItem.id || selectedItem;
        table.options.meta?.updateData(cell.row.index, cell.column.id, value);
        setEditingId(null);
        // NOTE: Refocus the cell after saving
        setTimeout(() => {
          const activeCell = tableContainerRef?.current?.querySelector(`#cell__${id}`);
          if (activeCell) {
            activeCell.tabIndex = 0;
            activeCell.focus();
          }
        }, 10);
      }
    },
    [table.options.meta, cell.row.index, cell.column.id, setEditingId, tableContainerRef, id]
  );

  const { style } = rest;
  const currentValue = cell.getValue();

  return editingId === `cell__${id}` ? (
    <td
      className={styles.editingCell}
      style={{
        width: style?.width,
      }}
    >
      <div ref={dropdownRef} onKeyDownCapture={handleKeyDownCapture}>
        <Dropdown
          className={styles.editableCellDropdown}
          id={`dropdown__${id}`}
          titleText=""
          label={currentValue}
          items={options.map((opt) => (typeof opt === 'string' ? { id: opt, label: opt } : opt))}
          itemToString={(item) => (item ? item.label || item.id : '')}
          selectedItem={
            typeof currentValue === 'string'
              ? { id: currentValue, label: currentValue }
              : currentValue
          }
          onChange={handleSelectChange}
          size="sm"
          direction={dropdownDirection}
        />
      </div>
    </td>
  ) : (
    <TableCell
      id={`cell__${id}`}
      onKeyDown={handleEditableCellKeyDown}
      onDoubleClick={handleDoubleClick}
      className={styles['editable-cell']}
      {...rest}
    >
      <div className={styles.editableCellContent}>
        {children}
        <Edit size={16} className={styles.editableCellIcon} />
      </div>
    </TableCell>
  );
};

export default memo(EditableSelectCell);
