import { TanstackTable, TableOverflowMenu } from '@/lib';
import { Add as AddIcon } from '@carbon/icons-react';
import { Button, OverflowMenuItem } from '@carbon/react';
import commonStyles from './scss/common.module.scss';
import styles from './scss/rowExpansion.module.scss';

const ExampleWithExpansion = () => {
  // Mock data
  const mockData = [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      department: 'Engineering',
      status: 'Active',
      details: {
        phone: '+1 234-567-8900',
        location: 'New York, USA',
        joinDate: '2024-01-15',
        manager: 'Jane Smith',
      },
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      department: 'Marketing',
      status: 'Active',
      details: {
        phone: '+1 234-567-8901',
        location: 'San Francisco, USA',
        joinDate: '2024-01-16',
        manager: 'Bob Johnson',
      },
    },
    {
      id: 'user-3',
      name: 'Bob Johnson',
      email: 'bob.j@example.com',
      department: 'Sales',
      status: 'Active',
      details: {
        phone: '+1 234-567-8902',
        location: 'Chicago, USA',
        joinDate: '2024-01-17',
        manager: 'Alice Williams',
      },
    },
    {
      id: 'user-4',
      name: 'Alice Williams',
      email: 'alice.w@example.com',
      department: 'HR',
      status: 'Inactive',
      details: {
        phone: '+1 234-567-8903',
        location: 'Boston, USA',
        joinDate: '2024-01-18',
        manager: 'Charlie Brown',
      },
    },
    {
      id: 'user-5',
      name: 'Charlie Brown',
      email: 'charlie.b@example.com',
      department: 'Finance',
      status: 'Active',
      details: {
        phone: '+1 234-567-8904',
        location: 'Austin, USA',
        joinDate: '2024-01-19',
        manager: 'David Lee',
      },
    },
  ];

  // Define columns
  const columns = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      id: 'department',
      accessorKey: 'department',
      header: 'Department',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      id: 'status',
      accessorKey: 'status',
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
      id: 'actions',
      header: '',
      size: 50,
      cell: (info) => {
        const rowData = info.row.original;
        return (
          <TableOverflowMenu size="md" flipped>
            <OverflowMenuItem
              itemText="Edit"
              onClick={() => alert(`Edit ${rowData.name}`)}
            />
            <OverflowMenuItem
              itemText="Delete"
              isDelete
              onClick={() => alert(`Delete ${rowData.name}`)}
            />
          </TableOverflowMenu>
        );
      },
    },
  ];

  // Render expanded row content
  const renderExpandedRow = (rowData) => (
    <div className={styles.expandedRow}>
      <h6 className={styles.expandedTitle}>Additional Details</h6>
      <div className={styles.expandedGrid}>
        <div>
          <strong>Phone:</strong> {rowData.details.phone}
        </div>
        <div>
          <strong>Location:</strong> {rowData.details.location}
        </div>
        <div>
          <strong>Join Date:</strong> {rowData.details.joinDate}
        </div>
        <div>
          <strong>Manager:</strong> {rowData.details.manager}
        </div>
      </div>
    </div>
  );

  // Custom toolbar content
  const toolbarContent = (
    <Button
      renderIcon={AddIcon}
      iconDescription="Add user"
      onClick={() => alert('Add user clicked')}>
      Add User
    </Button>
  );

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Row Expansion</h2>
          <p className="example-description">
            This example demonstrates row expansion functionality where users
            can click to expand rows and view additional details.
          </p>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <TanstackTable
          data={mockData}
          columns={columns}
          isLoading={false}
          toolbar={[
            { type: 'search' },
            { type: 'custom', element: toolbarContent },
          ]}
          tableSize="md"
          useZebraStyles={false}
          features={{
            pagination: {
              pageSize: 10,
              pageSizeOptions: [5, 10, 20],
            },
            expansion: {
              renderExpandedRow,
              onExpandedChange: (expanded) => {
                // eslint-disable-next-line no-console
                console.log('Expanded rows:', expanded);
              },
            },
          }}
          emptyState={{
            title: 'No users found',
            subtitle: 'Try adjusting your search or filters',
          }}
          height="calc(100vh - 300px)"
          /* columnPinning={{
             left: ["select", "CLASS"], // Pin selection and CLASS columns to left
             right: ["KEY"], // Pin KEY column to right
           }}
          */
        />
      </div>
    </>
  );
};

export default ExampleWithExpansion;
