import { useMemo, useState } from 'react';
import { TanstackTable } from '@/lib';
import {
  TableSplit as TableIcon,
  TrashCan,
  Download,
  Edit,
} from '@carbon/icons-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  RadioButtonGroup,
  RadioButton,
} from '@carbon/react';
import commonStyles from './scss/common.module.scss';
import styles from './scss/virtualization.module.scss';

const ExampleVirtualization = () => {
  // All hooks must be declared first
  const [tableSize, setTableSize] = useState('md');

  const mockData = useMemo(
    () =>
      Array.from({ length: 2000 }, (_, index) => ({
        id: `user-${index + 1}`,
        class: index % 5 === 0 ? 'ADMIN' : 'USER',
        userId: `CRM${String(index + 1).padStart(5, '0')}`,
        name: `User ${index + 1}`,
        email: `user${index + 1}@example.com`,
        department: ['Engineering', 'Marketing', 'Finance', 'Sales', 'HR'][
          index % 5
        ],
        status: index % 3 === 0 ? 'Inactive' : 'Active',
        created: `2024-02-${String((index % 28) + 1).padStart(2, '0')}`,
      })),
    []
  );

  const columns = useMemo(
    () => [
      {
        id: 'class',
        accessorKey: 'class',
        header: 'Class',
        enableSorting: true,
        size: 120,
      },
      {
        id: 'userId',
        accessorKey: 'userId',
        header: 'User ID',
        enableSorting: true,
        size: 140,
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        enableSorting: true,
        size: 180,
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
        enableSorting: true,
        size: 260,
      },
      {
        id: 'department',
        accessorKey: 'department',
        header: 'Department',
        enableSorting: true,
        size: 180,
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
        id: 'created',
        accessorKey: 'created',
        header: 'Created',
        enableSorting: true,
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
        alert(`Delete ${selectedRows.length} user(s)?`);
      },
    },
    {
      label: 'Export',
      icon: Download,
      onClick: (selectedRows) => {
        // eslint-disable-next-line no-console
        console.log('Export selected:', selectedRows);
        alert(`Exporting ${selectedRows.length} user(s)...`);
      },
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (selectedRows) => {
        // eslint-disable-next-line no-console
        console.log('Edit selected:', selectedRows);
        alert(`Edit ${selectedRows.length} user(s)?`);
      },
    },
  ];

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Virtualized Table</h2>
          <p className="example-description">
            This example renders 2,000 rows using TanStack Virtual. Only visible
            rows are mounted, which keeps scrolling smooth for large datasets.
            Virtualization works best with a fixed table height and pagination
            disabled.
          </p>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <div className={styles.sizeSelector}>
          <RadioButtonGroup
            legendText="Table Size"
            name="table-size-group"
            valueSelected={tableSize}
            onChange={(value) => setTableSize(value)}
            orientation="horizontal">
            <RadioButton
              labelText="Extra Small (xs)"
              value="xs"
              id="radio-xs"
            />
            <RadioButton labelText="Small (sm)" value="sm" id="radio-sm" />
            <RadioButton labelText="Medium (md)" value="md" id="radio-md" />
            <RadioButton labelText="Large (lg)" value="lg" id="radio-lg" />
            <RadioButton
              labelText="Extra Large (xl)"
              value="xl"
              id="radio-xl"
            />
          </RadioButtonGroup>
        </div>
        <TanstackTable
          data={mockData}
          columns={columns}
          tableSize={tableSize}
          toolbar={[{ type: 'search' }]}
          useZebraStyles={false}
          height="600px"
          features={{
            selection: {
              type: 'checkbox',
              batchActions,
            },
            virtualization: {
              estimateSize: 48,
              overscan: 5,
            },
            columnPinning: {
              left: ['select', 'class'],
            },
          }}
          emptyState={{
            title: 'No users found',
            subtitle: 'Try adjusting your search',
          }}
        />
      </div>
    </>
  );
};

export default ExampleVirtualization;
