import { ReactNode, ReactElement } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';

export interface SettingsMenuItem {
  type?: 'columnSettings';
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  isDelete?: boolean;
  hasDivider?: boolean;
}

export type ToolbarItem =
  | { type: 'filter' }
  | { type: 'search' }
  | { type: 'settings'; menuItems?: SettingsMenuItem[] }
  | { type: 'custom'; element: ReactElement };

export interface PaginationFeature {
  pageSize?: number;
  pageSizeOptions?: number[];
  onChange?: (pageIndex: number, pageSize: number) => void;
  totalRows?: number;
}

export interface VirtualizationFeature {
  estimateSize?: number;
  overscan?: number;
}

export interface ExpansionFeature {
  renderExpandedRow: (row: Row<any>) => ReactNode;
  onExpandedChange?: (expandedRows: Record<string, boolean>) => void;
  expandColumnPosition?: 'first' | 'afterSelection' | 'last';
}

export interface SelectionFeature {
  type?: 'checkbox' | 'radio';
  onChange?: (selectedRows: any[]) => void;
  batchActions?: ReactElement;
}

export interface EditingFeature {
  enabled?: boolean;
  onDataChange?: (rowIndex: number, columnId: string, value: any) => void;
}

export interface SearchFeature {
  onChange?: (searchValue: string) => void;
  debounceDelay?: number;
}

export interface SortingFeature {
  onChange?: (sorting: Array<{ id: string; desc: boolean }>) => void;
}

export interface ColumnPinningFeature {
  enableStickyColumns?: boolean;
  left?: string[];
  right?: string[];
}

export interface ColumnSettingsFeature {
  visibility?: Record<string, boolean>;
  order?: string[];
  onVisibilityChange?: (visibility: Record<string, boolean>) => void;
  onOrderChange?: (order: string[]) => void;
  localStorageKey?: string;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterValidation {
  min?: number;
  max?: number;
  custom?: (value: any, allFilters: Record<string, any>) => boolean;
  message?: string;
}

export type CustomFilterItem =
  | {
      id: string;
      type: 'text';
      label: string;
      placeholder?: string;
      defaultValue?: string;
    }
  | {
      id: string;
      type: 'checkbox';
      label: string;
      options: FilterOption[];
      defaultValue?: string[];
    }
  | {
      id: string;
      type: 'dropdown';
      label: string;
      options: FilterOption[];
      placeholder?: string;
      defaultValue?: string;
    }
  | {
      id: string;
      type: 'radio';
      label: string;
      options: FilterOption[];
      defaultValue?: string;
    }
  | {
      id: string;
      type: 'number';
      label: string;
      placeholder?: string;
      min?: number;
      max?: number;
      step?: number;
      defaultValue?: number;
      disabled?: (allFilters: Record<string, any>) => boolean;
      validation?: FilterValidation;
    }
  | {
      id: string;
      type: 'slider';
      label: string;
      min: number;
      max: number;
      step?: number;
      defaultValue?: number;
      hideTextInput?: boolean;
    }
  | {
      id: string;
      type: 'date';
      label: string;
      defaultValue?: string;
      dateFormat?: string;
    }
  | {
      id: string;
      type: 'dateRange';
      label: string;
      defaultValue?: { start?: string; end?: string };
      dateFormat?: string;
    }
  | {
      id: string;
      type: 'time';
      label: string;
      defaultValue?: string;
    }
  | {
      id: string;
      type: 'multiselect';
      label: string;
      options: FilterOption[];
      placeholder?: string;
      defaultValue?: string[];
      validation?: FilterValidation;
    };

export interface CustomFilterSection {
  id: string;
  type: 'section';
  label: string;
  defaultOpen?: boolean;
  filters: CustomFilterItem[];
}

/** A config entry is either a standalone filter item or an accordion section */
export type CustomFilterConfigEntry = CustomFilterItem | CustomFilterSection;

export interface SideFilterPanelFeature {
  /** Panel width in pixels (default: 350) */
  width?: number;
  /** Called when "Advanced filters" link is clicked */
  onAdvancedFilterClick?: () => void;
  /**
   * Called when Apply is clicked in custom-filter mode.
   * Receives the flat map of all filter values.
   */
  onApply?: (
    filterValues: Record<string, any>,
    meta?: { changedFilters: string[] }
  ) => void;
  /** Called when Clear/Reset is clicked in custom-filter mode */
  onReset?: (
    filterValues: Record<string, any>,
    meta?: { changedFilters: string[] }
  ) => void;
  /**
   * Custom filter configuration — array of filter items and/or accordion sections.
   * When provided, the panel renders these instead of column-based filters.
   */
  config?: CustomFilterConfigEntry[];
  /** Hide the search box at the top of the filter panel (default: false) */
  hideSearch?: boolean;
}

export interface TableFeatures {
  pagination?: PaginationFeature;
  virtualization?: VirtualizationFeature;
  expansion?: ExpansionFeature;
  selection?: SelectionFeature;
  editing?: EditingFeature;
  search?: SearchFeature;
  sorting?: SortingFeature;
  columnPinning?: ColumnPinningFeature;
  columnSettings?: ColumnSettingsFeature;
  sideFilterPanel?: SideFilterPanelFeature;
}

export interface EmptyState {
  title?: string;
  subtitle?: string;
  render?: () => ReactNode;
}

export interface TanstackTableLabels {
  // NOTE: Toolbar
  toolbarFilterTooltip?: string;
  toolbarSettingsTooltip?: string;
  toolbarSettingsAriaLabel?: string;
  toolbarSearchPlaceholder?: string;
  toolbarAriaLabel?: string;
  toolbarColumnSettingsMenuItem?: string;

