/**
 * Standard size mapping for most Carbon components
 * Used by: Dropdown, MultiSelect, TimePicker, DatePickerInput, Search, TextInput, NumberInput
 * Supports: "sm", "md", "lg"
 */
export const STANDARD_SIZE_MAP = {
  xs: 'sm',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'lg',
};

/**
 * Button size mapping for action buttons
 * Used by: Button (primary, secondary, ghost)
 * Supports: "md", "lg", "xl"
 */
export const BUTTON_SIZE_MAP = {
  xs: 'md',
  sm: 'md',
  md: 'lg',
  lg: 'lg',
  xl: 'xl',
};

export const AVAILABLE_SIZE_MAP = STANDARD_SIZE_MAP;

export const MAX_VISIBLE_FILTER_TAGS = 7;

export const DEFAULT_PAGINATION = {
  pageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
};
