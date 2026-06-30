import { useMemo, useState } from 'react';
import { TanstackTable } from '@/lib';
import { TrashCan, Download } from '@carbon/icons-react';
import { Button, Dropdown, Theme } from '@carbon/react';
import commonStyles from './scss/common.module.scss';

const ThemedTable = () => {
  const [selectedTheme, setSelectedTheme] = useState('white');

  const themeOptions = [
    { id: 'white', label: 'White' },
    { id: 'g10', label: 'Gray 10' },
    { id: 'g90', label: 'Gray 90' },
    { id: 'g100', label: 'Gray 100' },
  ];

  const handleThemeChange = ({ selectedItem }) => {
    if (selectedItem) {
      setSelectedTheme(selectedItem.id);
    }
  };

  // Mock data for demonstration
  const mockData = useMemo(
    () => [
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
    ],
    []
  );

  const isLoading = false;

  // Define columns
  const columns = useMemo(
    () => [
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
    ],
    []
  );

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
    <Theme theme={selectedTheme}>
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
              <h2 className="example-title">Themed Table</h2>
            </div>
            <div style={{ minWidth: '200px' }}>
              <Dropdown
                id="theme-selector"
                titleText="Theme"
                label="Select theme"
                items={themeOptions}
                itemToString={(item) => (item ? item.label : '')}
                selectedItem={themeOptions.find(
                  (opt) => opt.id === selectedTheme
                )}
                onChange={handleThemeChange}
              />
            </div>
          </div>
          <p className="example-description">
            This example demonstrates how to switch between different Carbon
            Design System themes (White, Gray 10, Gray 90, Gray 100). Use the
            theme selector above to change the theme for the entire application.
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
          tableSize="md"
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
              left: ['select', 'CLASS'],
            },
          }}
          emptyState={{
            title: 'No users found',
            subtitle: 'Try adjusting your search or filters',
          }}
        />
      </div>
    </Theme>
  );
};

export default ThemedTable;
