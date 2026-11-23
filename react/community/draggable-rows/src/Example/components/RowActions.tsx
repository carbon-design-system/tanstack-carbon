import { OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { ArrowDown, ArrowsVertical, ArrowUp } from '@carbon/react/icons';
import type { CarbonIconType } from '@carbon/react/icons';

import { Resource } from '../makeData';

// Overflow menu item label with a decorative icon.
const MenuItemLabel = ({
  icon: Icon,
  children,
}: {
  icon: CarbonIconType;
  children: string;
}) => (
  <span className="draggable-rows__menu-item">
    <Icon size={16} aria-hidden />
    <span className="draggable-rows__menu-item-text">{children}</span>
  </span>
);

// `index` is the position in the whole list, not on the current page.
export const RowActions = ({
  resource,
  index,
  total,
  onMove,
  onMoveToPosition,
}: {
  resource: Resource;
  index: number;
  total: number;
  onMove: (id: string, newIndex: number) => void;
  onMoveToPosition: (resource: Resource, index: number) => void;
}) => (
  <OverflowMenu
    size="sm"
    flipped
    autoAlign
    menuOptionsClass="draggable-rows__menu"
    aria-label={`Actions for ${resource.name}`}
    iconDescription={`Actions for ${resource.name}`}>
    <OverflowMenuItem
      itemText={<MenuItemLabel icon={ArrowUp}>Move up</MenuItemLabel>}
      disabled={index === 0}
      onClick={() => onMove(resource.id, index - 1)}
    />
    <OverflowMenuItem
      itemText={<MenuItemLabel icon={ArrowDown}>Move down</MenuItemLabel>}
      disabled={index === total - 1}
      onClick={() => onMove(resource.id, index + 1)}
    />
    <OverflowMenuItem
      itemText={
        <MenuItemLabel icon={ArrowsVertical}>
          Move to custom position
        </MenuItemLabel>
      }
      onClick={() => onMoveToPosition(resource, index)}
    />
  </OverflowMenu>
);
