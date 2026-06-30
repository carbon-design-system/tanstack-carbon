export const DEFAULT_EMPTY_STATE = {
  title: 'No data available',
  subtitle: 'Try adjusting your filters',
  render: null,
};

export const getTanstackTableFeatures = (features = null) => {
  const pagination = features?.pagination ?? null;
  const sorting = features?.sorting ?? null;
  const search = features?.search ?? null;
  const virtualization = features?.virtualization ?? null;
  const columnPinning = features?.columnPinning ?? null;
  const columnSettings = features?.columnSettings ?? null;
  const selection = features?.selection ?? null;
  const editing = features?.editing ?? null;
  const expansion = features?.expansion ?? null;
  const sideFilterPanel = features?.sideFilterPanel ?? null;

  return {
    pagination,
    sorting,
    search,
    virtualization,
    columnPinning,
    columnSettings,
    selection,
    editing,
    expansion,
    sideFilterPanel,
  };
};

export const getSelectionFeatureConfig = (selectionFeature = null) => ({
  type: selectionFeature?.type ?? null,
  batchActions: selectionFeature?.batchActions ?? [],
  onChange: selectionFeature?.onChange,
});

export const getEditingFeatureConfig = (editingFeature = null) => ({
  enabled: !!editingFeature?.enabled,
  onDataChange: editingFeature?.onDataChange,
});

export const getSideFilterPanelFeatureConfig = (sideFilterPanelFeature = null) => {
  const hasCustomConfig = !!sideFilterPanelFeature?.config;

  return {
    enabled: !!sideFilterPanelFeature,
    hasCustomConfig,
    width: sideFilterPanelFeature?.width ?? 350,
    onAdvancedFilterClick: sideFilterPanelFeature?.onAdvancedFilterClick,
    onApply: sideFilterPanelFeature?.onApply,
    onReset: sideFilterPanelFeature?.onReset,
    customFilters: hasCustomConfig ? sideFilterPanelFeature : null,
  };
};

export const getSearchFeatureConfig = (searchFeature = null) => ({
  onChange: searchFeature?.onChange,
  debounceDelay: searchFeature?.debounceDelay ?? 500,
});

export const getColumnSettingsFeatureConfig = (columnSettingsFeature = null) => ({
  visibility: columnSettingsFeature?.visibility,
  order: columnSettingsFeature?.order,
  onVisibilityChange: columnSettingsFeature?.onVisibilityChange,
  onOrderChange: columnSettingsFeature?.onOrderChange,
  localStorageKey: columnSettingsFeature?.localStorageKey,
});

export const getTableModeFlags = ({
  searchOnChange,
  sortingServerSide = false,
  paginationOnChange,
  hasCustomSideFilterConfig = false,
}) => {
  const isServerSideSearch = typeof searchOnChange === 'function';
  const isServerSidePagination = !!paginationOnChange;
  const isServerSideFiltering = hasCustomSideFilterConfig;
  const isServerSideTable =
    isServerSideSearch || sortingServerSide || isServerSidePagination || isServerSideFiltering;

  return {
    isServerSideSearch,
    isServerSidePagination,
    isServerSideFiltering,
    isServerSideTable,
  };
};

export const getToolbarFeatureFlags = (toolbar = null) => ({
  enableFilterSidePanel: toolbar?.some((item) => item.type === 'filter') ?? false,
  enableCustomizeColumn:
    toolbar?.some(
      (item) =>
        item.type === 'settings' &&
        item.menuItems?.some((menuItem) => menuItem.type === 'columnSettings')
    ) ?? false,
});

export const getStickyColumnConfig = (columnPinning = null) => ({
  enableStickyColumns:
    !!columnPinning &&
    ((columnPinning.left?.length ?? 0) > 0 || (columnPinning.right?.length ?? 0) > 0),
});

export const getEmptyStateConfig = (emptyState = DEFAULT_EMPTY_STATE) => {
  const mergedEmptyState = {
    ...DEFAULT_EMPTY_STATE,
    ...(emptyState ?? {}),
  };

  return {
    title: mergedEmptyState.title,
    subtitle: mergedEmptyState.subtitle,
    render: mergedEmptyState.render,
  };
};
