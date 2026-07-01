import { useState } from 'react';
import { TanstackTable } from '@/lib';
import { Add as AddIcon, TableSplit as TableIcon } from '@carbon/icons-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Tag,
  UnorderedList,
  ListItem,
} from '@carbon/react';
import commonStyles from './scss/common.module.scss';

const formatDateForStorage = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (value) => {
  if (!value) {
    return '';
  }

  const [year, month, day] = String(value).split('-');
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Mock data generator
const generateMockData = (count = 20) => {
  const departments = ['IT', 'HR', 'Sales', 'Marketing', 'Finance'];
  const roles = ['Admin', 'Manager', 'Developer', 'Analyst', 'Designer'];
  const statuses = ['Active', 'Inactive', 'Pending'];

  return Array.from({ length: count }, (_, i) => ({
    id: `emp-${i + 1}`,
    employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
    name: `Employee ${i + 1}`,
    email: `employee${i + 1}@company.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(
      Math.floor(Math.random() * 9000) + 1000
    )}`,
    joinDate: formatDateForStorage(
      new Date(
        2020 + Math.floor(Math.random() * 5),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      )
    ),
    salary: 50000 + Math.floor(Math.random() * 100000),
  }));
};

const EditableCells = () => {
  const [tableData, setTableData] = useState(generateMockData(20));

  // Column definitions with editable cells
  const columns = [
    {
      accessorKey: 'employeeId',
      header: 'Employee ID',
      enableSorting: true,
      size: 140,
    },
    {
      accessorKey: 'name',
      header: 'Full Name',
      enableSorting: true,
      meta: {
        editable: true,
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Name is required';
          }
          if (value.length < 3) {
            return 'Name must be at least 3 characters';
          }
          return true;
        },
      },
      size: 180,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
      meta: {
        editable: true,
        validate: (value) => {
          if (!value) {
            return 'Email is required';
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return 'Invalid email format';
          }
          return true;
        },
      },
      size: 220,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      enableSorting: true,
      cell: ({ getValue }) => {
        const value = getValue();
        const colors = {
          IT: 'blue',
          HR: 'green',
          Sales: 'purple',
          Marketing: 'magenta',
          Finance: 'teal',
        };
        return <Tag type={colors[value] || 'gray'}>{value}</Tag>;
      },
      size: 140,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      enableSorting: true,
      meta: {
        editable: true,
        editableType: 'select',
        options: ['Admin', 'Manager', 'Developer', 'Analyst', 'Designer'],
      },
      size: 140,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ getValue }) => {
        const value = getValue();
        const colors = {
          Active: 'green',
          Inactive: 'gray',
          Pending: 'blue',
        };
        return <Tag type={colors[value] || 'gray'}>{value}</Tag>;
      },
      size: 120,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      enableSorting: false,
      meta: {
        editable: true,
        validate: (value) => {
          if (!value) {
            return true; // Allow empty
          }
          if (value.length > 18) {
            return 'Phone number cannot exceed 18 characters';
          }
          return true;
        },
      },
      size: 200,
    },
    {
      accessorKey: 'joinDate',
      header: 'Join Date',
      enableSorting: true,
      meta: {
        editable: true,
        editableType: 'date',
      },
      cell: ({ getValue }) => formatDateForDisplay(getValue()),
      size: 150,
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      enableSorting: true,
      cell: ({ getValue }) => {
        const value = getValue();
        return `$${value.toLocaleString()}`;
      },
      size: 130,
    },
  ];

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Editable Cells</h2>
          <p className="example-description">
            This example demonstrates inline cell editing with validation. Edit
            cells in Name, Email, Role, Phone, or Join Date columns.
          </p>
          <UnorderedList className={commonStyles.unorderedList}>
            <ListItem>Double-click or press Enter on a cell to edit</ListItem>
            <ListItem>Press Enter to save changes</ListItem>
            <ListItem>Press Escape to cancel editing</ListItem>
            <ListItem>Click outside the cell to save (if valid)</ListItem>
            <ListItem>Validation errors are shown inline</ListItem>
            <ListItem>
              <strong>Name field:</strong> Required, minimum 3 characters
            </ListItem>
            <ListItem>
              <strong>Email field:</strong> Required, must be valid email format
            </ListItem>
            <ListItem>
              <strong>Phone field:</strong> Maximum 18 characters
            </ListItem>
            <ListItem>
              <strong>Role field:</strong> Dropdown selection
            </ListItem>
            <ListItem>
              <strong>Join Date field:</strong> Date picker
            </ListItem>
          </UnorderedList>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <TanstackTable
          data={tableData}
          columns={columns}
          features={{
            selection: {
              type: 'checkbox',
            },
            sorting: {
              sorting: [{ id: 'employeeId', desc: false }],
            },
            pagination: {
              pageSize: 10,
              pageSizeOptions: [5, 10, 20],
            },
            editing: {
              enabled: true,
              onDataChange: setTableData,
            },
          }}
          tableSize="md"
          emptyState={{
            title: 'No employees found',
            subtitle: 'Add a new employee to get started',
          }}
          toolbar={[
            { type: 'filter' },
            { type: 'search' },
            {
              type: 'custom',
              element: (
                <Button
                  kind="primary"
                  renderIcon={AddIcon}
                  onClick={() => {
                    const newEmployee = {
                      id: `emp-${tableData.length + 1}`,
                      employeeId: `EMP${String(tableData.length + 1).padStart(
                        4,
                        '0'
                      )}`,
                      name: `New Employee ${tableData.length + 1}`,
                      email: `employee${tableData.length + 1}@company.com`,
                      department: 'IT',
                      role: 'Developer',
                      status: 'Active',
                      phone: '+1 (555) 000-0000',
                      joinDate: formatDateForStorage(new Date()),
                      salary: 60000,
                    };
                    setTableData([...tableData, newEmployee]);
                  }}>
                  Add Employee
                </Button>
              ),
            },
          ]}
        />
      </div>
    </>
  );
};

export default EditableCells;
