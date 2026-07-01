import React, { useState, useMemo } from 'react';
import { TanstackTable } from '@/lib';
import { TableSplit as TableIcon } from '@carbon/icons-react';
import { Breadcrumb, BreadcrumbItem } from '@carbon/react';
import commonStyles from './scss/common.module.scss';

/**
 * Example: TanStack Table with Custom Filters WITHOUT Accordion/Sections
 *
 * This example demonstrates using custom filters as standalone filters
 * without grouping them into accordion sections.
 */

const ExampleWithCustomFiltersNoAccordion = () => {
  const [data] = useState([
    {
      id: 1,
      name: 'John Doe',
      age: 28,
      department: 'Engineering',
      salary: 75000,
      status: 'Active',
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 34,
      department: 'Marketing',
      salary: 65000,
      status: 'Active',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      age: 45,
      department: 'Sales',
      salary: 80000,
      status: 'Inactive',
    },
  ]);

  const [filteredData, setFilteredData] = useState(data);

  // Define columns
  const columns = useMemo(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'age', header: 'Age' },
      { accessorKey: 'department', header: 'Department' },
      {
        accessorKey: 'salary',
        header: 'Salary',
        cell: ({ getValue }) => `$${getValue().toLocaleString()}`,
      },
      { accessorKey: 'status', header: 'Status' },
    ],
    []
  );

  // Define custom filter configuration WITHOUT sections (no accordion)
  // Just pass filters directly as an array
  const customFilterConfig = useMemo(
    () => [
      // Standalone filter 1 - Text
      {
        id: 'name',
        type: 'text',
        label: 'Name',
        placeholder: 'Search by name...',
      },
      // Standalone filter 2 - Dropdown
      {
        id: 'department',
        type: 'dropdown',
        label: 'Department (without counts)',
        options: [
          { value: 'Engineering', label: 'Engineering' },
          { value: 'Marketing', label: 'Marketing' },
          { value: 'Sales', label: 'Sales' },
        ],
        placeholder: 'Select department',
      },
      // Standalone filter 3 - Checkbox
      {
        id: 'status',
        type: 'checkbox',
        label: 'Status (with counts)',
        options: [
          { value: 'Active', label: 'Active', count: 2 },
          { value: 'Inactive', label: 'Inactive', count: 1 },
        ],
        defaultValue: [],
      },
      // Standalone filter 4 - Number with validation
      {
        id: 'minSalary',
        type: 'number',
        label: 'Minimum Salary',
        placeholder: 'Enter minimum salary',
        min: 0,
        step: 1000,
        validation: {
          min: 0,
          message: 'Salary must be positive',
        },
      },
    ],
    []
  );

  // Handle custom filter apply
  const handleCustomFiltersApply = (filterValues) => {
    let filtered = [...data];

    // Text filter - Name
    if (filterValues.name) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(filterValues.name.toLowerCase())
      );
    }

    // Dropdown filter - Department
    if (filterValues.department) {
      filtered = filtered.filter(
        (item) => item.department === filterValues.department
      );
    }

    // Checkbox filter - Status
    if (filterValues.status && filterValues.status.length > 0) {
      filtered = filtered.filter((item) =>
        filterValues.status.includes(item.status)
      );
    }

    // Number filter - Min Salary
    if (filterValues.minSalary) {
      filtered = filtered.filter(
        (item) => item.salary >= filterValues.minSalary
      );
    }

    setFilteredData(filtered);
  };

  // Handle custom filter reset
  const handleCustomFiltersReset = () => {
    setFilteredData(data);
  };

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Custom Filters Without Accordion</h2>
          <p className="example-description">
            This example demonstrates filters as standalone items without
            grouping them into accordion sections. All filters are displayed
            directly in the filter panel for a simpler, flat structure.
          </p>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <TanstackTable
          data={filteredData}
          columns={columns}
          toolbar={[{ type: 'filter' }, { type: 'search' }]}
          features={{
            pagination: {
              pageSize: 10,
            },
            sideFilterPanel: {
              config: customFilterConfig,
              onApply: handleCustomFiltersApply,
              onReset: handleCustomFiltersReset,
            },
          }}
        />
      </div>
    </>
  );
};

export default ExampleWithCustomFiltersNoAccordion;
