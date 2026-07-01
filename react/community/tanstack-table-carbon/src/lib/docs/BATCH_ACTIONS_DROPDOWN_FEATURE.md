# Batch Actions with Dropdown Support

## Overview

The TanstackTable toolbar now supports **custom elements** (like dropdowns) in batch actions alongside regular action buttons. This allows for more flexible and space-efficient batch action interfaces.

## Features

✅ **Regular Button Actions** - Standard batch action buttons with icons  
✅ **Custom Dropdown Actions** - Dropdown menus for multiple related actions  
✅ **Mixed Actions** - Combine buttons and dropdowns in the same toolbar  
✅ **Selected Rows Access** - Custom elements receive selected rows as parameter  
✅ **Flexible Rendering** - Support for both static elements and render functions

---

## Usage

### Basic Batch Actions (Buttons Only)

```jsx
const batchActions = [
  {
    label: 'Delete',
    icon: TrashCan,
    onClick: (selectedRows) => {
      console.log('Deleting:', selectedRows);
      alert(`Delete ${selectedRows.length} users?`);
    },
  },
  {
    label: 'Export',
    icon: Download,
    onClick: (selectedRows) => {
      console.log('Exporting:', selectedRows);
      exportToCSV(selectedRows);
    },
  },
];
```

### Batch Actions with Dropdown

```jsx
import { Dropdown } from '@carbon/react';

const bulkActionOptions = [
  { id: 'export-csv', text: 'Export to CSV' },
  { id: 'export-excel', text: 'Export to Excel' },
  { id: 'archive', text: 'Archive Users' },
  { id: 'assign-role', text: 'Assign Role' },
];

const batchActions = [
  {
    label: 'Delete',
    icon: TrashCan,
    onClick: (selectedRows) => {
      if (confirm(`Delete ${selectedRows.length} users?`)) {
        deleteUsers(selectedRows);
      }
    },
  },
  {
    type: 'custom',
    element: (selectedRows) => (
      <Dropdown
        id="batch-action-dropdown"
        label="More actions"
        items={bulkActionOptions}
        itemToString={(item) => (item ? item.text : '')}
        onChange={({ selectedItem }) => {
          handleBulkAction(selectedItem.id, selectedRows);
        }}
        size="lg"
      />
    ),
  },
];
```

### Handler Function Example

```jsx
const handleBulkAction = (actionId, selectedRows) => {
  console.log(`Action: ${actionId}`, selectedRows);

  switch (actionId) {
    case 'export-csv':
      exportToCSV(selectedRows);
      break;
    case 'export-excel':
      exportToExcel(selectedRows);
      break;
    case 'archive':
      archiveUsers(selectedRows);
      break;
    case 'assign-role':
      openRoleAssignmentModal(selectedRows);
      break;
    default:
      break;
  }
};
```

---

## API Reference

### Batch Action Types

#### Regular Button Action

```typescript
{
  label: string;           // Button text
  icon?: React.Component;  // Carbon icon component
  onClick: (selectedRows: Array<any>) => void;  // Click handler
}
```

#### Custom Element Action (Dropdown)

```typescript
{
  type: 'custom';
  element: React.ReactNode | ((selectedRows: Array<any>) => React.ReactNode);
}
```

### Props

| Prop      | Type                    | Description                                                                            |
| --------- | ----------------------- | -------------------------------------------------------------------------------------- |
| `type`    | `"custom"`              | Identifies this as a custom element action                                             |
| `element` | `ReactNode \| Function` | The element to render, or a function that receives selectedRows and returns an element |

---

## Examples

### Example 1: Simple Dropdown

```jsx
const batchActions = [
  {
    type: 'custom',
    element: (selectedRows) => (
      <Dropdown
        id="status-dropdown"
        label="Change status"
        items={[
          { id: 'active', text: 'Set Active' },
          { id: 'inactive', text: 'Set Inactive' },
        ]}
        onChange={({ selectedItem }) => {
          updateStatus(selectedRows, selectedItem.id);
        }}
      />
    ),
  },
];
```

