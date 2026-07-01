import { TanstackTable } from '@/lib';
import {
  TrashCan,
  Download,
  TableSplit as TableIcon,
} from '@carbon/icons-react';
import { Breadcrumb, BreadcrumbItem, Button } from '@carbon/react';
import commonStyles from './scss/common.module.scss';

const ExampleTanstack = () => {
  // Mock data for demonstration with more realistic columns
  const mockData = [
    {
      id: 'user-1',
      CLASS: 'USER',
      SEGMENT: 'BASE',
      KEY: 'USR001',
      NAME: 'John Doe',
      EMAIL: 'john.doe@example.com',
      DEPARTMENT: 'Engineering',
      STATUS: 'Active',
      CREATED: '2024-01-15',
    },
    {
      id: 'user-2',
      CLASS: 'USER',
      SEGMENT: 'BASE',
      KEY: 'USR002',
      NAME: 'Jane Smith',
      EMAIL: 'jane.smith@example.com',
      DEPARTMENT: 'Marketing',
      STATUS: 'Active',
      CREATED: '2024-01-16',
    },
    {
      id: 'user-3',
      CLASS: 'USER',
      SEGMENT: 'BASE',
      KEY: 'USR003',
      NAME: 'Bob Johnson',
      EMAIL: 'bob.j@example.com',
      DEPARTMENT: 'Sales',
      STATUS: 'Active',
      CREATED: '2024-01-17',
    },
    {
      id: 'user-4',
      CLASS: 'USER',
      SEGMENT: 'BASE',
      KEY: 'USR004',
      NAME: 'Alice Williams',
      EMAIL: 'alice.w@example.com',
      DEPARTMENT: 'HR',
      STATUS: 'Inactive',
      CREATED: '2024-01-18',
    },
    {
      id: 'user-5',
      CLASS: 'USER',
      SEGMENT: 'BASE',
      KEY: 'USR005',
      NAME: 'Charlie Brown',
      EMAIL: 'charlie.b@example.com',
      DEPARTMENT: 'Finance',
      STATUS: 'Active',
      CREATED: '2024-01-19',
    },
    {
      id: 'user-6',
      CLASS: 'USER',
      SEGMENT: 'ADMIN',
      KEY: 'ADM001',
      NAME: 'Admin User',
      EMAIL: 'admin@example.com',
      DEPARTMENT: 'IT',
      STATUS: 'Active',
      CREATED: '2024-01-10',
    },
    {
      id: 'user-7',
      CLASS: 'USER',
      SEGMENT: 'ADMIN',
      KEY: 'ADM002',
      NAME: 'Super Admin',
      EMAIL: 'superadmin@example.com',
      DEPARTMENT: 'IT',
      STATUS: 'Active',
      CREATED: '2024-01-11',
    },
    {
      id: 'user-8',
      CLASS: 'USER',
      SEGMENT: 'ADMIN',
      KEY: 'ADM003',
      NAME: 'System Admin',
      EMAIL: 'sysadmin@example.com',
      DEPARTMENT: 'IT',
      STATUS: 'Active',
      CREATED: '2024-01-12',
    },
    {
      id: 'user-9',
      CLASS: 'GROUP',
      SEGMENT: 'BASE',
      KEY: 'GRP001',
      NAME: 'Developers',
      EMAIL: 'dev-group@example.com',
      DEPARTMENT: 'Engineering',
      STATUS: 'Active',
      CREATED: '2024-01-05',
    },
    {
      id: 'user-10',
      CLASS: 'GROUP',
      SEGMENT: 'BASE',
      KEY: 'GRP002',
      NAME: 'Managers',
      EMAIL: 'mgr-group@example.com',
      DEPARTMENT: 'Management',
      STATUS: 'Active',
      CREATED: '2024-01-06',
    },
    {
      id: 'user-11',
      CLASS: 'USER',
      SEGMENT: 'BASE',
      KEY: 'USR006',
      NAME: 'David Lee',
      EMAIL: 'david.lee@example.com',
      DEPARTMENT: 'Engineering',
      STATUS: 'Active',
      CREATED: '2024-01-20',
    },
    {
      id: 'user-12',
      CLASS: 'USER',
      SEGMENT: 'BASE',
      KEY: 'USR007',
      NAME: 'Emma Davis',
      EMAIL: 'emma.d@example.com',
      DEPARTMENT: 'Marketing',
      STATUS: 'Active',
      CREATED: '2024-01-21',
    },
    {
      id: 'user-13',
      CLASS: 'USER',
      SEGMENT: 'ADMIN',
      KEY: 'ADM004',
      NAME: 'Security Admin',
      EMAIL: 'security@example.com',
      DEPARTMENT: 'Security',
      STATUS: 'Active',
      CREATED: '2024-01-13',
    },
    {
      id: 'user-14',
      CLASS: 'USER',
      SEGMENT: 'ADMIN',
      KEY: 'ADM005',
      NAME: 'Network Admin',
      EMAIL: 'network@example.com',
      DEPARTMENT: 'IT',
      STATUS: 'Active',
      CREATED: '2024-01-14',
    },
    {
      id: 'user-15',
      CLASS: 'GROUP',
      SEGMENT: 'BASE',
      KEY: 'GRP003',
      NAME: 'Analysts',
      EMAIL: 'analysts@example.com',
      DEPARTMENT: 'Analytics',
      STATUS: 'Active',
      CREATED: '2024-01-07',
    },
    {
      id: 'user-16',
      CLASS: 'USER',
      SEGMENT: 'BASE',
      KEY: 'USR008',
      NAME: 'Frank Miller',
      EMAIL: 'frank.m@example.com',
      DEPARTMENT: 'Sales',
      STATUS: 'Inactive',
      CREATED: '2024-01-22',
    },
    {
      id: 'user-17',
      CLASS: 'USER',
      SEGMENT: 'BASE',
      KEY: 'USR009',
      NAME: 'Grace Taylor',
      EMAIL: 'grace.t@example.com',
      DEPARTMENT: 'HR',
      STATUS: 'Active',
      CREATED: '2024-01-23',
    },
    {
      id: 'user-18',
      CLASS: 'USER',
      SEGMENT: 'ADMIN',
      KEY: 'ADM006',
      NAME: 'Database Admin',
      EMAIL: 'dba@example.com',
      DEPARTMENT: 'IT',
      STATUS: 'Active',
      CREATED: '2024-01-15',
    },
    {
      id: 'user-19',
      CLASS: 'GROUP',
      SEGMENT: 'BASE',
      KEY: 'GRP004',
      NAME: 'Executives',
      EMAIL: 'exec@example.com',
      DEPARTMENT: 'Management',
      STATUS: 'Active',
      CREATED: '2024-01-08',
    },
    {
      id: 'user-20',
      CLASS: 'USER',
      SEGMENT: 'BASE',
      KEY: 'USR010',
      NAME: 'Henry Wilson',
      EMAIL: 'henry.w@example.com',
      DEPARTMENT: 'Finance',
      STATUS: 'Active',
      CREATED: '2024-01-24',
    },
  ];

  // Set loading state to false for demo
  const isLoading = false;
  // Define columns
  const columns = [
    {
      id: 'CLASS',
      accessorKey: 'CLASS',
      header: 'Class',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      id: 'KEY',
      accessorKey: 'KEY',
      header: 'User ID',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      id: 'NAME',
      accessorKey: 'NAME',
      header: 'Name',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      id: 'EMAIL',
      accessorKey: 'EMAIL',
      header: 'Email',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      id: 'DEPARTMENT',
      accessorKey: 'DEPARTMENT',
      header: 'Department',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      id: 'SEGMENT',
      accessorKey: 'SEGMENT',
      header: 'Segment',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      id: 'STATUS',
      accessorKey: 'STATUS',
      header: 'Status',
      enableSorting: true,
      cell: (info) => {
        const status = info.getValue();
        const statusClass =
          status === 'Active' ? commonStyles.active : commonStyles.inactive;
        return (
          <span className={`${commonStyles.statusBadge} ${statusClass}`}>
            {status}
          </span>
        );
      },
    },
    {
      id: 'CREATED',
      accessorKey: 'CREATED',
      header: 'Created',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
  ];

  // Custom toolbar content
  const toolbarContent = (
    <>
      <Button>Add User</Button>
    </>
  );

  // Batch actions for selected rows
  const batchActions = [
    {
      label: 'Delete',
      icon: TrashCan,
      onClick: (selectedRows) => {
        alert(`Delete ${selectedRows.length} user(s)?`);
      },
    },
    {
      label: 'Export',
      icon: Download,
      onClick: (selectedRows) => {
        alert(`Exporting ${selectedRows.length} user(s)...`);
      },
    },
  ];

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Basic Table</h2>
          <p className="example-description">
            This example demonstrates basic client side minimal operations like
            batchActions, searching, sorting pagination.
          </p>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <TanstackTable
          data={mockData}
          columns={columns}
          isLoading={isLoading}
          toolbar={[
            { type: 'search' },
            { type: 'custom', element: toolbarContent },
          ]}
          tableSize="md" // "xs", "sm", "md", "lg", "xl"
          useZebraStyles={false}
          onSelectionChange={() => {}}
          features={{
            selection: {
              type: 'checkbox',
              batchActions,
            },
            pagination: {
              pageSize: 20,
              pageSizeOptions: [10, 20, 50, 100],
            },
            columnPinning: {
              left: ['select', 'CLASS'], // Pin selection and CLASS columns to left
              // right: ["KEY"], // Pin KEY column to right
            },
          }}
          emptyState={{
            title: 'No users found',
            subtitle: 'Try adjusting your search or filters',
          }}
          // height="600px"
        />
      </div>
    </>
  );
};

export default ExampleTanstack;
