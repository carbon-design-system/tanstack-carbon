import { Checkbox, RadioButton } from '@carbon/react';
import { useLabels } from '../contexts/labelsContext.jsx';

/**
 * Header selection component (checkbox only)
 */
export const SelectionHeader = ({ table, isCheckbox, tableId }) => {
  const labels = useLabels();

  if (!isCheckbox) {
    return (
      <span className="cds--visually-hidden">{labels.selectionColumnLabel || 'Selection'}</span>
    );
  }

  return (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      indeterminate={table.getIsSomePageRowsSelected()}
      onChange={table.getToggleAllPageRowsSelectedHandler()}
      id={`select-all-checkbox${tableId}`}
      labelText={labels.selectionSelectAllLabel}
      hideLabel={true}
    />
  );
};

/**
 * Row selection component (checkbox or radio)
 */
export const SelectionCell = ({ row, isCheckbox, isRadio, tableId }) => {
  if (isCheckbox) {
    return (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        indeterminate={row.getIsSomeSelected()}
        onChange={row.getToggleSelectedHandler()}
        id={`select-row-${tableId}-${row.id}`}
        labelText={`Select row ${row.id}`}
        hideLabel={true}
      />
    );
  }

  if (isRadio) {
    return (
      <RadioButton
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
        id={`select-row-${tableId}-${row.id}`}
        name={`table-radio-selection-${tableId}`}
        labelText={`Select row ${row.id}`}
        hideLabel={true}
        value={row.id}
      />
    );
  }

  return null;
};
