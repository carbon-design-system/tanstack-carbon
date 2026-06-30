import { useState, memo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Checkbox, Search, Modal, ModalBody, Layer } from '@carbon/react';
import { useLabels } from '../contexts/labelsContext.jsx';
import styles from './scss/columnCustomizationPanel.module.scss';
import SortableColumnItem from './sortableColumnItem';

const ColumnCustomizationPanel = ({
  open,
  columns,
  columnOrder,
  columnVisibility,
  onClose,
  onApply,
  onToggleVisibility,
  onReorder,
}) => {
  const labels = useLabels();
  const [searchTerm, setSearchTerm] = useState('');

  // NOTE: Configure sensors with activation constraint for smoother dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // NOTE: Require 8px movement before drag starts
      },
    })
  );

  // NOTE: Filter out utility columns (selection, expand) and columns marked as non-customizable
  const customizableColumns = columns.filter(
    (col) =>
      col.id !== 'select' &&
      col.id !== 'selection' &&
      col.id !== 'expand' &&
      col.columnDef.meta?.showInColumnCustomization !== false
  );

  // NOTE: Get ordered columns based on columnOrder (excluding selection column)
  const orderedColumns = columnOrder
    .map((colId) => customizableColumns.find((col) => col.id === colId))
    .filter(Boolean);

  // NOTE: Filter columns based on search term
  const filteredColumns = orderedColumns.filter((column) => {
    const header =
      typeof column.columnDef.header === 'function'
        ? column.id
        : column.columnDef.header || column.id;
    return header.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // NOTE: Check if all filtered columns (excluding pinned) are visible
  const allVisible = filteredColumns
    .filter((col) => !col.getIsPinned())
    .every((col) => columnVisibility[col.id] !== false);

  // NOTE: Count visible columns (from all columns, not just filtered)
  const visibleColumnsCount = orderedColumns.filter(
    (col) => columnVisibility[col.id] !== false
  ).length;

  // NOTE: Total customizable columns count
  const totalColumnsCount = orderedColumns.length;

  // NOTE: Handle select all / deselect all (only for filtered columns, excluding pinned)
  const handleToggleAll = () => {
    filteredColumns.forEach((col) => {
      // NOTE: Skip pinned columns
      if (col.getIsPinned()) {
        return;
      }

      if (allVisible) {
        // NOTE: Deselect all
        if (columnVisibility[col.id] !== false) {
          onToggleVisibility(col.id);
        }
      } else {
        // NOTE: Select all
        if (columnVisibility[col.id] === false) {
          onToggleVisibility(col.id);
        }
      }
    });
  };

  // NOTE: Handle drag end with @dnd-kit
  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      // NOTE: Check if the target column (over) is pinned
      const targetColumn = customizableColumns.find((col) => col.id === over.id);
      const isPinnedTarget = targetColumn?.getIsPinned();

      // NOTE: Prevent dropping on pinned columns
      if (isPinnedTarget) {
        return;
      }

      const oldIndex = columnOrder.findIndex((id) => id === active.id);
      const newIndex = columnOrder.findIndex((id) => id === over.id);

      const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  const handleClose = () => {
    // NOTE: Remove focus from any element inside the tearsheet before closing
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onClose();
  };

  const handleApply = () => {
    // NOTE: Remove focus before closing
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onApply();
  };

  return (
    <Modal
      className={styles.colSettingModal}
      open={open}
      onRequestClose={handleClose}
      modalHeading={labels.columnCustomizationHeading
        .replace('{visible}', visibleColumnsCount)
        .replace('{total}', totalColumnsCount)}
      modalLabel={labels.columnCustomizationLabel}
      primaryButtonText={labels.columnCustomizationApplyButton}
      secondaryButtonText={labels.columnCustomizationCancelButton}
      onRequestSubmit={handleApply}
      size="sm"
    >
      <ModalBody className="colSettingBody">
        <p className={styles.description}>{labels.columnCustomizationDescription}</p>

        {/* NOTE: Search Component */}
        <Layer level={1}>
          <Search
            size="lg"
            placeholder={labels.columnCustomizationSearchPlaceholder}
            labelText={labels.columnCustomizationSearchLabel}
            closeButtonLabelText={labels.columnCustomizationClearSearchTooltip}
            id="column-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
          />
        </Layer>
        {/* NOTE: Select All Checkbox */}
        <div className={styles.selectAllContainer}>
          <Checkbox
            id="select-all-columns"
            labelText={labels.columnCustomizationSelectAllLabel}
            checked={allVisible}
            indeterminate={
              !allVisible && filteredColumns.some((col) => columnVisibility[col.id] !== false)
            }
            onChange={handleToggleAll}
          />
        </div>

        <div className={styles.columnsContainer}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredColumns.map((col) => col.id)}
              strategy={verticalListSortingStrategy}
              disabled={searchTerm !== ''}
            >
              {filteredColumns.map((column) => {
                const isPinned = column.getIsPinned();
                return (
                  <SortableColumnItem
                    key={column.id}
                    column={column}
                    columnVisibility={columnVisibility}
                    onToggleVisibility={onToggleVisibility}
                    isPinned={isPinned}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default memo(ColumnCustomizationPanel);
