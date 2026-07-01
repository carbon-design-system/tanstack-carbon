# Custom Filters - Advanced Features

This document explains the advanced features available in the custom filters system, including conditional enable/disable and validation.

## Table of Contents

1. [Conditional Enable/Disable](#conditional-enabledisable)
2. [Validation](#validation)
3. [Complete Example](#complete-example)

---

## Conditional Enable/Disable

You can conditionally enable or disable filters based on the values of other filters using the `disabled` property.

### Usage

```javascript
{
  id: "maxSalary",
  type: "number",
  label: "Max Salary (disabled until min is set)",
  placeholder: "Enter maximum salary",
  disabled: (allFilters) => !allFilters.minSalary, // Disabled when minSalary is not set
}
```

### How It Works

- The `disabled` property accepts a function that receives all current filter values
- The function should return `true` to disable the filter, `false` to enable it
- The filter state is automatically updated whenever any filter value changes
- Disabled filters are visually indicated in the UI (grayed out, not clickable)

### Common Use Cases

1. **Dependent Filters**: Disable a filter until a prerequisite filter is set
2. **Conditional Logic**: Enable/disable based on complex conditions
3. **Progressive Disclosure**: Show advanced filters only when basic filters are configured

---

## Validation

The custom filters system supports comprehensive validation with built-in and custom validation rules.

### Built-in Validation Rules

#### 1. Required Validation

```javascript
{
  id: "department",
  type: "dropdown",
  label: "Department",
  validation: {
    required: true,
    message: "Department is required"
  }
}
```

#### 2. Min/Max Validation (for numbers and arrays)

```javascript
{
  id: "skills",
  type: "multiselect",
  label: "Skills",
  validation: {
    min: 1,  // Minimum number of selections
    max: 3,  // Maximum number of selections
    message: "Please select between 1 and 3 skills"
  }
}
```

For number inputs:

```javascript
{
  id: "age",
  type: "number",
  label: "Age",
  validation: {
    min: 18,
    max: 65,
    message: "Age must be between 18 and 65"
  }
}
```

#### 3. Custom Validation Function

```javascript
{
  id: "minSalary",
  type: "number",
  label: "Min Salary",
  validation: {
    custom: (value, allFilters) => {
      // Return true if valid, false if invalid
      if (allFilters.maxSalary && value > allFilters.maxSalary) {
        return false;
      }
      return true;
    },
    message: "Min salary cannot exceed max salary"
  }
}
```

### Validation Properties

| Property   | Type     | Description                                                    |
| ---------- | -------- | -------------------------------------------------------------- |
| `required` | boolean  | Makes the filter required                                      |
| `min`      | number   | Minimum value (for numbers) or minimum selections (for arrays) |
| `max`      | number   | Maximum value (for numbers) or maximum selections (for arrays) |
| `custom`   | function | Custom validation function `(value, allFilters) => boolean`    |
| `message`  | string   | Error message to display when validation fails                 |

### How Validation Works

1. Validation runs automatically when filter values change
2. Invalid filters show error messages in the UI
3. The `isValid` flag from `useCustomFilters` indicates overall validity
4. Parent components can access validation errors via the hook

---

## Apply Button Control

The Apply button is automatically disabled when there are validation errors in any filter. This prevents users from applying invalid filter configurations.

### How It Works

1. **Automatic Validation**: The `useCustomFilters` hook tracks validation state via the `isValid` flag
2. **State Propagation**: `CustomFilterPanel` notifies `filterSidePanel` of validation changes via `onValidationChange` callback
3. **Button Disable**: The Apply button is disabled when `isValid` is `false`

### Implementation

The Apply button automatically handles validation state:

```javascript
<Button
  kind="primary"
  onClick={handleCustomFilterApply}
  disabled={!isCustomFiltersValid} // Disabled when validation fails
>
  Apply
</Button>
```

### User Experience

- ✅ **Valid State**: Apply button is enabled, user can apply filters
- ❌ **Invalid State**: Apply button is disabled (grayed out), preventing invalid filter application
- 🔄 **Real-time Updates**: Button state updates immediately as user corrects validation errors

### Example Scenarios

1. **Min/Max Validation**: If min salary > max salary, Apply button is disabled
2. **Required Fields**: If a required filter is empty, Apply button is disabled
3. **Selection Limits**: If multiselect has too many/few selections, Apply button is disabled

---

## Complete Example

Here's a complete example demonstrating both conditional enable/disable and validation:

```javascript
const customFilterConfig = [
  {
    id: 'salary-section',
    type: 'section',
    label: 'Salary Filters',
    defaultOpen: true,
    filters: [
      {
        id: 'minSalary',
        type: 'number',
        label: 'Min Salary (with validation)',
        placeholder: 'Enter minimum salary',
        min: 0,
        step: 1000,
        validation: {
          min: 0,
          custom: (value, allFilters) => {
            // Ensure min doesn't exceed max
            if (allFilters.maxSalary && value > allFilters.maxSalary) {
              return false;
            }
            return true;
          },
          message: 'Min salary cannot exceed max salary',
        },
      },
      {
        id: 'maxSalary',
        type: 'number',
        label: 'Max Salary (disabled until min is set)',
        placeholder: 'Enter maximum salary',
        min: 0,
        step: 1000,
        // Conditional disable: only enabled when minSalary has a value
        disabled: (allFilters) => !allFilters.minSalary,
        validation: {
          min: 0,
          message: 'Max salary must be greater than 0',
        },
      },
    ],
  },
  {
    id: 'skills-section',
    type: 'section',
    label: 'Skills',
    defaultOpen: true,
    filters: [
      {
        id: 'skills',
        type: 'multiselect',
        label: 'Skills (select 1-3)',
        options: [
          { value: 'React', label: 'React' },
          { value: 'Node.js', label: 'Node.js' },
          { value: 'Python', label: 'Python' },
          { value: 'AWS', label: 'AWS' },
        ],
        placeholder: 'Select skills',
        validation: {
          min: 1,
          max: 3,
          message: 'Please select between 1 and 3 skills',
        },
      },
    ],
  },
];
```

### Using the Hook

```javascript
import useCustomFilters from './hooks/useCustomFilters';

const MyComponent = () => {
  const {
    filters, // Current filter values
    errors, // Validation errors
    updateFilter, // Update a filter value
    resetFilters, // Reset all filters
    isFilterDisabled, // Check if a filter is disabled
    isFilterVisible, // Check if a filter is visible
    getFilterError, // Get error for a specific filter
    isValid, // Overall validation state
  } = useCustomFilters(customFilterConfig);

  // Use the hook values in your component
  return (
    <div>
      {/* Your filter UI */}
      <button disabled={!isValid}>Apply Filters</button>
    </div>
  );
};
```

---

## Additional Features

### Visible Condition

Similar to `disabled`, you can conditionally show/hide filters:

```javascript
{
  id: "advancedFilter",
  type: "text",
  label: "Advanced Filter",
  visible: (allFilters) => allFilters.showAdvanced === true
}
```

### Transform Function

Transform filter values before they're stored:

```javascript
{
  id: "email",
  type: "text",
  label: "Email",
  transform: (value) => value.toLowerCase().trim()
}
```

### onChange Callback

Execute custom logic when a filter changes:

```javascript
{
  id: "country",
  type: "dropdown",
  label: "Country",
  onChange: (value, allFilters, setFilters) => {
    // Reset dependent filters when country changes
    setFilters({
      ...allFilters,
      country: value,
      state: null,
      city: null
    });
  }
}
```

---

## Best Practices

1. **Keep validation messages clear and actionable**
2. **Use conditional disable for dependent filters** rather than hiding them
3. **Combine validation rules** for comprehensive validation
4. **Test edge cases** in your custom validation functions
5. **Provide helpful placeholder text** for disabled filters explaining why they're disabled

---

## See Also

- [Playground Examples](../../../../playground/src/components/tanstackTable/) - Complete working examples
- [useCustomFilters.js](../hooks/useCustomFilters.js) - Hook implementation
- [customFilterPanel.jsx](../components/filterPanel/customFilters/customFilterPanel.jsx) - Panel component
- [renderCustomFilter.jsx](../components/filterPanel/customFilters/renderCustomFilter.jsx) - Filter renderer
