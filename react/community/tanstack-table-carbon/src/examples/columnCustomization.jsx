import { useMemo } from 'react';
import { TanstackTable } from '@/lib';
import { Add as AddIcon, TableSplit as TableIcon } from '@carbon/icons-react';
import { Breadcrumb, BreadcrumbItem, Button } from '@carbon/react';
import commonStyles from './scss/common.module.scss';

const ExampleWithColumnCustomization = () => {
  // Mock data
  const mockData = useMemo(
    () => [
      {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        department: 'Engineering',
        status: 'Active',
        role: 'Developer',
        location: 'New York',
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        department: 'Marketing',
        status: 'Active',
        role: 'Manager',
        location: 'San Francisco',
      },
      {
        id: 'user-3',
        name: 'Bob Johnson',
        email: 'bob.j@example.com',
        department: 'Sales',
        status: 'Active',
        role: 'Sales Rep',
        location: 'Chicago',
      },
      {
        id: 'user-4',
        name: 'Alice Williams',
        email: 'alice.w@example.com',
        department: 'HR',
        status: 'Inactive',
        role: 'HR Specialist',
        location: 'Boston',
      },
      {
        id: 'user-5',
        name: 'Charlie Brown',
        email: 'charlie.b@example.com',
        department: 'Finance',
        status: 'Active',
        role: 'Accountant',
        location: 'Austin',
      },
    ],
    []
  );

  // Define columns - memoized to prevent recreation
  const columns = useMemo(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        enableSorting: true,
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
        enableSorting: true,
      },
      {
        id: 'department',
        accessorKey: 'department',
        header: 'Department',
        enableSorting: true,
      },
      {
        id: 'role',
        accessorKey: 'role',
        header: 'Role',
        enableSorting: true,
      },
      {
        id: 'location',
        accessorKey: 'location',
        header: 'Location',
        enableSorting: true,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        enableSorting: true,
      },
    ],
    []
  );

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Client-Side Column Customization</h2>
          <p className="example-description">
            Click the column icon in the toolbar to customize which columns are
            visible and their order. Column preferences are automatically saved
            to localStorage with the <code>localStorageKey</code> prop for
            persistence across sessions.
          </p>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <TanstackTable
          data={mockData}
          columns={columns}
          tableSize="md"
          useZebraStyles={false}
          features={{
            selection: {
              type: 'checkbox',
              batchActions: [
                {
                  label: 'Delete',
                  icon: () => null,
                  onClick: (selectedRows) => {
                    alert(`Delete ${selectedRows.length} users`);
                  },
                },
              ],
            },
            columnSettings: {
              localStorageKey: 'exampleWithColumnCustomization',
            },
          }}
          toolbar={[
            { type: 'search' },
            { type: 'settings', menuItems: [{ type: 'columnSettings' }] },
            {
              type: 'custom',
              element: (
                <Button renderIcon={AddIcon} onClick={() => alert('Add user')}>
                  Add User
                </Button>
              ),
            },
          ]}
        />
      </div>
    </>
  );
};

export default ExampleWithColumnCustomization;
