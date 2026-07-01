import { useState } from 'react';
import { TanstackTable } from '@/lib';
import {
  Add as AddIcon,
  TableSplit as TableIcon,
  TrashCan,
  Download,
} from '@carbon/icons-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  UnorderedList,
  ListItem,
} from '@carbon/react';
import commonStyles from './scss/common.module.scss';
import styles from './scss/expansionRadioSticky.module.scss';

const ExampleWithExpansionRadioSticky = () => {
  const [selectedRow, setSelectedRow] = useState(null);

  // Mock data
  const mockData = [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      department: 'Engineering',
      role: 'Senior Developer',
      status: 'Active',
      salary: '$120,000',
      details: {
        phone: '+1 234-567-8900',
        location: 'New York, USA',
        joinDate: '2024-01-15',
        manager: 'Jane Smith',
        skills: ['React', 'Node.js', 'TypeScript'],
        projects: ['Project Alpha', 'Project Beta'],
      },
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      department: 'Marketing',
      role: 'Marketing Manager',
      status: 'Active',
      salary: '$95,000',
      details: {
        phone: '+1 234-567-8901',
        location: 'San Francisco, USA',
        joinDate: '2024-01-16',
        manager: 'Bob Johnson',
        skills: ['SEO', 'Content Strategy', 'Analytics'],
        projects: ['Campaign Q1', 'Brand Refresh'],
      },
    },
    {
      id: 'user-3',
      name: 'Bob Johnson',
      email: 'bob.j@example.com',
      department: 'Sales',
      role: 'Sales Director',
      status: 'Active',
      salary: '$110,000',
      details: {
        phone: '+1 234-567-8902',
        location: 'Chicago, USA',
        joinDate: '2024-01-17',
        manager: 'Alice Williams',
        skills: ['Negotiation', 'CRM', 'Lead Generation'],
        projects: ['Q1 Sales Drive', 'Client Onboarding'],
      },
    },
    {
      id: 'user-4',
      name: 'Alice Williams',
      email: 'alice.w@example.com',
      department: 'HR',
      role: 'HR Specialist',
      status: 'Inactive',
      salary: '$75,000',
      details: {
        phone: '+1 234-567-8903',
        location: 'Boston, USA',
        joinDate: '2024-01-18',
        manager: 'Charlie Brown',
        skills: ['Recruitment', 'Employee Relations', 'Training'],
        projects: ['Onboarding Program', 'Culture Initiative'],
      },
    },
    {
      id: 'user-5',
      name: 'Charlie Brown',
      email: 'charlie.b@example.com',
      department: 'Finance',
      role: 'Financial Analyst',
      status: 'Active',
      salary: '$85,000',
      details: {
        phone: '+1 234-567-8904',
        location: 'Austin, USA',
        joinDate: '2024-01-19',
        manager: 'David Lee',
        skills: ['Financial Modeling', 'Excel', 'Reporting'],
        projects: ['Budget 2024', 'Cost Analysis'],
      },
    },
  ];

  // Define columns with sticky name column
  const columns = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
      size: 150,
      cell: (info) => <div className={styles.nameCell}>{info.getValue()}</div>,
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
      size: 200,
      cell: (info) => info.getValue(),
    },
    {
      id: 'department',
      accessorKey: 'department',
      header: 'Department',
      enableSorting: true,
      size: 150,
      cell: (info) => info.getValue(),
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: 'Role',
      enableSorting: true,
      size: 180,
      cell: (info) => info.getValue(),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      size: 120,
      cell: (info) => {
        const status = info.getValue();
        const statusClass =
          status === 'Active' ? styles.active : styles.inactive;
        return (
          <span className={`${styles.statusBadge} ${statusClass}`}>
            {status}
          </span>
        );
      },
    },
    {
      id: 'salary',
      accessorKey: 'salary',
      header: 'Salary',
      enableSorting: true,
      size: 120,
      cell: (info) => (
        <div className={styles.salaryCell}>{info.getValue()}</div>
      ),
    },
  ];

  // Render expanded row content
  const renderExpandedRow = (rowData) => (
    <div className={styles.expandedRow}>
      <h6 className={styles.expandedTitle}>
        Additional Details for {rowData.name}
      </h6>
      <div className={styles.expandedGrid}>
        <div>
          <div className={styles.detailItem}>
            <strong className={styles.detailLabel}>Phone:</strong>
            <div className={styles.detailValue}>{rowData.details.phone}</div>
          </div>
          <div className={styles.detailItem}>
            <strong className={styles.detailLabel}>Location:</strong>
            <div className={styles.detailValue}>{rowData.details.location}</div>
          </div>
          <div className={styles.detailItem}>
            <strong className={styles.detailLabel}>Join Date:</strong>
            <div className={styles.detailValue}>{rowData.details.joinDate}</div>
          </div>
          <div className={styles.detailItem}>
            <strong className={styles.detailLabel}>Manager:</strong>
            <div className={styles.detailValue}>{rowData.details.manager}</div>
          </div>
        </div>
        <div>
          <div className={styles.detailItem}>
            <strong className={styles.detailLabel}>Skills:</strong>
            <div className={styles.skillsContainer}>
              {rowData.details.skills.map((skill, index) => (
                <span key={index} className={styles.skillTag}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.detailItem}>
            <strong className={styles.detailLabel}>Projects:</strong>
            <div className={styles.projectsList}>
              {rowData.details.projects.map((project, index) => (
                <div key={index} className={styles.projectItem}>
                  • {project}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
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
          <h2 className="example-title">
            Row Expansion with Selection and Sticky Columns
          </h2>
          <p className="example-description">
            This example demonstrates advanced table features combining multiple
            capabilities:
          </p>
          <UnorderedList className={commonStyles.unorderedList}>
            <ListItem>Checkbox selection (multiple row selection)</ListItem>
            <ListItem>Row expansion to show additional details</ListItem>
            <ListItem>
              Sticky columns: Expand, Selection, and Name columns stay fixed
              when scrolling horizontally
            </ListItem>
            <ListItem>
              Custom styled expanded content with skills and projects
            </ListItem>
            <ListItem>
              Expand column integrated as a proper TanStack column with pinning
              support
            </ListItem>
          </UnorderedList>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        {selectedRow && (
          <div className={styles.selectedRowInfo}>
            <strong>Selected User:</strong> {selectedRow.name} (
            {selectedRow.email})
          </div>
        )}
        <TanstackTable
          data={mockData}
          columns={columns}
          isLoading={false}
          toolbar={[
            { type: 'search' },
            { type: 'custom', element: toolbarContent },
          ]}
          tableSize="md"
          features={{
            selection: {
              type: 'checkbox',
              batchActions,
            },
            pagination: {
              pageSize: 10,
              pageSizeOptions: [5, 10, 20],
            },
            columnPinning: {
              left: ['select', 'name'], // Pin expand, selection and name columns to left
              right: ['expand'], // Expand column is now a proper TanStack column and can be pinned!
            },
            expansion: {
              renderExpandedRow,
              onExpandedChange: () => {},
              /* 
              expandColumnPosition: 'first' // Default - expand column appears first
              expandColumnPosition: 'afterSelection' // Expand after selection column
              */
              expandColumnPosition: 'last', // Expand at the end
            },
          }}
          emptyState={{
            title: 'No users found',
            subtitle: 'Try adjusting your search or filters',
          }}
          onRowSelectionChange={(selection) => {
            // get the selected row data
            const selectedId = Object.keys(selection)[0];
            const selected = mockData.find((row) => row.id === selectedId);
            setSelectedRow(selected || null);
          }}
        />
      </div>
    </>
  );
};

export default ExampleWithExpansionRadioSticky;
