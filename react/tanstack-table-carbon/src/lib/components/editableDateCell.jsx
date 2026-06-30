import { useRef, useCallback, memo } from 'react';
import { Edit } from '@carbon/icons-react';
import { TableCell, DatePicker, DatePickerInput } from '@carbon/react';
import { useLabels } from '../contexts/labelsContext.jsx';
import styles from './scss/editableCell.module.scss';

const DATE_PICKER_FORMAT = 'Y-m-d';

const EditableDateCell = ({
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
  const datePickerRef = useRef(null);

  const enterEditMode = useCallback(
    (cellId) => {
      setEditingId(cellId);

      // NOTE: Auto-open calendar after entering edit mode
      setTimeout(() => {
        const input = datePickerRef.current?.querySelector(`#datepicker__${id}`);
        if (input) {
          input.click();
        }
      }, 200);
    },
    [setEditingId, id]
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

  const handleSave = useCallback(
    (value) => {
      if (!value) {
        return;
      }

      table.options.meta?.updateData(cell.row.index, cell.column.id, value);
      setEditingId(null);

      setTimeout(() => {
        const activeCell = tableContainerRef?.current?.querySelector(`#cell__${id}`);
        if (activeCell) {
          activeCell.tabIndex = 0;
          activeCell.focus();
        }
      }, 10);
    },
    [table.options.meta, cell.row.index, cell.column.id, setEditingId, tableContainerRef, id]
  );

  const handleBlur = useCallback(
    (event) => {
      const nextFocusedElement = event.relatedTarget;
      const isFocusWithinDatePicker = datePickerRef.current?.contains(nextFocusedElement);

      if (!isFocusWithinDatePicker) {
        setEditingId(null);
      }
    },
    [setEditingId]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.code === 'Escape') {
        setEditingId(null);
        setTimeout(() => {
          const activeCell = tableContainerRef?.current?.querySelector(`#cell__${id}`);
          if (activeCell) {
            activeCell.tabIndex = 0;
            activeCell.focus();
          }
        }, 10);
      }
    },
    [setEditingId, tableContainerRef, id]
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
      <div ref={datePickerRef}>
        <DatePicker
          className={styles.editableCellDatePicker}
          datePickerType="single"
          dateFormat={DATE_PICKER_FORMAT}
          value={currentValue || ''}
          onChange={(selectedDates, dateStr) => handleSave(dateStr)}
          appendTo={datePickerRef.current || undefined}
        >
          <DatePickerInput
            id={`datepicker__${id}`}
            labelText={labels.editableDateCellLabel}
            hideLabel
            placeholder={labels.editableDateCellPlaceholder}
            autoFocus
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        </DatePicker>
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

export default memo(EditableDateCell);
