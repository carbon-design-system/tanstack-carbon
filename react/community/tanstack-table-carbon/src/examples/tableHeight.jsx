import { useState } from 'react';
import { TanstackTable } from '@/lib';
import { RadioButton, RadioButtonGroup, Toggle } from '@carbon/react';
import commonStyles from './scss/common.module.scss';
import styles from './scss/tableHeight.module.scss';

const HEIGHT_MODES = {
  fixed: {
    value: 400,
    code: 'height={400}',
    description:
      'Fixed height in pixels. The table body scrolls inside the given height.',
  },
  fill: {
    value: '100%',
    code: 'height="100%"',
    description:
      'Fills the height of the parent container. Resize the window or zoom the page to see the table follow the container.',
  },
  natural: {
    value: null,
    code: 'height={null}',
    description:
      'No height limit. The table grows with its rows, the page scrolls instead.',
  },
};

const departments = [
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
];

const ExampleTableHeight = () => {
  const [heightMode, setHeightMode] = useState('fill');
  const [isLoading, setIsLoading] = useState(false);

  const mockData = Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    department: departments[i % departments.length],
    status: i % 4 === 0 ? 'Inactive' : 'Active',
  }));

  const columns = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: (info) => info.getValue(),
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'Email',
      cell: (info) => info.getValue(),
    },
    {
      id: 'department',
      accessorKey: 'department',
      header: 'Department',
      cell: (info) => info.getValue(),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
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

  const selectedMode = HEIGHT_MODES[heightMode];

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Table Height</h2>
          <p className="example-description">
            The <code>height</code> prop controls how tall the table is. It
            accepts a pixel value (<code>400</code> or{' '}
            <code>&quot;400px&quot;</code>), <code>&quot;100%&quot;</code> to
            fill the parent container, or <code>null</code> for natural height.
          </p>
        </div>

        <div className={styles.controlsSection}>
          <RadioButtonGroup
            legendText="Select table height"
            name="table-height"
            valueSelected={heightMode}
            onChange={(value) => setHeightMode(value)}
            orientation="horizontal">
            <RadioButton
              labelText="Fixed (400px)"
              value="fixed"
              id="height-fixed"
            />
            <RadioButton
              labelText="Fill container (100%)"
              value="fill"
              id="height-fill"
            />
            <RadioButton
              labelText="Natural (null)"
              value="natural"
              id="height-natural"
            />
          </RadioButtonGroup>

          <Toggle
            id="height-loading-toggle"
            labelText="Loading state"
            labelA="Off"
            labelB="On"
            toggled={isLoading}
            onToggle={(checked) => setIsLoading(checked)}
          />
        </div>

        <div className={styles.heightInfoBox}>
          <p className={styles.heightInfoText}>
            <strong>Current height:</strong> <code>{selectedMode.code}</code> —{' '}
            {selectedMode.description}
          </p>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <TanstackTable
          data={mockData}
          columns={columns}
          isLoading={isLoading}
          height={selectedMode.value}
          toolbar={[{ type: 'search' }]}
          features={{
            pagination: { pageSize: 20, pageSizeOptions: [10, 20, 50] },
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

export default ExampleTableHeight;
