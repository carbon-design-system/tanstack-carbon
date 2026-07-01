import { useState } from 'react';
import { TanstackTable } from '@/lib';
import {
  Add as AddIcon,
  Folder,
  TableSplit as TableIcon,
} from '@carbon/icons-react';
import { Breadcrumb, BreadcrumbItem, Button, Toggle } from '@carbon/react';
import commonStyles from './scss/common.module.scss';
import styles from './scss/emptyState.module.scss';

const ExampleEmptyState = () => {
  // Toggle between default and custom empty state
  const [useCustomEmptyState, setUseCustomEmptyState] = useState(false);

  // Empty data array to demonstrate NoDataEmptyState
  const mockData = [];

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
      cell: (info) => info.getValue(),
    },
  ];

  // Custom toolbar content
  const toolbarContent = (
    <Button
      renderIcon={AddIcon}
      iconDescription="Add user"
      onClick={() => alert('Add your first user!')}>
      Add User
    </Button>
  );

  // Custom empty state JSX
  const customEmptyState = (
    <div className={styles.customEmptyState}>
      <Folder size={64} className={styles.icon} />
      <h3 className={styles.title}>Custom Empty State</h3>
      <p className={styles.description}>
        This is a custom empty state with your own HTML/JSX. You can add any
        content, styling, images, or interactive elements here.
      </p>
      <Button
        kind="primary"
        renderIcon={AddIcon}
        onClick={() => alert('Custom action!')}
        className={styles.button}>
        Get Started
      </Button>
    </div>
  );

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Empty State</h2>
          <p className="example-description">
            This example demonstrates how to handle empty tables with both
            default Carbon empty state and custom HTML/JSX. Toggle between the
            two options to see the difference.
          </p>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <div className={styles.toggleContainer}>
          <Toggle
            id="empty-state-toggle"
            labelText="Use custom empty state"
            labelA="Default"
            labelB="Custom"
            toggled={useCustomEmptyState}
            onToggle={(checked) => setUseCustomEmptyState(checked)}
          />
        </div>
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
          pagination={{
            enabled: true,
            pageSize: 10,
            pageSizeOptions: [10, 20, 50],
          }}
          emptyState={{
            title: 'No users found',
            subtitle: 'Get started by adding your first user to the system',
            render: useCustomEmptyState ? customEmptyState : null,
          }}
          height="calc(100vh - 400px)"
        />
      </div>
    </>
  );
};

export default ExampleEmptyState;
