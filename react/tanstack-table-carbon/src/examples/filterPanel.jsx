import React, { useMemo } from 'react';
import { TanstackTable } from '@/lib';
import {
  TableSplit as TableIcon,
  TrashCan,
  Download,
} from '@carbon/icons-react';
import { Breadcrumb, BreadcrumbItem } from '@carbon/react';
import commonStyles from './scss/common.module.scss';

// Sample data generator
const makeData = (count) => {
  const statuses = ['Active', 'Inactive', 'Pending', 'Completed'];
  const categories = ['Category A', 'Category B', 'Category C'];
  const priorities = ['High', 'Medium', 'Low'];
  const types = ['Type 1', 'Type 2', 'Type 3', 'Type 4'];
  const verified = ['Verified', 'Unverified'];

  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    name: `Item ${i + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    type: types[Math.floor(Math.random() * types.length)],
    verified: verified[Math.floor(Math.random() * verified.length)],
    amount: Math.floor(Math.random() * 10000) + 1000,
    score: Math.floor(Math.random() * 100),
    description: `Description for item ${i + 1}`,
    createdDate: new Date(
      2024,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )
      .toISOString()
      .split('T')[0],
  }));
};

/**
 * Example: TanstackTable with Filter Panel
 *
 * Demonstrates:
 * - Filter panel with multiple filter types
 * - Text filter (name, description)
 * - Select/Dropdown filter (status)
 * - Checkbox filter (category, priority)
 * - Radio filter (type)
 * - Toggle filter (verified)
 * - Number filter (amount)
 * - Slider filter (score)
 * - Date filter (createdDate)
 * - MultiSelect filter (available via meta.filterVariant)
 */
const ExampleWithFilterPanel = () => {
  // All hooks must be declared first
  const data = useMemo(() => makeData(50), []);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        enableColumnFilter: true,
        meta: {
          filterVariant: 'text', // Text input filter (default)
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableColumnFilter: true,
        meta: {
          filterVariant: 'select', // Dropdown filter
        },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        enableColumnFilter: true,
        meta: {
          filterVariant: 'checkbox', // Checkbox group filter (OR logic)
        },
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        enableColumnFilter: true,
        meta: {
          filterVariant: 'multiselect', // MultiSelect filter (OR logic)
        },
      },
      {
        accessorKey: 'type',
        header: 'Type',
        enableColumnFilter: true,
        meta: {
          filterVariant: 'radio', // Radio button filter
        },
      },
      {
        accessorKey: 'verified',
        header: 'Verified',
        enableColumnFilter: true,
        meta: {
          filterVariant: 'checkbox', // Checkbox filter
        },
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        enableColumnFilter: true,
        cell: (info) => `$${info.getValue().toLocaleString()}`,
        meta: {
          filterVariant: 'number', // Number input filter
        },
      },
      {
        accessorKey: 'score',
        header: 'Score',
        enableColumnFilter: true,
        meta: {
          filterVariant: 'slider', // Slider filter
        },
      },
      {
        accessorKey: 'createdDate',
        header: 'Created Date',
        enableColumnFilter: true,
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        meta: {
          filterVariant: 'date', // Date picker filter
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        enableColumnFilter: true,
        meta: {
          filterVariant: 'text', // Text input filter
        },
      },
    ],
    []
  );

  // Batch actions for selected rows
  const batchActions = [
    {
      label: 'Delete',
      icon: TrashCan,
      onClick: (selectedRows) => {
        // eslint-disable-next-line no-console
        console.log('Delete selected:', selectedRows);
        alert(`Delete ${selectedRows.length} item(s)?`);
      },
    },
    {
      label: 'Export',
      icon: Download,
      onClick: (selectedRows) => {
        // eslint-disable-next-line no-console
        console.log('Export selected:', selectedRows);
        alert(`Exporting ${selectedRows.length} item(s)...`);
      },
    },
  ];

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Filter Panel - All Filter Types</h2>
          <p className="example-description">
            Click the filter icon in the toolbar to open the filter panel. This
            example demonstrates all available filter types: text, select,
            checkbox, multiselect, radio, toggle, number, slider, and date
            filters.
          </p>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <TanstackTable
          data={data}
          columns={columns}
          toolbar={[
            { type: 'filter' },
            { type: 'search' },
            { type: 'settings' },
          ]}
          features={{
            pagination: {
              pageSize: 10,
              pageSizeOptions: [10, 20, 30, 50],
            },
            selection: {
              type: 'checkbox',
              batchActions,
            },
            sideFilterPanel: {
              onAdvancedFilterClick: () => {
                // eslint-disable-next-line no-console
                console.log('Advanced filter clicked');
              },
              onApply: (payload) => {
                // eslint-disable-next-line no-console
                console.log('Client side filter apply:', payload);
              },
              onReset: (payload) => {
                // eslint-disable-next-line no-console
                console.log('Client side filter reset:', payload);
              },
            },
          }}
          tableSize="md"
          useZebraStyles={false}
        />
      </div>
    </>
  );
};

export default ExampleWithFilterPanel;
