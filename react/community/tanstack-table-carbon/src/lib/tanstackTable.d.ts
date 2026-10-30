import { ReactNode, ReactElement, ComponentType, FC } from 'react';
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
  /** Current page index (0-based). Used for server-side pagination. */
  pageIndex?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  /** Providing this switches the table to server-side pagination. */
  onChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  /** Server-side pagination: total number of rows across all pages. */
  rowCount?: number;
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

export interface BatchActionOption {
  id: string;
  label: string;
  isDelete?: boolean;
  hasDivider?: boolean;
  disabled?: boolean;
}

export type BatchAction =
  | {
      /** Regular action button (default when `type` is omitted) */
      type?: 'button';
      label: string;
      icon?: ComponentType<any>;
      onClick: (selectedRows: any[]) => void;
    }
  | {
      type: 'overflow';
      label?: string;
      options: BatchActionOption[];
      onOptionClick: (optionId: string, selectedRows: any[]) => void;
    }
  | {
      type: 'custom';
      /** Element, or a function that receives the selected rows and returns an element */
      element: ReactNode | ((selectedRows: any[]) => ReactNode);
    };

export interface SelectionFeature {
  type?: 'checkbox' | 'radio';
  onChange?: (selectedRows: any[]) => void;
  batchActions?: BatchAction[];
  /** When true, shows the "Select all" button in the batch action bar. Defaults to false. */
  showBatchSelectAll?: boolean;
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
  /** Controlled sorting state. Use together with `onChange` for server-side sorting. */
  sorting?: Array<{ id: string; desc: boolean }>;
  /** Providing this switches the table to server-side sorting. */
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
  required?: boolean;
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

/** A column filter entry (`id` is the column id) */
export interface ChangedFilter {
  id: string;
  value: any;
}

/** Payload passed to `onApply` / `onReset` in column filter mode */
export interface SideFilterPanelColumnPayload {
  /** The full set of currently applied filters — use this to build a server-side request. */
  allFilters: ChangedFilter[];
  /** Only the filters that changed since the last Apply/Reset. */
  changedFilters: ChangedFilter[];
}

interface SideFilterPanelBase {
  /** Panel width in pixels (default: 350) */
  width?: number;
  /** Called when "Advanced filters" link is clicked */
  onAdvancedFilterClick?: () => void;
  /** Hide the search box at the top of the filter panel (default: false) */
  hideSearch?: boolean;
}

/**
 * Custom filter mode — `config` is provided and the panel renders it instead of
 * column-based filters. `onApply` and `onReset` are both required in this mode.
 */
export interface SideFilterPanelCustomMode extends SideFilterPanelBase {
  /** Custom filter configuration — array of filter items and/or accordion sections. */
  config: CustomFilterConfigEntry[];
  /**
   * Called when Apply is clicked.
   * `filterValues` is the flat map of all filter values; `meta.changedFilters` lists the
   * filters that changed since the last Apply/Reset.
   */
  onApply: (
    filterValues: Record<string, any>,
    meta: { changedFilters: ChangedFilter[] }
  ) => void;
  /** Called when Clear/Reset is clicked. `filterValues` is the reset state of the filters. */
  onReset: (
    filterValues: Record<string, any>,
    meta: { changedFilters: ChangedFilter[] }
  ) => void;
}

/**
 * Column filter mode — `config` is omitted and the panel builds filters from the columns.
 * Callbacks are optional notifications and receive a single payload object.
 */
export interface SideFilterPanelColumnMode extends SideFilterPanelBase {
  config?: undefined;
  /** Called after Apply. */
  onApply?: (payload: SideFilterPanelColumnPayload) => void;
  /** Called after Clear/Reset. `allFilters` and `changedFilters` are both empty arrays. */
  onReset?: (payload: SideFilterPanelColumnPayload) => void;
}

export type SideFilterPanelFeature =
  | SideFilterPanelCustomMode
  | SideFilterPanelColumnMode;

export interface TableStateSnapshot {
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  search?: string;
  filters?: Array<{ id: string; value: any }>;
  sorting?: Array<{ id: string; desc: boolean }>;
}

export interface StatePersistenceFeature {
  enabled?: boolean;
  initialState?: TableStateSnapshot;
  onStateChange?: (state: TableStateSnapshot) => void;
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
  statePersistence?: StatePersistenceFeature;
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
  batchActionsCancel?: string;
  batchActionsItemSelected?: string;
  batchActionsItemsSelected?: string;
  batchActionsSelectAll?: string;

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
  filterCheckboxViewAll?: string;
  filterCheckboxShowLess?: string;
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

  /** Explicit height in pixels (e.g. 500, "500px"), "100%" to fit parent container, or null for natural height */
  height?: string | number | null;

  /** Table size: "xs", "sm", "md", "lg", "xl" */
  tableSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** Enable zebra striping for table rows */
  useZebraStyles?: boolean;

  /** Localization labels - override default English labels */
  labels?: TanstackTableLabels;
}

declare const TanstackTable: FC<TanstackTableProps>;

export default TanstackTable;
