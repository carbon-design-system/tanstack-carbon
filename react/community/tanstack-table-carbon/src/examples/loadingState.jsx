import { TanstackTable } from '@/lib';
import { Add as AddIcon, TableSplit as TableIcon } from '@carbon/icons-react';
import { Breadcrumb, BreadcrumbItem, Button } from '@carbon/react';
import commonStyles from './scss/common.module.scss';

const ExampleLoadingState = () => {
  // Mock data (won't be shown during loading)
  const mockData = [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      department: 'Engineering',
      status: 'Active',
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      department: 'Marketing',
      status: 'Active',
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
  ];

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
          <h2 className="example-title">Loading State</h2>
          <p className="example-description">
            This example demonstrates the DataTableSkeleton component that
            appears while data is being fetched. The <code>isLoading</code> prop
            is set to <code>true</code> to show the loading skeleton animation.
          </p>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <TanstackTable
          data={mockData}
          columns={columns}
          isLoading={true} // Set to true to show loading skeleton
          toolbar={[
            { type: 'search' },
            { type: 'custom', element: toolbarContent },
          ]}
          pagination={{
            enabled: true,
            pageSize: 10,
            pageSizeOptions: [10, 20, 50],
          }}
          emptyState={{
            title: 'No users found',
            subtitle: 'Try adjusting your search or filters',
          }}
          height="calc(100vh - 350px)"
        />
      </div>
    </>
  );
};

export default ExampleLoadingState;
