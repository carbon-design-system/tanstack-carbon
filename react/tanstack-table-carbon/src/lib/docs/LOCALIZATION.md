# TanStack Table Localization Guide

## Overview

The TanStack Table wrapper provides comprehensive localization support through a simple `labels` prop. This allows you to translate all user-facing text in the table without modifying the library code.

## Features

- ✅ **No i18n Dependencies** - Library remains dependency-free
- ✅ **Flexible** - Works with any i18n solution (i18next, react-intl, etc.)
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Simple API** - Just pass a `labels` object
- ✅ **Default English Labels** - Works out of the box
- ✅ **Partial Overrides** - Override only the labels you need

## Quick Start

### Basic Usage (No Localization)

```jsx
import { TanstackTable } from '@ibm-zsecure/commons-ui';

<TanstackTable data={data} columns={columns} />;
// Uses default English labels
```

### With Custom Labels

```jsx
import { TanstackTable } from '@ibm-zsecure/commons-ui';

<TanstackTable
  data={data}
  columns={columns}
  labels={{
    toolbarSearchPlaceholder: 'Suchen...',
    paginationNextTooltip: 'Nächste Seite',
    filterPanelApplyButton: 'Anwenden',
  }}
/>;
```

## Integration with i18next

### Step 1: Add Translations to Your Locale Files

**en/common.json:**

```json
{
  "table": {
    "toolbar": {
      "filterTooltip": "Toggle filter panel",
      "searchPlaceholder": "Search table",
      "columnSettings": "Column settings"
    },
    "pagination": {
      "previous": "Previous page",
      "next": "Next page",
      "itemsPerPage": "Items per page:"
    },
    "filterPanel": {
      "title": "Filter",
      "apply": "Apply",
      "clear": "Clear"
    }
  }
}
```

**de/common.json:**

```json
{
  "table": {
    "toolbar": {
      "filterTooltip": "Filterbereich umschalten",
      "searchPlaceholder": "Tabelle durchsuchen",
      "columnSettings": "Spalteneinstellungen"
    },
    "pagination": {
      "previous": "Vorherige Seite",
      "next": "Nächste Seite",
      "itemsPerPage": "Elemente pro Seite:"
    },
    "filterPanel": {
      "title": "Filter",
      "apply": "Anwenden",
      "clear": "Löschen"
    }
  }
}
```

### Step 2: Create Labels from Translations

```jsx
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TanstackTable } from '@ibm-zsecure/commons-ui';

function MyTable() {
  const { t } = useTranslation();

  const labels = useMemo(
    () => ({
      // Toolbar
      toolbarFilterTooltip: t('table.toolbar.filterTooltip'),
      toolbarSearchPlaceholder: t('table.toolbar.searchPlaceholder'),
      toolbarColumnSettingsMenuItem: t('table.toolbar.columnSettings'),

      // Pagination
      paginationPreviousTooltip: t('table.pagination.previous'),
      paginationNextTooltip: t('table.pagination.next'),
      paginationItemsPerPageLabel: t('table.pagination.itemsPerPage'),

      // Filter Panel
      filterPanelTitle: t('table.filterPanel.title'),
      filterPanelApplyButton: t('table.filterPanel.apply'),
      filterPanelClearButton: t('table.filterPanel.clear'),
    }),
    [t]
  );

  return <TanstackTable data={data} columns={columns} labels={labels} />;
}
```

## Complete Label Reference

### Toolbar Labels

| Label Key                       | Default Value         | Usage                      |
| ------------------------------- | --------------------- | -------------------------- |
| `toolbarFilterTooltip`          | "Toggle filter panel" | Filter button tooltip      |
| `toolbarSettingsTooltip`        | "Settings"            | Settings button tooltip    |
| `toolbarSettingsAriaLabel`      | "Settings"            | Settings button aria-label |
| `toolbarSearchPlaceholder`      | "Search table"        | Search input placeholder   |
| `toolbarAriaLabel`              | "Table toolbar"       | Toolbar aria-label         |
| `toolbarColumnSettingsMenuItem` | "Column settings"     | Column settings menu item  |

### Batch Actions Labels

| Label Key                     | Default Value   | Usage                         |
| ----------------------------- | --------------- | ----------------------------- |
| `batchActionsMenuTooltip`     | "Batch actions" | Batch actions menu tooltip    |
| `batchActionsMenuAriaLabel`   | "Batch actions" | Batch actions menu aria-label |
| `batchActionsMenuLabel`       | "Actions"       | Batch actions dropdown label  |
| `batchActionsSelectAllButton` | "Select all"    | Select all button text        |
| `batchActionsCancelButton`    | "Cancel"        | Cancel selection button text  |

### Pagination Labels