### Example 2: Multiple Dropdowns

```jsx
const batchActions = [
  {
    label: 'Delete',
    icon: TrashCan,
    onClick: (rows) => deleteUsers(rows),
  },
  {
    type: 'custom',
    element: (selectedRows) => (
      <Dropdown
        id="export-dropdown"
        label="Export"
        items={[
          { id: 'csv', text: 'CSV' },
          { id: 'excel', text: 'Excel' },
          { id: 'pdf', text: 'PDF' },
        ]}
        onChange={({ selectedItem }) => {
          exportData(selectedRows, selectedItem.id);
        }}
      />
    ),
  },
  {
    type: 'custom',
    element: (selectedRows) => (
      <Dropdown
        id="assign-dropdown"
        label="Assign to"
        items={[
          { id: 'team-a', text: 'Team A' },
          { id: 'team-b', text: 'Team B' },
        ]}
        onChange={({ selectedItem }) => {
          assignToTeam(selectedRows, selectedItem.id);
        }}
      />
    ),
  },
];
```

### Example 3: Conditional Dropdown Options

```jsx
const batchActions = [
  {
    type: 'custom',
    element: (selectedRows) => {
      // Customize dropdown options based on selected rows
      const hasActiveUsers = selectedRows.some((row) => row.status === 'Active');

      const options = [
        { id: 'export', text: 'Export' },
        ...(hasActiveUsers ? [{ id: 'deactivate', text: 'Deactivate' }] : []),
        { id: 'archive', text: 'Archive' },
      ];

      return (
        <Dropdown
          id="dynamic-dropdown"
          label="Actions"
          items={options}
          onChange={({ selectedItem }) => {
            handleAction(selectedItem.id, selectedRows);
          }}
        />
      );
    },
  },
];
```

### Example 4: Dropdown with Icon Button

```jsx
import { OverflowMenuVertical } from '@carbon/icons-react';

const batchActions = [
  {
    label: 'Delete',
    icon: TrashCan,
    onClick: (rows) => deleteUsers(rows),
  },
  {
    type: 'custom',
    element: (selectedRows) => (
      <Dropdown
        id="more-actions"
        label="More"
        renderIcon={OverflowMenuVertical}
        items={[
          { id: 'duplicate', text: 'Duplicate' },
          { id: 'merge', text: 'Merge' },
          { id: 'tag', text: 'Add Tags' },
        ]}
        onChange={({ selectedItem }) => {
          handleMoreActions(selectedItem.id, selectedRows);
        }}
        size="lg"
      />
    ),
  },
];
```

---

## Best Practices

### 1. **Use Dropdowns for Related Actions**

Group similar actions together in a dropdown to save toolbar space:

```jsx
// ✅ Good - Related export actions grouped
{ type: "custom", element: (rows) => <ExportDropdown rows={rows} /> }

// ❌ Avoid - Too many individual buttons
{ label: "Export CSV", onClick: ... }
{ label: "Export Excel", onClick: ... }
{ label: "Export PDF", onClick: ... }
```

### 2. **Keep Primary Actions as Buttons**

Use buttons for the most common/important actions:

```jsx
[
  { label: "Delete", icon: TrashCan, onClick: ... },  // Primary action
  { type: "custom", element: <MoreActionsDropdown /> }  // Secondary actions
]
```

### 3. **Provide Clear Labels**

Make dropdown labels descriptive:

```jsx
// ✅ Good
<Dropdown label="Export options" ... />
<Dropdown label="Bulk actions" ... />

// ❌ Avoid
<Dropdown label="Actions" ... />
<Dropdown label="More" ... />
```

### 4. **Handle Empty Selections**

Disable or hide actions when no rows are selected:

```jsx
element: (selectedRows) => (
  <Dropdown
    disabled={selectedRows.length === 0}
    label="Bulk actions"
    ...
  />
)
```

### 5. **Confirm Destructive Actions**

