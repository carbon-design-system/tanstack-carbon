# Custom Filter Validation - Advanced Examples

This document demonstrates the flexibility and scalability of the validation system with real-world examples.

## Table of Contents

1. [Built-in Validations](#built-in-validations)
2. [Custom Validation Examples](#custom-validation-examples)
3. [Complex Validation Scenarios](#complex-validation-scenarios)
4. [Async Validation](#async-validation)
5. [Multiple Validation Rules](#multiple-validation-rules)

---

## Built-in Validations

### 1. Required Validation

Works with any filter type:

```javascript
{
  id: "department",
  type: "dropdown",
  label: "Department",
  validation: {
    required: true,
    message: "Please select a department"
  }
}
```

### 2. Min/Max for Numbers

```javascript
{
  id: "salary",
  type: "number",
  label: "Salary",
  validation: {
    min: 30000,
    max: 200000,
    message: "Salary must be between $30,000 and $200,000"
  }
}
```

### 3. Min/Max for Arrays (Multiselect, Checkbox)

```javascript
{
  id: "skills",
  type: "multiselect",
  label: "Skills",
  validation: {
    min: 2,
    max: 5,
    message: "Select between 2 and 5 skills"
  }
}
```

---

## Custom Validation Examples

### 1. Email Validation

```javascript
{
  id: "email",
  type: "text",
  label: "Email",
  validation: {
    custom: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !value || emailRegex.test(value);
    },
    message: "Please enter a valid email address"
  }
}
```

### 2. Phone Number Validation

```javascript
{
  id: "phone",
  type: "text",
  label: "Phone Number",
  validation: {
    custom: (value) => {
      const phoneRegex = /^\+?[\d\s-()]+$/;
      return !value || (phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10);
    },
    message: "Please enter a valid phone number (min 10 digits)"
  }
}
```

### 3. URL Validation

```javascript
{
  id: "website",
  type: "text",
  label: "Website",
  validation: {
    custom: (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: "Please enter a valid URL (e.g., https://example.com)"
  }
}
```

### 4. Date Range Validation

```javascript
{
  id: "startDate",
  type: "date",
  label: "Start Date",
  validation: {
    custom: (value, allFilters) => {
      if (!value || !allFilters.endDate) return true;
      return new Date(value) <= new Date(allFilters.endDate);
    },
    message: "Start date must be before end date"
  }
}
```

### 5. Password Strength Validation

```javascript
{
  id: "password",
  type: "text",
  label: "Password",
  validation: {
    custom: (value) => {
      if (!value) return true;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isLongEnough = value.length >= 8;

      return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough;
    },
    message: "Password must be 8+ chars with uppercase, lowercase, number, and special character"
  }
}
```

---

## Complex Validation Scenarios

### 1. Conditional Required (Based on Another Filter)

```javascript
{
  id: "companyName",
  type: "text",
  label: "Company Name",
  validation: {
    custom: (value, allFilters) => {
      // Required only if employment type is "Employed"
      if (allFilters.employmentType === "Employed") {
        return value && value.trim().length > 0;
      }
      return true;
    },
    message: "Company name is required for employed individuals"
  }
}
```

### 2. Cross-Field Validation (Budget Range)

```javascript
{
  id: "minBudget",
  type: "number",
  label: "Minimum Budget",
  validation: {
    custom: (value, allFilters) => {
      if (!value) return true;

      // Must be positive
      if (value < 0) return false;

      // Must be less than max budget
      if (allFilters.maxBudget && value > allFilters.maxBudget) {
        return false;
      }

      // Must be at least 10% less than max budget
      if (allFilters.maxBudget && value > allFilters.maxBudget * 0.9) {
        return false;
      }

      return true;
    },
    message: "Min budget must be positive and at least 10% less than max budget"
  }
}
```

### 3. Array Content Validation

```javascript
{
  id: "teamMembers",
  type: "multiselect",
  label: "Team Members",
  validation: {
    custom: (value, allFilters) => {
      if (!value || value.length === 0) return true;

      // Must include at least one senior member
      const seniorMembers = ["John", "Jane", "Bob"];
      const hasSenior = value.some(member => seniorMembers.includes(member));

      return hasSenior;
    },
    message: "Team must include at least one senior member (John, Jane, or Bob)"
  }
}
```

### 4. Business Hours Validation

```javascript
{
  id: "appointmentTime",
  type: "time",
  label: "Appointment Time",
  validation: {
    custom: (value) => {
      if (!value) return true;

      const [hours, minutes] = value.split(':').map(Number);
      const timeInMinutes = hours * 60 + minutes;

      // Business hours: 9 AM (540 min) to 5 PM (1020 min)
      const businessStart = 9 * 60;
      const businessEnd = 17 * 60;

      return timeInMinutes >= businessStart && timeInMinutes <= businessEnd;
    },
    message: "Appointments must be between 9:00 AM and 5:00 PM"
  }
}
```

### 5. Percentage Sum Validation

```javascript
{
  id: "allocation1",
  type: "number",
  label: "Allocation 1 (%)",
  validation: {
    custom: (value, allFilters) => {
      const total = (value || 0) +
                    (allFilters.allocation2 || 0) +
                    (allFilters.allocation3 || 0);
      return total <= 100;
    },
    message: "Total allocation cannot exceed 100%"
  }
}
```

---

## Async Validation

For async validation (API calls, database checks), use the `onChange` callback:

```javascript
{
  id: "username",
  type: "text",
  label: "Username",
  onChange: async (value, allFilters, setFilters) => {
    if (!value) return;

    // Debounce API call
    clearTimeout(window.usernameCheckTimeout);
    window.usernameCheckTimeout = setTimeout(async () => {
      const isAvailable = await checkUsernameAvailability(value);

      if (!isAvailable) {
        // Set custom error via a separate state management
        // Or use a validation flag in allFilters
        setFilters({
          ...allFilters,
          username: value,
          _usernameError: "Username is already taken"
        });
      }
    }, 500);
  },
  validation: {
    custom: (value, allFilters) => {
      // Check if async validation set an error
      return !allFilters._usernameError;
    },
    message: allFilters => allFilters._usernameError || "Invalid username"
  }
}
```

---

## Multiple Validation Rules

Combine multiple validations for comprehensive checks:

```javascript
{
  id: "age",
  type: "number",
  label: "Age",
  validation: {
    required: true,
    min: 18,
    max: 120,
    custom: (value, allFilters) => {
      // Additional custom logic
      if (allFilters.role === "Senior" && value < 30) {
        return false;
      }
      return true;
    },
    message: "Age must be 18-120, and seniors must be 30+"
  }
}
```

---

## Validation Best Practices

### 1. **Clear Error Messages**

```javascript
// ❌ Bad
message: 'Invalid';

// ✅ Good
message: 'Email must be in format: user@example.com';
```

### 2. **Handle Edge Cases**

```javascript
custom: (value, allFilters) => {
  // Handle null, undefined, empty string
  if (!value) return true;

  // Your validation logic
  return someCondition;
};
```

### 3. **Use Descriptive Validation Logic**

```javascript
custom: (value, allFilters) => {
  const isValidFormat = /^\d{3}-\d{3}-\d{4}$/.test(value);
  const isNotBlacklisted = !BLACKLISTED_NUMBERS.includes(value);
  const isInServiceArea = checkServiceArea(value);

  return isValidFormat && isNotBlacklisted && isInServiceArea;
};
```

### 4. **Provide Helpful Feedback**

```javascript
validation: {
  custom: (value) => {
    if (!value) return true;

    const errors = [];
    if (!/[A-Z]/.test(value)) errors.push("uppercase letter");
    if (!/[a-z]/.test(value)) errors.push("lowercase letter");
    if (!/\d/.test(value)) errors.push("number");

    return errors.length === 0;
  },
  message: (value) => {
    const missing = [];
    if (!/[A-Z]/.test(value)) missing.push("uppercase");
    if (!/[a-z]/.test(value)) missing.push("lowercase");
    if (!/\d/.test(value)) missing.push("number");

    return `Password must include: ${missing.join(", ")}`;
  }
}
```

---

## Extending the Validation System

If you need to add new built-in validation types, modify `useCustomFilters.js`:

```javascript
// Add to validateFilter function
if (validation.pattern) {
  const regex = new RegExp(validation.pattern);
  if (!regex.test(value)) {
    return validation.message || 'Value does not match required pattern';
  }
}

if (validation.minLength) {
  if (typeof value === 'string' && value.length < validation.minLength) {
    return validation.message || `Minimum length is ${validation.minLength}`;
  }
}

if (validation.maxLength) {
  if (typeof value === 'string' && value.length > validation.maxLength) {
    return validation.message || `Maximum length is ${validation.maxLength}`;
  }
}
```

---

## Conclusion

The validation system is **highly scalable** because:

1. ✅ **Custom validation function** accepts ANY logic
2. ✅ **Access to all filter values** for cross-field validation
3. ✅ **Built-in validations** handle common cases
4. ✅ **Easy to extend** with new built-in types
5. ✅ **Type-agnostic** - works with any filter type
6. ✅ **Composable** - combine multiple validation rules
7. ✅ **Flexible error messages** - static or dynamic

Developers can implement **any validation requirement** using the custom validation function!
