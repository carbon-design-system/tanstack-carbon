/* eslint-disable custom/hooks-first */
import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Filter, Settings } from '@carbon/icons-react';
import {
  DataTable,
  IconButton,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { useLabels } from '../contexts/labelsContext.jsx';
import useResponsiveBatchActions from '../hooks/useResponsiveBatchActions.js';
import styles from './scss/tableToolbar.module.scss';

const {
  TableToolbar: CarbonTableToolbar,
  TableBatchActions,
  TableBatchAction,
  TableToolbarContent,
  TableToolbarSearch,
} = DataTable;

/**
 * TableToolbar Component
 * Renders the table toolbar with batch actions and configurable toolbar elements
 *
 * Features:
 * - Batch actions for selected rows (buttons and custom elements like dropdowns)
 * - Configurable toolbar elements (filter, search, settings, custom)
 * - Settings dropdown with customizable menu items and order control
 * - Conditional display of settings based on enableCustomizeColumn and custom menu items
 *
 * Batch Actions:
 * - Regular button actions: { label, icon, onClick }
 * - Custom elements (dropdowns, etc.): { type: "custom", element: <Component /> or (selectedRows) => <Component /> }
 *
 * Settings Dropdown Behavior:
 * - If no menuItems provided: shows "Column settings" if enableCustomizeColumn is true
 * - If menuItems provided: renders items in specified order
 * - Use { type: "columnSettings" } to position the column settings option
 * - Hides completely if no items to display
 *
 * @param {Object} props - Component props
 *
 * @example
 * // Batch actions with dropdown
 * batchActions={[
 *   { label: "Delete", icon: TrashCan, onClick: (rows) => console.log(rows) },
 *   {
 *     type: "custom",
 *     element: (selectedRows) => (
 *       <Dropdown
 *         id="batch-action-dropdown"
 *         label="Bulk actions"
 *         items={[{ id: "export", text: "Export" }, { id: "archive", text: "Archive" }]}
 *         onChange={({ selectedItem }) => handleBulkAction(selectedItem.id, selectedRows)}
 *       />
 *     )
 *   }
 * ]}
 *
 * @example
 * // Settings with custom order - column settings in the middle
 * toolbar={[
 *   { type: "filter" },
 *   { type: "search" },
 *   {
 *     type: "settings",
 *     menuItems: [
 *       { label: "Export Settings", onClick: () => {} },
 *       { type: "columnSettings" }, // Built-in column settings
 *       { label: "Import Settings", onClick: () => {} },
 *       { label: "Reset", onClick: () => {}, isDelete: true, hasDivider: true }
 *     ]
 *   }
 * ]}
 *
 * @example
 * // Settings without column settings - only custom items
 * toolbar={[
 *   { type: "settings", menuItems: [
 *     { label: "Export", onClick: () => {} },
 *     { label: "Import", onClick: () => {} }
 *   ]}
 * ]}
 */
const TableToolbar = ({
  enableSelection = false,
  selectionType = null,
  shouldShowBatchActions = false,
  selectedCount = 0,
  totalCount = 0,
  onCancelSelection,
  batchActions = [],
  table, // NOTE: Table instance to get selected rows
  toolbar,
  onSearchChange,
  searchValue = '',
  onToggleFilterPanel,
  onOpenCustomizePanel,
}) => {
  const labels = useLabels();
  // NOTE: Derive enableCustomizeColumn from toolbar configuration
  const enableCustomizeColumn =
    toolbar?.some(
      (item) =>
        item.type === 'settings' &&
        item.menuItems?.some((menuItem) => menuItem.type === 'columnSettings')
    ) ?? false;

  // NOTE: Prepare batch actions with onClick handlers that pass selected rows
  const preparedBatchActions = useMemo(() => {
    if (!batchActions || batchActions.length === 0) {
      return [];
    }

    return batchActions.map((action) => {
      // NOTE: If it's a custom element, return as-is with selected rows injected
      if (action.type === 'custom' && action.element) {
        return {
          ...action,
          element:
            typeof action.element === 'function'
              ? action.element(
                  table.getSelectedRowModel().rows.map((row) => row.original)
                )
              : action.element,
        };
      }

      // NOTE: If it's an overflow menu, prepare it with selected rows
      if (action.type === 'overflow') {
        return {
          ...action,
          onOptionClick: (optionId) => {
            const selectedRows = table
              .getSelectedRowModel()
              .rows.map((row) => row.original);
            action.onOptionClick(optionId, selectedRows);
          },
        };
      }

      // NOTE: Regular batch action button
      return {
        ...action,
        onClick: () => {
          const selectedRows = table
            .getSelectedRowModel()
            .rows.map((row) => row.original);
          action.onClick(selectedRows);
        },
      };
    });
  }, [batchActions, table]);

  // NOTE: Use responsive batch actions hook
  const { shouldUseOverflow } = useResponsiveBatchActions(batchActions);

  // NOTE: Helper function to render toolbar elements based on configuration
  const renderToolbarElement = (item, index) => {
    const key = `toolbar-${item.type}-${index}`;

    switch (item.type) {
      case 'filter':
        return (
          <IconButton
            key={key}
            kind="ghost"
            label={labels.toolbarFilterTooltip}
            onClick={onToggleFilterPanel}
            size="lg">
            <Filter />
          </IconButton>
        );

      case 'search':
        return (
          <TableToolbarSearch
            key={key}
            persistent
            tabIndex={shouldShowBatchActions ? -1 : 0}
            placeholder={labels.toolbarSearchPlaceholder}
            onChange={(valueOrEvent) =>
              onSearchChange?.(
                typeof valueOrEvent === 'string'
                  ? valueOrEvent
                  : valueOrEvent?.target?.value ?? ''
              )
            }
            value={searchValue}
          />
        );

      case 'settings':
        // NOTE: Build settings menu items array based on configuration
        const settingsMenuItems = item.menuItems || [];

        // NOTE: If no custom menu items provided, use default order
        const defaultSettingsMenu = enableCustomizeColumn
          ? [{ type: 'columnSettings' }]
          : [];

        const menuToRender =
          settingsMenuItems.length > 0
            ? settingsMenuItems
            : defaultSettingsMenu;

        // NOTE: Don't show settings if no items to display
        if (menuToRender.length === 0) {
          return null;
        }

        return (
          <OverflowMenu
            key={key}
            renderIcon={Settings}
            iconDescription={labels.toolbarSettingsTooltip}
            aria-label={labels.toolbarSettingsAriaLabel}
            size="md"
            flipped
            menuOptionsClass={styles.settingsMenu}>
            {menuToRender.map((menuItem, menuIndex) => {
              const menuKey = `settings-menu-${menuItem.type || menuIndex}`;

              // NOTE: Handle built-in column settings type
              if (menuItem.type === 'columnSettings') {
                return enableCustomizeColumn ? (
                  <OverflowMenuItem
                    key={menuKey}
                    itemText={
                      menuItem.label || labels.toolbarColumnSettingsMenuItem
                    }
                    onClick={onOpenCustomizePanel}
                    disabled={menuItem.disabled}
                    hasDivider={menuItem.hasDivider}
                  />
                ) : null;
              }

              // NOTE: Handle custom menu items
              return (
                <OverflowMenuItem
                  key={menuKey}
                  itemText={menuItem.label}
                  onClick={menuItem.onClick}
                  disabled={menuItem.disabled}
                  isDelete={menuItem.isDelete}
                  hasDivider={menuItem.hasDivider}
                />
              );
            })}
          </OverflowMenu>
        );

      case 'custom':
        return item.element ? (
          <Fragment key={key}>{item.element}</Fragment>
        ) : null;

      default:
        return null;
    }
  };

  // NOTE: Determine toolbar elements to render
  const toolbarElementsToRender = toolbar || [
    { type: 'filter' },
    { type: 'search' },
    { type: 'settings' },
  ];

  // NOTE: Render batch actions based on screen size
  const renderBatchActions = () => {
    if (shouldUseOverflow) {
      // NOTE: Small screen: Single overflow menu with ALL actions
      const allButtonActions = preparedBatchActions.filter(
        (action) => !action.type || action.type === 'button'
      );
      const overflowMenus = preparedBatchActions.filter(
        (action) => action.type === 'overflow'
      );
      const customElements = preparedBatchActions.filter(
        (action) => action.type === 'custom'
      );

      // NOTE: Collect all options: button actions first, then overflow menu options
      const allOptions = [];

      // NOTE: Add button actions as options
      allButtonActions.forEach((action) => {
        allOptions.push({
          type: 'button',
          label: action.label,
          onClick: action.onClick,
        });
      });

      // NOTE: Add all overflow menu options
      overflowMenus.forEach((action) => {
        action.options?.forEach((option) => {
          allOptions.push({
            type: 'overflow',
            label: option.label,
            onClick: () => action.onOptionClick(option.id),
            isDelete: option.isDelete,
            hasDivider: option.hasDivider,
            disabled: option.disabled,
          });
        });
      });

      return (
        <>
          {/* NOTE: Single overflow menu with all actions */}
          {allOptions.length > 0 && (
            <OverflowMenu
              renderIcon={() => (
                <span className={styles.overflowMenuLabel}>
                  {labels.batchActionsMenuLabel} ▼
                </span>
              )}
              iconDescription={labels.batchActionsMenuTooltip}
              aria-label={labels.batchActionsMenuAriaLabel}
              size="md"
              flipped
              className="batchActionOverflowBtn"
              menuOptionsClass={styles.bactActionOverflowMenuUl}>
              {allOptions.map((option, index) => (
                <OverflowMenuItem
                  key={index}
                  itemText={option.label}
                  onClick={option.onClick}
                  isDelete={option.isDelete}
                  hasDivider={option.hasDivider}
                  disabled={option.disabled}
                />
              ))}
            </OverflowMenu>
          )}

          {/* NOTE: Custom elements */}
          {customElements.map((action, index) => (
            <Fragment key={`custom-${index}`}>{action.element}</Fragment>
          ))}
        </>
      );
    }

    // NOTE: Large screen: Show all actions normally
    return preparedBatchActions.map((action, index) => {
      // NOTE: Render overflow menu
      if (action.type === 'overflow') {
        return (
          <OverflowMenu
            key={index}
            renderIcon={() => (
              <span className={styles.overflowMenuLabel}>
                {action.label || labels.batchActionsOverflowFallback} ▼
              </span>
            )}
            iconDescription={
              action.label || labels.batchActionsOverflowFallback
            }
            aria-label={action.label || labels.batchActionsOverflowFallback}
            size="md"
            flipped
            className={styles.batchActionOverflowBtn}
            menuOptionsClass={styles.bactActionOverflowMenuUl}>
            {action.options?.map((option) => (
              <OverflowMenuItem
                key={option.id}
                itemText={option.label}
                onClick={() => action.onOptionClick(option.id)}
                isDelete={option.isDelete}
                hasDivider={option.hasDivider}
                disabled={option.disabled}
              />
            ))}
          </OverflowMenu>
        );
      }

      // NOTE: Render custom element
      if (action.type === 'custom' && action.element) {
        return <Fragment key={index}>{action.element}</Fragment>;
      }

      // NOTE: Render regular batch action button
      return (
        <TableBatchAction
          key={index}
          tabIndex={shouldShowBatchActions ? 0 : -1}
          renderIcon={action.icon}
          iconDescription={action.label}
          onClick={action.onClick}>
          {action.label}
        </TableBatchAction>
      );
    });
  };

  return (
    <div className={styles.tblToolbar}>
      <CarbonTableToolbar aria-label={labels.toolbarAriaLabel}>
        {/* NOTE: Toolbar Content */}
        <TableToolbarContent
          aria-hidden={shouldShowBatchActions}
          className={styles.tblToolbarContent}>
          {/* NOTE: Render toolbar elements based on configuration */}
          {toolbarElementsToRender.map((item, index) =>
            renderToolbarElement(item, index)
          )}
        </TableToolbarContent>

        {/* NOTE: Batch Actions - Only show for checkbox selection with provided actions */}
        {enableSelection &&
          selectionType === 'checkbox' &&
          preparedBatchActions.length > 0 && (
            <TableBatchActions
              shouldShowBatchActions={shouldShowBatchActions}
              totalSelected={selectedCount}
              onCancel={onCancelSelection}
              totalCount={totalCount}>
              {renderBatchActions()}
            </TableBatchActions>
          )}
      </CarbonTableToolbar>
    </div>
  );
};

TableToolbar.propTypes = {
  enableSelection: PropTypes.bool,
  selectionType: PropTypes.oneOf(['checkbox', 'radio', null]),
  shouldShowBatchActions: PropTypes.bool,
  selectedCount: PropTypes.number,
  totalCount: PropTypes.number,
  onCancelSelection: PropTypes.func,
  onSelectAll: PropTypes.func,
  batchActions: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['button', 'overflow', 'custom']), // NOTE: "button" for regular action, "overflow" for menu, "custom" for custom element
      label: PropTypes.string,
      icon: PropTypes.elementType,
      onClick: PropTypes.func,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          isDelete: PropTypes.bool,
          hasDivider: PropTypes.bool,
          disabled: PropTypes.bool,
        })
      ), // NOTE: For overflow type - menu items
      onOptionClick: PropTypes.func, // NOTE: For overflow type - (optionId, selectedRows) => void
      element: PropTypes.oneOfType([PropTypes.node, PropTypes.func]), // NOTE: For custom type - can be element or function receiving selectedRows
    })
  ),
  table: PropTypes.object.isRequired,

  // NOTE: Toolbar configuration
  toolbar: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['filter', 'search', 'settings', 'custom'])
        .isRequired,
      element: PropTypes.node, // NOTE: For custom type
      menuItems: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.oneOf(['columnSettings']), // NOTE: Built-in types
          label: PropTypes.string,
          onClick: PropTypes.func,
          disabled: PropTypes.bool,
          isDelete: PropTypes.bool,
          hasDivider: PropTypes.bool,
        })
      ), // NOTE: For settings type - menu items with order control
    })
  ),

  // NOTE: Callbacks
  onSearchChange: PropTypes.func,
  searchValue: PropTypes.string,
  onToggleFilterPanel: PropTypes.func,
  onOpenCustomizePanel: PropTypes.func,
};

export default React.memo(TableToolbar);
