/* eslint-disable custom/hooks-first */
import { useState, useCallback, memo } from 'react';
import { Edit } from '@carbon/icons-react';
import { TableCell, TextInput } from '@carbon/react';
import { useLabels } from '../contexts/labelsContext.jsx';
import styles from './scss/editableCell.module.scss';

/**
 * EditableCell Component
 * Renders a table cell that can be edited inline
 * Based on TanStack's editable cells example
 *
 * @param {Object} tableContainerRef - Ref to the table container
 * @param {Object} table - TanStack table instance
 * @param {Object} cell - Cell instance from TanStack
 * @param {string} editingId - ID of the currently editing cell
 * @param {Function} setEditingId - Function to set editing cell ID
 * @param {string} id - Unique ID for this cell
 * @param {ReactNode} children - Cell content
 */
const EditableCell = ({
  tableContainerRef,
  table,
  cell,
  editingId,
  setEditingId,
  id,
  children,
  ...rest
}) => {
  const labels = useLabels();
  const [editValue, setEditValue] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const [invalidText, setInvalidText] = useState('');

  const validateFn = cell.column.columnDef.meta?.validate;

  const handleEditableCellKeyDown = useCallback(
    (event) => {
      if (event.code !== 'Enter') {
        return;
      }
      setEditingId(event.target.id);
      setInvalid(false);
      setInvalidText('');
    },
    [setEditingId]
  );

  const handleDoubleClick = useCallback(
    (event) => {
      setEditingId(event.currentTarget.id);
      setInvalid(false);
      setInvalidText('');
    },
    [setEditingId]
  );

  const handleEditModeKeyDown = useCallback(
    (event) => {
      if (event.code === 'Enter' || event.code === 'Escape') {
        const valueToSave = editValue ?? cell.getValue();

        // NOTE: If Escape, revert without validation
        if (event.code === 'Escape') {
          setEditingId(null);
          setInvalid(false);
          setInvalidText('');
          setEditValue(null);
          setTimeout(() => {
            const activeCell = tableContainerRef?.current?.querySelector(`#cell__${id}`);
            if (activeCell) {
              activeCell.tabIndex = 0;
              activeCell.focus();
            }
          }, 10);
          return;
        }

        if (validateFn) {
          const validationResult = validateFn(valueToSave);
          if (validationResult !== true) {
            setInvalid(true);
            setInvalidText(
              typeof validationResult === 'string' ? validationResult : 'Invalid value'
            );
            return; // NOTE: Don't save if invalid
          }
        }

        // NOTE: Save if valid
        table.options.meta?.updateData(cell.row.index, cell.column.id, valueToSave);
        setEditingId(null);
        setInvalid(false);
        setInvalidText('');
        setEditValue(null);
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
    [editValue, cell, validateFn, table.options.meta, setEditingId, tableContainerRef, id]
  );

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      setEditValue(newValue);

      // NOTE: Clear error on change
      if (invalid) {
        setInvalid(false);
        setInvalidText('');
      }
    },
    [invalid]
  );

  const handleBlur = useCallback(() => {
    // NOTE: If there's an error, revert to original value and clear error
    if (invalid) {
      setEditingId(null);
      setInvalid(false);
      setInvalidText('');
      setEditValue(null);
      return;
    }

    const valueToSave = editValue ?? cell.getValue();

    // NOTE: Validate on blur
    if (validateFn) {
      const validationResult = validateFn(valueToSave);
      if (validationResult !== true) {
        // NOTE: Don't save, just exit edit mode and revert
        setEditingId(null);
        setInvalid(false);
        setInvalidText('');
        setEditValue(null);
        return;
      }
    }

    // NOTE: Save cell data
    table.options.meta?.updateData(cell.row.index, cell.column.id, valueToSave);
    setEditingId(null);
    setInvalid(false);
    setInvalidText('');
    setEditValue(null);
  }, [invalid, editValue, cell, validateFn, table.options.meta, setEditingId]);

  const { style } = rest;

  return editingId === `cell__${id}` ? (
    <td
      className={styles.editingCell}
      style={{
        width: style?.width,
      }}
    >
      <TextInput
        className={styles.editableCellInput}
        id={`cell__${id}`}
        labelText={labels.editableCellLabel}
        hideLabel
        value={editValue ?? cell.getValue()}
        invalid={invalid}
        invalidText={invalidText}
        {...rest}
        autoFocus
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleEditModeKeyDown}
      />
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

export default memo(EditableCell);
