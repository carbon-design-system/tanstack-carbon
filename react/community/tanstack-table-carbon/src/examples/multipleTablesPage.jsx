import { useMemo, useState } from 'react';
import { TanstackTable, TableOverflowMenu } from '@/lib';
import { TrashCan } from '@carbon/icons-react';
import { OverflowMenuItem, Dropdown } from '@carbon/react';
import commonStyles from './scss/common.module.scss';
import styles from './scss/multipleTablesPage.module.scss';

const STATUSES = ['Active', 'Inactive'];
// Filter options for dropdown
const filterOptions1 = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];
const filterOptions2 = [
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

const usersData = Array.from({ length: 8 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  department: ['Engineering', 'Marketing', 'Finance', 'Sales', 'HR'][i % 5],
  status: STATUSES[i % 2],
}));

const projectsData = Array.from({ length: 6 }, (_, i) => ({
  id: `proj-${i + 1}`,
  project: `Project ${String.fromCharCode(65 + i)}`,
  owner: `User ${i + 1}`,
  priority: ['High', 'Medium', 'Low'][i % 3],
  status: STATUSES[i % 2],
}));

const userColumns = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
    size: 160,
  },
  { id: 'email', accessorKey: 'email', header: 'Email', enableSorting: true },
  {
    id: 'department',
    accessorKey: 'department',
    header: 'Department',
    enableSorting: true,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    cell: (info) => {
      const status = info.getValue();
      const cls =
        status === 'Active' ? commonStyles.active : commonStyles.inactive;
      return (
        <span className={`${commonStyles.statusBadge} ${cls}`}>{status}</span>
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

const projectColumns = [
  {
    id: 'project',
    accessorKey: 'project',
    header: 'Project',
    enableSorting: true,
    size: 160,
  },
  { id: 'owner', accessorKey: 'owner', header: 'Owner', enableSorting: true },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: 'Priority',
    enableSorting: true,
    size: 120,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    cell: (info) => {
      const status = info.getValue();
      const cls =
        status === 'Active' ? commonStyles.active : commonStyles.inactive;
      return (
        <span className={`${commonStyles.statusBadge} ${cls}`}>{status}</span>
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
            onClick={() => alert(`Edit ${rowData.project}`)}
          />
          <OverflowMenuItem
            itemText="Delete"
            isDelete
            onClick={() => alert(`Delete ${rowData.project}`)}
          />
        </TableOverflowMenu>
      );
    },
  },
];

const userBatchActions = [
  {
    label: 'Delete',
    icon: TrashCan,
    onClick: (selectedRows) => {
      // eslint-disable-next-line no-console
      console.log('Delete users:', selectedRows);
      alert(`Delete ${selectedRows.length} user(s)?`);
    },
  },
];

const projectBatchActions = [
  {
    label: 'Delete',
    icon: TrashCan,
    onClick: (selectedRows) => {
      // eslint-disable-next-line no-console
      console.log('Delete projects:', selectedRows);
      alert(`Delete ${selectedRows.length} project(s)?`);
    },
  },
];

const MultipleTablesPage = () => {
  const memoUserColumns = useMemo(() => userColumns, []);
  const memoProjectColumns = useMemo(() => projectColumns, []);
  const [selectedFilter1, setSelectedFilter1] = useState('high');
  const [selectedFilter2, setSelectedFilter2] = useState('active');

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Multiple Table at same page</h2>
          <p className="example-description">
            This example shows that we can use .
          </p>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <div className={styles.tablesGrid}>
          <section className={styles.tableSection}>
            <h5 className={styles.sectionTitle}>Users</h5>
            {/* labels.toolbarAriaLabel gives the toolbar group its accessible name.
                Each table on the same page must have a unique value so assistive
                technologies can distinguish one toolbar from another. */}
            <TanstackTable
              data={usersData}
              columns={memoUserColumns}
              isLoading={false}
              labels={{ toolbarAriaLabel: 'Users table toolbar' }}
              toolbar={[
                {
                  type: 'custom',
                  element: (
                    <Dropdown
                      id="user-filter-dropdown"
                      aria-label="Filter users"
                      label={
                        filterOptions1.find((opt) => opt.id === selectedFilter1)
                          ?.label
                      }
                      items={filterOptions1}
                      itemToString={(item) => (item ? item.label : '')}
                      selectedItem={filterOptions1.find(
                        (opt) => opt.id === selectedFilter1
                      )}
                      onChange={({ selectedItem }) =>
                        setSelectedFilter1(selectedItem.id)
                      }
                      size="lg"
                      titleText="Defined by"
                      type="inline"
                    />
                  ),
                },
                { type: 'search' },
              ]}
              tableSize="md"
              useZebraStyles={false}
              features={{
                pagination: { pageSize: 5, pageSizeOptions: [5, 10] },
                selection: {
                  type: 'checkbox',
                  batchActions: userBatchActions,
                },
                columnPinning: {
                  left: ['select', 'name'],
                },
              }}
              emptyState={{ title: 'No users found', subtitle: '' }}
            />
          </section>

          <section className={styles.tableSection}>
            <h5 className={styles.sectionTitle}>Projects</h5>
            {/* Same reason — unique toolbarAriaLabel prevents the duplicate-group-name
                accessibility violation (WCAG rule fieldset_label_valid / Fail_2). */}
            <TanstackTable
              data={projectsData}
              columns={memoProjectColumns}
              isLoading={false}
              labels={{ toolbarAriaLabel: 'Projects table toolbar' }}
              toolbar={[
                {
                  type: 'custom',
                  element: (
                    <Dropdown
                      id="user-filter-dropdown"
                      aria-label="Filter users"
                      label={
                        filterOptions2.find((opt) => opt.id === selectedFilter2)
                          ?.label
                      }
                      items={filterOptions2}
                      itemToString={(item) => (item ? item.label : '')}
                      selectedItem={filterOptions2.find(
                        (opt) => opt.id === selectedFilter2
                      )}
                      onChange={({ selectedItem }) =>
                        setSelectedFilter2(selectedItem.id)
                      }
                      size="lg"
                      titleText=""
                    />
                  ),
                },
                { type: 'search' },
              ]}
              tableSize="md"
              useZebraStyles={false}
              features={{
                pagination: { pageSize: 5, pageSizeOptions: [5, 10] },
                selection: {
                  type: 'checkbox',
                  batchActions: projectBatchActions,
                },
                columnPinning: {
                  left: ['select', 'project'],
                },
              }}
              height={200}
              emptyState={{ title: 'No projects found', subtitle: '' }}
            />
          </section>
        </div>
      </div>
    </>
  );
};

export default MultipleTablesPage;