| Label Key                     | Default Value     | Usage                                      |
| ----------------------------- | ----------------- | ------------------------------------------ |
| `paginationPreviousTooltip`   | "Previous page"   | Previous page button tooltip               |
| `paginationNextTooltip`       | "Next page"       | Next page button tooltip                   |
| `paginationItemsPerPageLabel` | "Items per page:" | Items per page label                       |
| `paginationPageRangeText`     | "of"              | Page range separator (e.g., "1-10 of 100") |

### Empty State Labels

| Label Key                  | Default Value                | Usage                      |
| -------------------------- | ---------------------------- | -------------------------- |
| `emptyStateTitle`          | "No data available"          | Empty state title          |
| `emptyStateSubtitle`       | "Try adjusting your filters" | Empty state subtitle       |
| `emptyStateNoResultsTitle` | "No results found"           | No search results title    |
| `emptyStateImageAlt`       | "No data"                    | Empty state image alt text |

### Filter Panel Labels

| Label Key                       | Default Value                       | Usage                                                 |
| ------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| `filterPanelTitle`              | "Filter"                            | Filter panel title                                    |
| `filterPanelCloseTooltip`       | "Close"                             | Close button tooltip                                  |
| `filterPanelAdvancedButton`     | "Advanced Filters"                  | Advanced filters button                               |
| `filterPanelSearchLabel`        | "Find filters"                      | Filter search label                                   |
| `filterPanelSearchPlaceholder`  | "Find filters"                      | Filter search placeholder                             |
| `filterPanelClearSearchTooltip` | "Clear search"                      | Clear search tooltip                                  |
| `filterPanelApplyButton`        | "Apply"                             | Apply filters button                                  |
| `filterPanelClearButton`        | "Clear"                             | Clear filters button                                  |
| `filterPanelNoFiltersText`      | "No filters available"              | No filters message                                    |
| `filterPanelNoMatchText`        | "No filters match \"{searchTerm}\"" | No search results (supports {searchTerm} placeholder) |
| `filterDropdownLabel`           | "Choose an option"                  | Dropdown filter label                                 |
| `filterMultiSelectLabel`        | "Choose options"                    | Multi-select filter label                             |
| `filterDatePlaceholder`         | "yyyy-mm-dd"                        | Date filter placeholder                               |
| `filterTimeAM`                  | "AM"                                | Time filter AM label                                  |
| `filterTimePM`                  | "PM"                                | Time filter PM label                                  |

### Column Customization Labels

| Label Key                               | Default Value                           | Usage                                                   |
| --------------------------------------- | --------------------------------------- | ------------------------------------------------------- |
| `columnCustomizationHeading`            | "Customize display ({visible}/{total})" | Modal heading (supports {visible}/{total} placeholders) |
| `columnCustomizationLabel`              | "Column Customization"                  | Modal label                                             |
| `columnCustomizationDescription`        | "Deselect fields to hide them..."       | Description text                                        |
| `columnCustomizationSearchLabel`        | "Search columns"                        | Search label                                            |
| `columnCustomizationSearchPlaceholder`  | "Find columns..."                       | Search placeholder                                      |
| `columnCustomizationClearSearchTooltip` | "Clear search input"                    | Clear search tooltip                                    |
| `columnCustomizationSelectAllLabel`     | "Select All"                            | Select all checkbox label                               |
| `columnCustomizationApplyButton`        | "Apply"                                 | Apply button text                                       |
| `columnCustomizationCancelButton`       | "Cancel"                                | Cancel button text                                      |

### Editable Cell Labels

| Label Key                     | Default Value   | Usage                     |
| ----------------------------- | --------------- | ------------------------- |
| `editableCellLabel`           | "Editable cell" | Text input label (hidden) |
| `editableDateCellLabel`       | "Editable date" | Date input label (hidden) |
| `editableDateCellPlaceholder` | "yyyy-mm-dd"    | Date input placeholder    |

### Selection Labels

| Label Key                 | Default Value     | Usage                              |
| ------------------------- | ----------------- | ---------------------------------- |
| `selectionSelectAllLabel` | "Select all rows" | Select all checkbox label (hidden) |
| `selectionSelectRowLabel` | "Select row"      | Row checkbox label (hidden)        |

### Accessibility Labels

| Label Key                  | Default Value      | Usage                                                  |
| -------------------------- | ------------------ | ------------------------------------------------------ |
| `a11yTableLabel`           | "Data table"       | Table aria-label                                       |
| `a11yColumnSortLabel`      | "Sort by {column}" | Column sort aria-label (supports {column} placeholder) |
| `a11yColumnSortAscending`  | "ascending"        | Ascending sort indicator                               |
| `a11yColumnSortDescending` | "descending"       | Descending sort indicator                              |
| `a11yRowExpandTooltip`     | "Expand row"       | Expand row button tooltip                              |
| `a11yRowCollapseTooltip`   | "Collapse row"     | Collapse row button tooltip                            |
| `a11yRowSelectLabel`       | "Select row"       | Row selection aria-label                               |
| `a11yDragColumnTooltip`    | "Drag to reorder"  | Drag handle tooltip                                    |
| `a11yPinnedColumnTooltip`  | "Column is pinned" | Pinned column indicator                                |

