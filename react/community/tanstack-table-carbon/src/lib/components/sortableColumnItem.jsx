import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Draggable as DraggableIcon, Locked } from '@carbon/icons-react';
import { Checkbox } from '@carbon/react';
import styles from './scss/columnCustomizationPanel.module.scss';

const SortableColumnItem = ({
  column,
  columnVisibility,
  onToggleVisibility,
  isPinned = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    disabled: isPinned, // Disable dragging for pinned columns
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const header =
    typeof column.columnDef.header === 'function'
      ? column.id
      : column.columnDef.header || column.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!isPinned ? listeners : {})} // Only apply listeners if not pinned
      className={`${styles.columnItem} ${isDragging ? styles.dragging : ''} ${
        isPinned ? styles.pinned : ''
      }`}>
      {isPinned ? (
        <Locked size={20} className={`${styles.dragIcon} ${styles.disabled}`} />
      ) : (
        <DraggableIcon size={20} className={styles.dragIcon} />
      )}
      <Checkbox
        id={`column-${column.id}`}
        labelText={header}
        checked={columnVisibility[column.id] !== false}
        onChange={() => onToggleVisibility(column.id)}
        disabled={isPinned}
      />
    </div>
  );
};

export default SortableColumnItem;