Always confirm before performing destructive operations:

```jsx
onChange={({ selectedItem }) => {
  if (selectedItem.id === "delete") {
    if (confirm(`Delete ${selectedRows.length} items?`)) {
      deleteItems(selectedRows);
    }
  }
}}
```

---

## Styling

### Custom Dropdown Styles

```jsx
{
  type: "custom",
  element: (selectedRows) => (
    <Dropdown
      id="styled-dropdown"
      label="Actions"
      items={options}
      size="lg"
      style={{ minWidth: "180px" }}  // Custom width
      className="custom-batch-dropdown"
    />
  ),
}
```

### CSS Customization

```scss
// Custom styles for batch action dropdowns
.cds--batch-actions .cds--dropdown {
  margin-left: $spacing-03;

  .cds--list-box__field {
    background-color: var(--cds-layer);
  }
}
```

---

## TypeScript Support

```typescript
import { Dropdown } from "@carbon/react";

interface BatchAction {
  type?: "custom";
  label?: string;
  icon?: React.ComponentType;
  onClick?: (selectedRows: any[]) => void;
  element?: React.ReactNode | ((selectedRows: any[]) => React.ReactNode);
}

const batchActions: BatchAction[] = [
  {
    label: "Delete",
    icon: TrashCan,
    onClick: (selectedRows: User[]) => {
      deleteUsers(selectedRows);
    },
  },
  {
    type: "custom",
    element: (selectedRows: User[]) => (
      <Dropdown
        id="export-dropdown"
        label="Export"
        items={exportOptions}
        onChange={({ selectedItem }) => {
          exportUsers(selectedRows, selectedItem.format);
        }}
      />
    ),
  },
];
```

---

## Troubleshooting

### Dropdown Not Showing

**Problem:** Dropdown doesn't appear in batch actions  
**Solution:** Ensure `type: "custom"` is set and `element` is provided

```jsx
// ❌ Wrong
{ element: <Dropdown ... /> }

// ✅ Correct
{ type: "custom", element: <Dropdown ... /> }
```

### Selected Rows Not Passed

**Problem:** `selectedRows` is undefined in dropdown handler  
**Solution:** Use function form of `element` prop

```jsx
// ❌ Wrong - static element
{ type: "custom", element: <Dropdown ... /> }

// ✅ Correct - function receives selectedRows
{ type: "custom", element: (selectedRows) => <Dropdown ... /> }
```

### Dropdown Closes Immediately

**Problem:** Dropdown closes when clicking inside  
**Solution:** Ensure proper event handling in Carbon Dropdown

```jsx
<Dropdown
  onChange={({ selectedItem }) => {
    // Handle selection
    handleAction(selectedItem.id, selectedRows);
  }}
  // Don't add onClick handlers that might interfere
/>
```

---

## Migration Guide

### From Old Batch Actions

**Before:**

```jsx
const batchActions = [
  { label: 'Export CSV', icon: Download, onClick: exportCSV },
  { label: 'Export Excel', icon: Download, onClick: exportExcel },
  { label: 'Export PDF', icon: Download, onClick: exportPDF },
];
```

**After:**

```jsx
const batchActions = [
  {
    type: 'custom',
    element: (selectedRows) => (
      <Dropdown
        label="Export"
        items={[
          { id: 'csv', text: 'CSV' },
          { id: 'excel', text: 'Excel' },
          { id: 'pdf', text: 'PDF' },
        ]}
        onChange={({ selectedItem }) => {
          exportData(selectedRows, selectedItem.id);
        }}
      />
    ),
  },
];
```

---

## Related Documentation

- [TanstackTable Main Documentation](./README.md)
- [Toolbar Configuration](./TOOLBAR_CONFIGURATION.md)
- [Carbon Dropdown Documentation](https://react.carbondesignsystem.com/?path=/docs/components-dropdown--overview)

---

**Created:** 2026-05-09  
**Author:** Bob (AI Engineer)  
**Status:** ✅ Production Ready