## Dynamic Placeholders

Some labels support dynamic placeholders that are replaced at runtime:

- `{searchTerm}` - Replaced with the current search term
- `{visible}` - Replaced with the number of visible columns
- `{total}` - Replaced with the total number of columns
- `{column}` - Replaced with the column name
- `{count}` - Replaced with the count value

Example:

```jsx
labels={{
  filterPanelNoMatchText: 'Keine Filter entsprechen "{searchTerm}"',
  columnCustomizationHeading: 'Anzeige anpassen ({visible}/{total})',
}}
```

## TypeScript Support

Full TypeScript definitions are provided:

```typescript
import { TanstackTableLabels } from '@ibm-zsecure/commons-ui';

const labels: TanstackTableLabels = {
  toolbarSearchPlaceholder: 'Search...',
  paginationNextTooltip: 'Next',
  // ... other labels
};
```

## Accessing Default Labels

You can import and extend the default labels:

```jsx
import { DEFAULT_LABELS } from '@ibm-zsecure/commons-ui';

const customLabels = {
  ...DEFAULT_LABELS,
  toolbarSearchPlaceholder: 'Custom search text',
};
```

## Best Practices

1. **Use useMemo** - Wrap labels in `useMemo` to prevent unnecessary re-renders
2. **Partial Overrides** - Only override labels you need to change
3. **Consistent Naming** - Follow the naming convention in your translation files
4. **Test All Languages** - Verify all labels display correctly in each language
5. **Handle Placeholders** - Ensure dynamic placeholders are properly replaced

## Example: Complete Localization Setup

```jsx
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TanstackTable } from '@ibm-zsecure/commons-ui';

function LocalizedTable({ data, columns }) {
  const { t } = useTranslation();

  const labels = useMemo(
    () => ({
      // Toolbar
      toolbarFilterTooltip: t('table.toolbar.filterTooltip'),
      toolbarSettingsTooltip: t('table.toolbar.settingsTooltip'),
      toolbarSearchPlaceholder: t('table.toolbar.searchPlaceholder'),
      toolbarColumnSettingsMenuItem: t('table.toolbar.columnSettings'),

      // Pagination
      paginationPreviousTooltip: t('table.pagination.previous'),
      paginationNextTooltip: t('table.pagination.next'),
      paginationItemsPerPageLabel: t('table.pagination.itemsPerPage'),

      // Empty State
      emptyStateTitle: t('table.emptyState.title'),
      emptyStateSubtitle: t('table.emptyState.subtitle'),

      // Filter Panel
      filterPanelTitle: t('table.filterPanel.title'),
      filterPanelCloseTooltip: t('table.filterPanel.close'),
      filterPanelSearchPlaceholder: t('table.filterPanel.searchPlaceholder'),
      filterPanelApplyButton: t('table.filterPanel.apply'),
      filterPanelClearButton: t('table.filterPanel.clear'),

      // Column Customization
      columnCustomizationHeading: t('table.columnCustomization.title') + ' ({visible}/{total})',
      columnCustomizationDescription: t('table.columnCustomization.description'),
      columnCustomizationSearchPlaceholder: t('table.columnCustomization.searchPlaceholder'),
      columnCustomizationSelectAllLabel: t('table.columnCustomization.selectAll'),
      columnCustomizationApplyButton: t('table.columnCustomization.apply'),
      columnCustomizationCancelButton: t('table.columnCustomization.cancel'),
    }),
    [t]
  );

  return (
    <TanstackTable
      data={data}
      columns={columns}
      labels={labels}
      features={{
        pagination: { pageSize: 10 },
        search: {},
        sorting: {},
        columnSettings: {},
      }}
      toolbar={[{ type: 'filter' }, { type: 'search' }, { type: 'settings' }]}
    />
  );
}

export default LocalizedTable;
```

## Troubleshooting

### Labels Not Updating When Language Changes

Make sure labels are wrapped in `useMemo` with `t` as a dependency:

```jsx
const labels = useMemo(
  () => ({
    toolbarSearchPlaceholder: t('table.search'),
  }),
  [t]
); // ✅ Correct - will update when language changes
```

### Missing Translations

The table will fall back to default English labels if a translation is missing. Check your translation files for typos.

### TypeScript Errors

Ensure you're using the correct label keys. Import the type for autocomplete:

```typescript
import type { TanstackTableLabels } from '@ibm-zsecure/commons-ui';
```

## Support

For issues or questions about localization, please refer to the main documentation or create an issue in the repository.
