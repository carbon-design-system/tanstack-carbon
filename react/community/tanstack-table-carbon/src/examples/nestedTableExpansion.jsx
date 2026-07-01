import { useMemo } from 'react';
import { TanstackTable } from '@/lib';
import { TrashCan, Download } from '@carbon/icons-react';
import commonStyles from './scss/common.module.scss';
import styles from './scss/nestedTableExpansion.module.scss';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Finance', 'Sales', 'HR'];

const outerData = DEPARTMENTS.map((dept, i) => ({
  id: `dept-${i + 1}`,
  department: dept,
  headCount: (i + 1) * 3,
  budget: `$${(i + 1) * 50}k`,
  members: Array.from({ length: 3 }, (_, j) => ({
    id: `member-${i}-${j}`,
    name: `User ${i * 3 + j + 1}`,
    role: j === 0 ? 'Lead' : 'Engineer',
    status: j % 2 === 0 ? 'Active' : 'Inactive',
    email: `user${i * 3 + j + 1}@example.com`,
    details: {
      phone: `+1 555-000-${String(i * 3 + j + 1).padStart(4, '0')}`,
      location: ['New York', 'San Francisco', 'Chicago', 'Austin', 'Boston'][
        i % 5
      ],
      joinDate: `2024-0${j + 1}-15`,
      skills: ['React', 'Node.js', 'TypeScript', 'Python', 'Java']
        .slice(j, j + 3)
        .join(', '),
    },
  })),
}));

const innerBatchActions = [
  {
    label: 'Export',
    icon: Download,
    onClick: (selectedRows) => {
      // eslint-disable-next-line no-console
      console.log('Export members:', selectedRows);
      alert(`Exporting ${selectedRows.length} member(s)...`);
    },
  },
  {
    label: 'Delete',
    icon: TrashCan,
    onClick: (selectedRows) => {
      // eslint-disable-next-line no-console
      console.log('Delete members:', selectedRows);
      alert(`Delete ${selectedRows.length} member(s)?`);
    },
  },
];

const renderMemberDetails = (memberData) => (
  <div className={styles.memberDetails}>
    <div className={styles.memberDetailsGrid}>
      <div>
        <strong>Phone:</strong> {memberData.details.phone}
      </div>
      <div>
        <strong>Location:</strong> {memberData.details.location}
      </div>
      <div>
        <strong>Join Date:</strong> {memberData.details.joinDate}
      </div>
      <div>
        <strong>Skills:</strong> {memberData.details.skills}
      </div>
    </div>
  </div>
);

const NestedTable = ({ members }) => {
  const innerColumns = useMemo(
    () => [
      { id: 'name', accessorKey: 'name', header: 'Name', enableSorting: true },
      { id: 'role', accessorKey: 'role', header: 'Role', enableSorting: true },
      {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
        enableSorting: true,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          const cls =
            status === 'Active' ? commonStyles.active : commonStyles.inactive;
          return (
            <span className={`${commonStyles.statusBadge} ${cls}`}>
              {status}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className={styles.nestedTableWrapper}>
      <TanstackTable
        data={members}
        columns={innerColumns}
        isLoading={false}
        tableSize="sm"
        useZebraStyles
        toolbar={[{ type: 'search' }]}
        features={{
          selection: {
            type: 'checkbox',
            batchActions: innerBatchActions,
          },
          expansion: {
            renderExpandedRow: renderMemberDetails,
            onExpandedChange: (expanded) => {
              // eslint-disable-next-line no-console
              console.log('Inner expanded rows:', expanded);
            },
          },
        }}
        emptyState={{ title: 'No members', subtitle: '' }}
      />
    </div>
  );
};

const NestedTableExpansion = () => {
  const outerColumns = useMemo(
    () => [
      {
        id: 'department',
        accessorKey: 'department',
        header: 'Department',
        enableSorting: true,
      },
      {
        id: 'headCount',
        accessorKey: 'headCount',
        header: 'Head Count',
        enableSorting: true,
        size: 140,
      },
      {
        id: 'budget',
        accessorKey: 'budget',
        header: 'Budget',
        enableSorting: true,
        size: 120,
      },
    ],
    []
  );

  const renderExpandedRow = (rowData) => (
    <NestedTable members={rowData.members} />
  );

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Nested Table - Features</h2>
          <p className="example-description">
            This example shows that we can use this at any nested level.
          </p>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <TanstackTable
          data={outerData}
          columns={outerColumns}
          isLoading={false}
          toolbar={[{ type: 'search' }]}
          tableSize="md"
          useZebraStyles={false}
          features={{
            pagination: { pageSize: 10, pageSizeOptions: [5, 10, 20] },
            expansion: {
              renderExpandedRow,
              onExpandedChange: (expanded) => {
                // eslint-disable-next-line no-console
                console.log('Outer expanded rows:', expanded);
              },
            },
          }}
          emptyState={{ title: 'No departments found', subtitle: '' }}
          height="calc(100vh - 300px)"
        />
      </div>
    </>
  );
};

export default NestedTableExpansion;
