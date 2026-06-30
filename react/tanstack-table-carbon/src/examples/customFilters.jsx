import React, { useState, useMemo } from 'react';
import { TanstackTable } from '@/lib';
import { TableSplit as TableIcon } from '@carbon/icons-react';
import { Breadcrumb, BreadcrumbItem } from '@carbon/react';
import commonStyles from './scss/common.module.scss';

/**
 * Example: TanStack Table with Custom Filters
 *
 * This example demonstrates the custom filters system with various filter types:
 * 1. Text - Text input filter
 * 2. Checkbox - Multi-select checkbox group
 * 3. Dropdown - Single select dropdown
 * 4. Radio - Radio button group
 * 5. Number - Number input with validation and conditional disable
 * 6. Slider - Range slider
 * 7. Date - Single date picker
 * 8. DateRange - Date range picker
 * 9. Toggle - Toggle switch
 * 10. MultiSelect - Multi-select dropdown with validation
 * 11. Time - Time picker
 *
 * Features demonstrated:
 * - Conditional enable/disable (maxSalary disabled until minSalary is set)
 * - Validation (min/max, custom validation functions)
 * - All 11 filter types
 */

const ExampleWithCustomFilters = () => {
  const [data] = useState([
    {
      id: 1,
      name: 'John Doe',
      age: 28,
      department: 'Engineering',
      salary: 75000,
      status: 'Active',
      joinDate: '2020-01-15',
      verified: true,
      skills: ['React', 'Node.js'],
      shiftTime: '09:00 AM',
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 34,
      department: 'Marketing',
      salary: 65000,
      status: 'Active',
      joinDate: '2019-03-22',
      verified: true,
      skills: ['Marketing', 'SEO'],
      shiftTime: '10:00 AM',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      age: 45,
      department: 'Sales',
      salary: 80000,
      status: 'Inactive',
      joinDate: '2018-07-10',
      verified: false,
      skills: ['Sales', 'CRM'],
      shiftTime: '08:00 AM',
    },
    {
      id: 4,
      name: 'Alice Williams',
      age: 29,
      department: 'Engineering',
      salary: 72000,
      status: 'Active',
      joinDate: '2021-05-18',
      verified: true,
      skills: ['Python', 'React', 'AWS'],
      shiftTime: '09:30 AM',
    },
    {
      id: 5,
      name: 'Charlie Brown',
      age: 52,
      department: 'Management',
      salary: 95000,
      status: 'Active',
      joinDate: '2015-11-30',
      verified: true,
      skills: ['Leadership', 'Strategy'],
      shiftTime: '08:30 AM',
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
      { accessorKey: 'joinDate', header: 'Join Date' },
      {
        accessorKey: 'verified',
        header: 'Verified',
        cell: ({ getValue }) => (getValue() ? '✓' : '✗'),
      },
      {
        accessorKey: 'skills',
        header: 'Skills',
        cell: ({ getValue }) => getValue().join(', '),
      },
      { accessorKey: 'shiftTime', header: 'Shift Time' },
    ],
    []
  );

  // Define custom filter configuration
  const customFilterConfig = useMemo(
    () => [
      // Section 1: Text & Selection Filters
      {
        id: 'text-selection-section',
        type: 'section',
        label: 'Text & Selection Filters',
        defaultOpen: true,
        filters: [
          {
            id: 'name',
            type: 'text',
            label: 'Filter - Name',
            placeholder: 'Search by name...',
          },
          {
            id: 'status',
            type: 'checkbox',
            label: 'Status (with counts)',
            options: [
              { value: 'Active', label: 'Active', count: 4 },
              { value: 'Inactive', label: 'Inactive', count: 1 },
            ],
            defaultValue: [],
          },
          {
            id: 'department',
            type: 'dropdown',
            label: 'Department (mixed - with and without counts)',
            options: [
              { value: 'Engineering', label: 'Engineering', count: 2 },
              { value: 'Marketing', label: 'Marketing' }, // No count
              { value: 'Sales', label: 'Sales', count: 1 },
              { value: 'Management', label: 'Management', count: 1 },
            ],
            placeholder: 'Select department',
          },
          {
            id: 'employeeType',
            type: 'radio',
            label: 'Employee Type (without counts)',
            options: [
              { value: 'all', label: 'All Employees' },
              { value: 'senior', label: 'Senior (Age > 40)' },
              { value: 'junior', label: 'Junior (Age ≤ 40)' },
            ],
            defaultValue: 'all',
          },
        ],
      },

      // Section 2: Number & Range Filters
      {
        id: 'number-range-section',
        type: 'section',
        label: 'Number & Range Filters',
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
            disabled: (allFilters) => !allFilters.minSalary,
            validation: {
              min: 0,
              message: 'Max salary must be greater than 0',
            },
          },
          {
            id: 'ageSlider',
            type: 'slider',
            label: 'Minimum Age',
            min: 20,
            max: 60,
            step: 1,
            defaultValue: 20,
            hideTextInput: false,
          },
          {
            id: 'skills',
            type: 'multiselect',
            label: 'Skills (with counts)',
            options: [
              { value: 'React', label: 'React', count: 2 },
              { value: 'Node.js', label: 'Node.js', count: 1 },
              { value: 'Python', label: 'Python', count: 2 },
              { value: 'AWS', label: 'AWS', count: 1 },
              { value: 'Marketing', label: 'Marketing', count: 1 },
              { value: 'SEO', label: 'SEO', count: 1 },
              { value: 'Sales', label: 'Sales', count: 1 },
              { value: 'CRM', label: 'CRM', count: 1 },
              { value: 'Leadership', label: 'Leadership', count: 1 },
              { value: 'Strategy', label: 'Strategy', count: 1 },
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

      // Section 3: Date & Time Filters
      {
        id: 'date-section',
        type: 'section',
        label: 'Date & Time Filters',
        defaultOpen: true,
        filters: [
          {
            id: 'specificDate',
            type: 'date',
            label: 'Specific Join Date',
          },
          {
            id: 'dateRange',
            type: 'dateRange',
            label: 'Join Date Range',
          },
          {
            id: 'shiftTime',
            type: 'time',
            label: 'Shift Start Time',
          },
        ],
      },

      // Section 4: Toggle Filters
    ],
    []
  );

  // Handle custom filter apply
  const handleCustomFiltersApply = (filterValues) => {
    let filtered = [...data];

    // 1. Text filter - Name
    if (filterValues.name) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(filterValues.name.toLowerCase())
      );
    }

    // 2. Checkbox filter - Status
    if (filterValues.status && filterValues.status.length > 0) {
      filtered = filtered.filter((item) =>
        filterValues.status.includes(item.status)
      );
    }

    // 3. Dropdown filter - Department
    if (filterValues.department) {
      filtered = filtered.filter(
        (item) => item.department === filterValues.department
      );
    }

    // 4. Radio filter - Employee Type
    if (filterValues.employeeType === 'senior') {
      filtered = filtered.filter((item) => item.age > 40);
    } else if (filterValues.employeeType === 'junior') {
      filtered = filtered.filter((item) => item.age <= 40);
    }

    // 5 & 6. Number filters - Salary range
    if (filterValues.minSalary) {
      filtered = filtered.filter(
        (item) => item.salary >= filterValues.minSalary
      );
    }
    if (filterValues.maxSalary) {
      filtered = filtered.filter(
        (item) => item.salary <= filterValues.maxSalary
      );
    }

    // 7. Slider filter - Age
    if (filterValues.ageSlider) {
      filtered = filtered.filter((item) => item.age >= filterValues.ageSlider);
    }

    // 8. Date filter - Specific date
    if (filterValues.specificDate) {
      filtered = filtered.filter(
        (item) => item.joinDate === filterValues.specificDate
      );
    }

    // 9. DateRange filter
    if (filterValues.dateRange?.start) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.joinDate) >= new Date(filterValues.dateRange.start)
      );
    }
    if (filterValues.dateRange?.end) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.joinDate) <= new Date(filterValues.dateRange.end)
      );
    }

    // 10. MultiSelect filter - Skills
    if (filterValues.skills && filterValues.skills.length > 0) {
      filtered = filtered.filter((item) =>
        filterValues.skills.some((skill) => item.skills.includes(skill))
      );
    }

    // 11. Time filter - Shift Time
    if (filterValues.shiftTime) {
      filtered = filtered.filter(
        (item) => item.shiftTime === filterValues.shiftTime
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
          <h2 className="example-title">Custom Filters</h2>
          <p className="example-description">
            This example demonstrates the custom filter panel with all 11 filter
            types including text, checkbox, dropdown, radio, number, slider,
            date, date range, toggle, multiselect, and time filters. Features
            include conditional enable/disable and validation.
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

export default ExampleWithCustomFilters;
