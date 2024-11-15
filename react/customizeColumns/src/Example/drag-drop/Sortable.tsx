/**
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { px } from '@carbon/layout';
import { Checkbox } from '@carbon/react';
import { Draggable } from '@carbon/react/icons';
import { SortableItem } from './SortableItem';
import { ListContainer } from './ListContainer';
import { Underlay } from './Underlay';

// Dnd kit imports
/* ************************ */
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
/* ************************ */

export const Sortable = ({
  type = 'vertical',
  sortableProps = {},
  Container = ListContainer,
  useDragOverlay = true,
  wrapperStyle,
  strategy,
  withGrid = false,
  gridGap = px(12),
  includeUnderlay = true,
  modifiers = [],
  dragItems = [],
  onDragEnd,
  originalColumns,
  visibleColumns,
  onVisibilityChange,
  active,
  ...args
}) => {
  const [tempVisible, setTempVisible] = useState(visibleColumns);
  const [items, setItems] = useState<any>();
  const [activeId, setActiveId] = useState(null);
  const getIndex = (id) => items.indexOf(id);

  useEffect(() => {
    setItems(dragItems);
  }, [dragItems]);

  const activeIndex = activeId ? getIndex(activeId) : -1;

  const draggableClass = `c4p__draggable-item`;
  const pointerSensor = useSensor(PointerSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 4,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: (event, args) => {
      // Only add keyboard events when sortable component is active (ie tearsheet is open)
      if (!active) {
        return;
      }
      const { currentCoordinates } = args;

      let target = event.target as HTMLElement;

      while (target && !target.classList.contains(draggableClass)) {
        target = target.parentNode as HTMLElement;
      }

      const gapValue = withGrid ? parseInt(gridGap) : 0;

      const delta =
        type !== 'horizontal'
          ? target.offsetHeight + gapValue
          : target.offsetWidth + gapValue;

      switch (event.code) {
        case 'ArrowRight': {
          if (type === 'horizontal' || withGrid) {
            return { ...currentCoordinates, x: currentCoordinates.x + delta };
          }
          return currentCoordinates;
        }
        case 'ArrowLeft': {
          if (type === 'horizontal' || withGrid) {
            return { ...currentCoordinates, x: currentCoordinates.x - delta };
          }
          // ignore right and left
          return currentCoordinates;
        }
        case 'ArrowUp':
          if (type === 'horizontal') {
            return currentCoordinates;
          }
          return { ...currentCoordinates, y: currentCoordinates.y - delta };
        case 'ArrowDown':
          if (type === 'horizontal') {
            return currentCoordinates;
          }
          return { ...currentCoordinates, y: currentCoordinates.y + delta };
        case 'Space':
          break;
      }
    },
  });

  const handleDragEnd = ({ over }) => {
    setActiveId(null);

    if (over) {
      const overIndex = getIndex(over.id);
      if (activeIndex !== overIndex) {
        setItems((items) => {
          arrayMove(items, activeIndex, overIndex);
          onDragEnd(arrayMove(items, activeIndex, overIndex));
        });
      }
    }
  };

  const handleDragStart = ({ active }) => {
    if (!active) {
      return;
    }

    setActiveId(active.id);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const sensors = useSensors(pointerSensor, keyboardSensor);

  return items ? (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      sensors={sensors}
      modifiers={modifiers}
      {...args}>
      <SortableContext items={items} strategy={strategy} {...sortableProps}>
        <Container draggableClass={draggableClass} type={type}>
          <Underlay
            draggableClass={draggableClass}
            items={items}
            type={type}
            wrapperStyle={wrapperStyle}
            grid={withGrid}
            activeId={activeId}
            includeUnderlay={includeUnderlay}
          />
          {items &&
            items.length &&
            items?.map((i, index: number) => {
              const originalCol = originalColumns.filter((c) => c.id === i)[0];
              const currentRowChecked = tempVisible.some(
                (e) => e.id === originalCol.id
              );
              return (
                <SortableItem
                  id={i}
                  key={`${i}__drag_key`}
                  type={type}
                  useDragOverlay={useDragOverlay}
                  wrapperStyle={wrapperStyle}
                  index={index}
                  className="flex">
                  <span className="flex">
                    <Draggable />
                  </span>
                  <Checkbox
                    id={i}
                    labelText="Toggle visibility"
                    hideLabel
                    className="visibility-checkbox"
                    onChange={(_, { checked, id }) => {
                      console.log(checked);
                      if (!checked) {
                        const cloneVisible = [...tempVisible];
                        const newCols = cloneVisible.filter((c) => c.id !== id);
                        setTempVisible(newCols);
                        onVisibilityChange(newCols);
                        return;
                      } else {
                        const cloneVisible = [...tempVisible];
                        cloneVisible.push(originalCol);
                        setTempVisible(cloneVisible);
                        onVisibilityChange(cloneVisible);
                      }
                    }}
                    checked={currentRowChecked}
                  />
                  <span className="uppercase">{i}</span>
                </SortableItem>
              );
            })}
        </Container>
      </SortableContext>
    </DndContext>
  ) : null;
};

Sortable.propTypes = {
  Container: PropTypes.elementType,
  adjustScale: PropTypes.bool,
  gridGap: PropTypes.number,
  includeUnderlay: PropTypes.bool,
  itemCount: PropTypes.number,
  modifiers: PropTypes.arrayOf(PropTypes.func),
  restrictToParent: PropTypes.bool,
  sortableProps: PropTypes.object,
  strategy: PropTypes.func,
  type: PropTypes.string,
  useDragOverlay: PropTypes.bool,
  withGrid: PropTypes.bool,
  wrapperStyle: PropTypes.func,
};
