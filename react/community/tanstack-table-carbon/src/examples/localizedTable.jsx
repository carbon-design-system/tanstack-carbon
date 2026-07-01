import { useMemo, useState } from 'react';
import { TanstackTable } from '@/lib';
import { useTranslation } from 'react-i18next';
import { TableSplit as TableIcon } from '@carbon/icons-react';
import { Breadcrumb, BreadcrumbItem, Dropdown } from '@carbon/react';
import commonStyles from './scss/common.module.scss';

const LocalizedTable = () => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language || 'en'
  );

  const languageOptions = [
    { id: 'en', label: 'English' },
    { id: 'de', label: 'Deutsch' },
  ];

  const handleLanguageChange = ({ selectedItem }) => {
    if (selectedItem) {
      setSelectedLanguage(selectedItem.id);
      i18n.changeLanguage(selectedItem.id);
    }
  };

  // Sample data - comprehensive data to test all filter types
  const data = useMemo(
    () => [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        status: 'active',
        age: 35,
        department: 'engineering',
        salary: 85000,
        joinDate: '2020-03-15',
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        status: 'active',
        age: 28,
        department: 'sales',
        salary: 65000,
        joinDate: '2021-06-20',
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'user',
        status: 'inactive',
        age: 42,
        department: 'marketing',
        salary: 72000,
        joinDate: '2019-01-10',
      },
      {
        id: 4,
        name: 'Alice Brown',
        email: 'alice@example.com',
        role: 'manager',
        status: 'active',
        age: 38,
        department: 'engineering',
        salary: 95000,
        joinDate: '2018-09-05',
      },
      {
        id: 5,
        name: 'Charlie Wilson',
        email: 'charlie@example.com',
        role: 'user',
        status: 'active',
        age: 31,
        department: 'hr',
        salary: 68000,
        joinDate: '2022-02-14',
      },
      {
        id: 6,
        name: 'Diana Prince',
        email: 'diana@example.com',
        role: 'developer',
        status: 'active',
        age: 29,
        department: 'engineering',
        salary: 78000,
        joinDate: '2021-11-30',
      },
      {
        id: 7,
        name: 'Eve Martinez',
        email: 'eve@example.com',
        role: 'manager',
        status: 'active',
        age: 45,
        department: 'sales',
        salary: 92000,
        joinDate: '2017-05-22',
      },
      {
        id: 8,
        name: 'Frank Lee',
        email: 'frank@example.com',
        role: 'developer',
        status: 'inactive',
        age: 33,
        department: 'engineering',
        salary: 81000,
        joinDate: '2020-08-18',
      },
    ],
    []
  );

  // Column definitions with translated headers and various filter types
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('table.columns.name'),
        size: 200,
        meta: { filterVariant: 'text' },
      },
      {
        accessorKey: 'email',
        header: t('table.columns.email'),
        size: 250,
        meta: { filterVariant: 'text' },
      },
      {
        accessorKey: 'role',
        header: t('table.columns.role'),
        size: 150,
        cell: ({ getValue }) => t(`table.roles.${getValue()}`),
        meta: { filterVariant: 'select' },
      },
      {
        accessorKey: 'status',
        header: t('table.columns.status'),
        size: 120,
        cell: ({ getValue }) => t(`table.statuses.${getValue()}`),
        meta: { filterVariant: 'checkbox' },
      },
      {
        accessorKey: 'age',
        header: t('table.columns.age'),
        size: 100,
        meta: { filterVariant: 'number' },
      },
      {
        accessorKey: 'department',
        header: t('table.columns.department'),
        size: 150,
        cell: ({ getValue }) => t(`table.departments.${getValue()}`),
        meta: { filterVariant: 'multiselect' },
      },
      {
        accessorKey: 'salary',
        header: t('table.columns.salary'),
        size: 120,
        cell: ({ getValue }) => `$${getValue().toLocaleString()}`,
        meta: { filterVariant: 'slider' },
      },
      {
        accessorKey: 'joinDate',
        header: t('table.columns.joinDate'),
        size: 150,
        meta: { filterVariant: 'dateRange' },
      },
    ],
    [t]
  );

  // Create localized labels from i18next translations
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
      paginationItemRangeText: t('table.pagination.itemRange'),
      paginationItemText: t('table.pagination.items'),
      paginationPageRangeText: t('table.pagination.pageRange'),
      paginationPageText: t('table.pagination.page'),
      paginationPageUnknownText: t('table.pagination.pageUnknown'),

      // Empty State
      emptyStateTitle: t('table.emptyState.title'),
      emptyStateSubtitle: t('table.emptyState.subtitle'),

      // Filter Panel
      filterPanelTitle: t('table.filterPanel.title'),
      filterPanelCloseTooltip: t('table.filterPanel.close'),
      filterPanelAdvancedButton: t('table.filterPanel.advancedFilters'),
      filterPanelSearchLabel: t('table.filterPanel.searchLabel'),
      filterPanelSearchPlaceholder: t('table.filterPanel.searchPlaceholder'),
      filterPanelClearSearchTooltip: t('table.filterPanel.clearSearchTooltip'),
      filterPanelApplyButton: t('table.filterPanel.apply'),
      filterPanelClearButton: t('table.filterPanel.clear'),
      filterPanelNoFiltersText: t('table.filterPanel.noFilters'),
      filterFieldFallbackLabel: t('table.filterPanel.fieldFallback'),
      filterFieldPlaceholder: t('table.filterPanel.fieldPlaceholder'),
      filterFieldNoMatchText: t('table.filterPanel.fieldNoMatch'),
      filterFieldNoOptionsText: t('table.filterPanel.fieldNoOptions'),
      filterDropdownLabel: t('table.filterPanel.dropdownLabel'),
      filterMultiSelectLabel: t('table.filterPanel.multiSelectLabel'),
      filterDateRangeEndLabel: t('table.filterPanel.dateRangeEndLabel'),
      filterNumberInvalidError: t('table.filterPanel.numberInvalidError'),
      filterSliderNoValuesText: t('table.filterPanel.sliderNoValues'),

      // Column Customization
      columnCustomizationHeading:
        t('table.columnCustomization.title') + ' ({visible}/{total})',
      columnCustomizationDescription: t(
        'table.columnCustomization.description'
      ),
      columnCustomizationSearchPlaceholder: t(
        'table.columnCustomization.searchPlaceholder'
      ),
      columnCustomizationSelectAllLabel: t(
        'table.columnCustomization.selectAll'
      ),
      columnCustomizationApplyButton: t('table.columnCustomization.apply'),
      columnCustomizationCancelButton: t('table.columnCustomization.cancel'),
    }),
    [t, i18n.language]
  );

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem',
            }}>
            <div style={{ flex: 1 }}>
              <h2 className="example-title">Localized Table</h2>
            </div>
            <div style={{ minWidth: '200px' }}>
              <Dropdown
                id="language-selector"
                titleText="Language"
                label="Select language"
                items={languageOptions}
                itemToString={(item) => (item ? item.label : '')}
                selectedItem={languageOptions.find(
                  (lang) => lang.id === selectedLanguage
                )}
                onChange={handleLanguageChange}
              />
            </div>
          </div>
          <p className="example-description">
            The TanStack Table library itself does not include any localization
            library. This example demonstrates how consuming applications can
            integrate their preferred localization solution. Here, we use
            i18next for localization. Switch languages using the language
            selector above to see all table labels, column headers, and cell
            values automatically translate.
          </p>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <TanstackTable
          key={i18n.language}
          data={data}
          columns={columns}
          labels={labels}
          features={{
            pagination: {
              pageSize: 10,
              pageSizeOptions: [5, 10, 20, 50],
            },
            search: {},
            sorting: {},
            columnSettings: {
              localStorageKey: 'localized-table-settings',
            },
          }}
          toolbar={[
            { type: 'filter' },
            { type: 'search' },
            { type: 'settings' },
          ]}
        />
      </div>
    </>
  );
};

export default LocalizedTable;