  // NOTE: Batch Actions
  batchActionsMenuTooltip?: string;
  batchActionsMenuAriaLabel?: string;
  batchActionsMenuLabel?: string;

  // NOTE: Pagination
  paginationPreviousTooltip?: string;
  paginationNextTooltip?: string;
  paginationItemsPerPageLabel?: string;
  paginationItemRangeText?: string;
  paginationItemText?: string;
  paginationPageRangeText?: string;
  paginationPageText?: string;
  paginationPageUnknownText?: string;

  // NOTE: Empty State
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  emptyStateNoResultsTitle?: string;
  emptyStateImageAlt?: string;

  // NOTE: Filter Panel
  filterPanelTitle?: string;
  filterPanelCloseTooltip?: string;
  filterPanelAdvancedButton?: string;
  filterPanelSearchLabel?: string;
  filterPanelSearchPlaceholder?: string;
  filterPanelClearSearchTooltip?: string;
  filterPanelApplyButton?: string;
  filterPanelClearButton?: string;
  filterPanelNoFiltersText?: string;
  filterPanelNoMatchText?: string;
  filterFieldFallbackLabel?: string;
  filterFieldPlaceholder?: string;
  filterFieldNoMatchText?: string;
  filterFieldNoOptionsText?: string;
  filterDropdownLabel?: string;
  filterMultiSelectLabel?: string;
  filterDatePlaceholder?: string;
  filterDateRangeStartLabel?: string;
  filterDateRangeEndLabel?: string;
  filterTimeAM?: string;
  filterTimePM?: string;

  // NOTE: Column Customization
  columnCustomizationHeading?: string;
  columnCustomizationLabel?: string;
  columnCustomizationDescription?: string;
  columnCustomizationSearchLabel?: string;
  columnCustomizationSearchPlaceholder?: string;
  columnCustomizationClearSearchTooltip?: string;
  columnCustomizationSelectAllLabel?: string;
  columnCustomizationApplyButton?: string;
  columnCustomizationCancelButton?: string;

  // NOTE: Editable Cells
  editableCellLabel?: string;
  editableDateCellLabel?: string;
  editableDateCellPlaceholder?: string;

  // NOTE: Selection
  selectionSelectAllLabel?: string;
  selectionSelectRowLabel?: string;

  // NOTE: Accessibility
  a11yTableLabel?: string;
  a11yColumnSortLabel?: string;
  a11yColumnSortAscending?: string;
  a11yColumnSortDescending?: string;
  a11yRowExpandTooltip?: string;
  a11yRowCollapseTooltip?: string;
  a11yRowSelectLabel?: string;
  a11yDragColumnTooltip?: string;
  a11yPinnedColumnTooltip?: string;
}

export interface TanstackTableProps {
  /** Array of data objects to display in the table */
  data?: any[];

  /** Column definitions using TanStack Table's ColumnDef format */
  columns?: ColumnDef<any>[];

  /** Loading state - shows skeleton when true */
  isLoading?: boolean;

  /**
   * Toolbar configuration — array of toolbar elements with order control.
   * Pass `null`, `undefined`, or `[]` to show no toolbar at all.
   */
  toolbar?: ToolbarItem[] | null;

  /** Feature configuration object */
  features?: TableFeatures | null;

  /** Empty state configuration */
  emptyState?: EmptyState;

  /** Explicit height (e.g., "500px" or 500). If null, auto-calculates from parent */
  height?: string | number | null;

  /** Table size: "xs", "sm", "md", "lg", "xl" */
  tableSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** Enable zebra striping for table rows */
  useZebraStyles?: boolean;

  /** Localization labels - override default English labels */
  labels?: TanstackTableLabels;
}

declare const TanstackTable: React.FC<TanstackTableProps>;

export default TanstackTable;
