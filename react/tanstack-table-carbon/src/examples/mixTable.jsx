/* eslint-disable max-lines-per-function */
import { useEffect, useState } from 'react';
import { TanstackTable, TableOverflowMenu } from '@/lib';
import {
  Add as AddIcon,
  User as UserIcon,
  Download,
  Renew,
  ChevronUp,
  ChevronDown,
  TableSplit as TableIcon,
} from '@carbon/icons-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Tag,
  Dropdown,
  IconButton,
  OverflowMenuItem,
} from '@carbon/react';
import commonStyles from './scss/common.module.scss';

const formatJoinDateForStorage = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatJoinDateForDisplay = (value) => {
  if (!value) {
    return '';
  }

  const [year, month, day] = String(value).split('-');
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Mock data generator for demonstration
const generateMockData = (count = 30) => {
  const departments = [
    'IT',
    'HR',
    'Sales',
    'Marketing',
    'Finance',
    'Operations',
    'Legal',
    'R&D',
  ];
  const roles = [
    'Admin',
    'Manager',
    'Developer',
    'Analyst',
    'Designer',
    'Consultant',
  ];
  const statuses = ['Active', 'Inactive', 'Pending', 'Suspended'];
  const locations = [
    'New York',
    'London',
    'Tokyo',
    'Mumbai',
    'Sydney',
    'Toronto',
    'Berlin',
  ];
  const teams = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'];
  const genders = ['Male', 'Female'];
  const verificationStatus = ['Verified', 'Unverified'];

  return Array.from({ length: count }, (_, i) => {
    // Generate random login time (HH:MM format)
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    const loginTime = `${String(hour).padStart(2, '0')}:${String(
      minute
    ).padStart(2, '0')}`;

    return {
      id: `user-${i + 1}`,
      userId: `USR${String(i + 1).padStart(5, '0')}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@company.com`,
      department: departments[Math.floor(Math.random() * departments.length)],
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      team: teams[Math.floor(Math.random() * teams.length)],
      gender: genders[Math.floor(Math.random() * genders.length)],
      verified:
        verificationStatus[
          Math.floor(Math.random() * verificationStatus.length)
        ],
      phone: `+1 (555) ${String(
        Math.floor(Math.random() * 900) + 100
      )}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      loginTime: loginTime,
      joinDate: formatJoinDateForStorage(
        new Date(
          2020 + Math.floor(Math.random() * 5),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        )
      ),
      resignDate:
        Math.random() > 0.7
          ? formatJoinDateForStorage(
              new Date(
                2024 + Math.floor(Math.random() * 2),
                Math.floor(Math.random() * 12),
                Math.floor(Math.random() * 28) + 1
              )
            )
          : null,
      salary: 50000 + Math.floor(Math.random() * 100000),
      experience: `${Math.floor(Math.random() * 15) + 1} years`,
      projects: Math.floor(Math.random() * 20) + 1,
    };
  });
};

const MixTable = ({ toggleHeaderContent, isHeaderContentVisible }) => {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  // eslint-disable-next-line
  const [sorting, setSorting] = useState([{ id: 'userId', desc: false }]);

  // Simulate API call with useEffect
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 3500));

      // Generate mock data
      const data = generateMockData(50).sort((a, b) =>
        a.userId.localeCompare(b.userId)
      );
      setTableData(data);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Filter options for dropdown
  const filterOptions = [
    { id: 'all', label: 'All users' },
    { id: 'active', label: 'Active users' },
    { id: 'inactive', label: 'Inactive users' },
    { id: 'pending', label: 'Pending users' },
  ];

  // Column definitions with 13 columns
  const columns = [
    {
      accessorKey: 'userId',
      header: 'User ID',
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        filterVariant: 'text',
      },
      size: 120,
    },
    {
      accessorKey: 'name',
      header: 'Full Name',
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        filterVariant: 'text',
      },
      size: 180,
    },
    {
      accessorKey: 'email',
      header: 'Email Address',
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        filterVariant: 'text',
      },
      size: 220,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        filterVariant: 'multiselect',
      },
      cell: ({ getValue }) => {
        const value = getValue();
        const colors = {
          IT: 'blue',
          HR: 'green',
          Sales: 'purple',
          Marketing: 'magenta',
          Finance: 'teal',
          Operations: 'cyan',
          Legal: 'gray',
          'R&D': 'red',
        };
        return <Tag type={colors[value] || 'gray'}>{value}</Tag>;
      },
      size: 150,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        filterVariant: 'checkbox',
        editable: true,
        editableType: 'select',
        options: [
          'Admin',
          'Manager',
          'Developer',
          'Analyst',
          'Designer',
          'Consultant',
        ],
      },
      size: 140,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        filterVariant: 'checkbox',
      },
      cell: ({ getValue }) => {
        const value = getValue();
        const colors = {
          Active: 'green',
          Inactive: 'gray',
          Pending: 'blue',
          Suspended: 'red',
        };
        return <Tag type={colors[value] || 'gray'}>{value}</Tag>;
      },
      size: 120,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        filterVariant: 'select',
      },
      size: 140,
    },
    {
      accessorKey: 'team',
      header: 'Team',
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        filterVariant: 'checkbox',
      },
      size: 120,
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        filterVariant: 'radio',
      },
      size: 100,
    },
    {
      accessorKey: 'verified',
      header: 'Verification',
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        filterVariant: 'toggle',
      },
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <Tag type={value === 'Verified' ? 'green' : 'gray'}>{value}</Tag>
        );
      },
      size: 130,
    },
    {
      accessorKey: 'phone',
      header: 'Phone Number',
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        filterVariant: 'text',
        editable: true,
        validate: (value) => {
          if (!value) {
            return true;
          } // Allow empty
          if (value.length > 18) {
            return 'Phone number cannot exceed 18 characters';
          }
          return true;
        },
      },
      size: 200,
    },
    {
      accessorKey: 'loginTime',
      header: 'Login Time',
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        filterVariant: 'time',
      },
      size: 140,
    },
    {
      accessorKey: 'joinDate',
      header: 'Join Date',
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        filterVariant: 'dateRange',
        editable: true,
        editableType: 'date',
      },
      cell: ({ getValue }) => formatJoinDateForDisplay(getValue()),
      size: 150,
    },
    {
      accessorKey: 'resignDate',
      header: 'Resign Date',
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        filterVariant: 'date',
      },
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? formatJoinDateForDisplay(value) : '-';
      },
      size: 150,
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      enableSorting: true,
      enableColumnFilter: true,
      size: 130,
      meta: {
        filterVariant: 'slider',
      },
      cell: ({ getValue }) => {
        const value = getValue();
        return `$${value.toLocaleString()}`;
      },
    },
    {
      accessorKey: 'experience',
      header: 'Experience',
      enableSorting: true,
      enableColumnFilter: false,
      size: 130,
    },
    {
      accessorKey: 'projects',
      header: 'Projects',
      enableSorting: true,
      // enableColumnFilter: false,
      meta: {
        // filterVariant: "number",
      },
      size: 110,
    },
    {
      id: 'overflow-menu',
      header: '',
      enableSorting: false,
      enableColumnFilter: false,
      size: 50,
      meta: {
        showInColumnCustomization: false, // used to hide column from the column customization menu
      },
      cell: ({ row }) => (
        <TableOverflowMenu size="md" flipped>
          <OverflowMenuItem
            itemText="View Details"
            onClick={() => {
              // eslint-disable-next-line no-console
              console.log('View details:', row.original);
              alert(`Viewing details for ${row.original.name}`);
            }}
          />
          <OverflowMenuItem
            itemText="Edit"
            onClick={() => {
              // eslint-disable-next-line no-console
              console.log('Edit user:', row.original);
              alert(`Editing ${row.original.name}`);
            }}
          />
          <OverflowMenuItem
            itemText="Duplicate"
            onClick={() => {
              // eslint-disable-next-line no-console
              console.log('Duplicate user:', row.original);
              alert(`Duplicating ${row.original.name}`);
            }}
          />
          <OverflowMenuItem
            itemText="Delete"
            disabled={row.original.userId === 'USR00002'}
            isDelete
            onClick={() => {
              // eslint-disable-next-line no-console
              console.log('Delete user:', row.original);
              if (
                confirm(`Are you sure you want to delete ${row.original.name}?`)
              ) {
                alert(`Deleted ${row.original.name}`);
              }
            }}
          />
        </TableOverflowMenu>
      ),
    },
  ];

  // Handle selection change
  const handleSelectionChange = (selectedRows) => {
    // eslint-disable-next-line no-console
    console.log('Selected rows:', selectedRows);
  };

  // Handle bulk action from dropdown
  const handleBulkAction = (actionId, selectedRows) => {
    // eslint-disable-next-line no-console
    console.log(`Bulk action: ${actionId}`, selectedRows);

    switch (actionId) {
      case 'export':
        alert(`Exporting ${selectedRows.length} users to CSV`);
        break;
      case 'export-excel':
        alert(`Exporting ${selectedRows.length} users to Excel`);
        break;
      case 'archive':
        if (confirm(`Archive ${selectedRows.length} users?`)) {
          alert(`Archived ${selectedRows.length} users`);
        }
        break;
      case 'assign-role':
        alert(`Assign role to ${selectedRows.length} users`);
        break;
      case 'change-department':
        alert(`Change department for ${selectedRows.length} users`);
        break;
      default:
        break;
    }
  };

  // Batch actions with overflow menu
  const batchActions = [
    {
      label: 'Delete Selected',
      icon: UserIcon,
      onClick: (rows) => {
        // eslint-disable-next-line no-console
        console.log('Deleting:', rows);
        if (confirm(`Delete ${rows.length} users?`)) {
          alert(`Deleted ${rows.length} users`);
        }
      },
    },
    {
      label: 'Copy Selected',
      icon: UserIcon,
      onClick: (rows) => {
        // eslint-disable-next-line no-console
        console.log('Copy:', rows);
        if (confirm(`Copy ${rows.length} users?`)) {
          alert(`Copy ${rows.length} users`);
        }
      },
    },
    {
      type: 'overflow',
      label: 'Bulk actions',
      options: [
        { id: 'export', label: 'Export to CSV' },
        { id: 'export-excel', label: 'Export to Excel' },
        { id: 'archive', label: 'Archive Users', hasDivider: true },
        { id: 'assign-role', label: 'Assign Role' },
        { id: 'change-department', label: 'Change Department' },
      ],
      onOptionClick: handleBulkAction,
    },
  ];

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Mix Functionality - All Features</h2>
          <p className="example-description">
            This comprehensive example demonstrates all table features working
            together: sticky columns, side filter panel, search, batch actions,
            fixed height, editable cells, column customization, sorting, and
            pagination.
          </p>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <TanstackTable
          data={tableData}
          columns={columns}
          isLoading={isLoading}
          features={{
            selection: {
              type: 'checkbox',
              batchActions,
              onChange: handleSelectionChange,
            },
            sorting: {
              sorting,
            },
            pagination: { pageSize: 20, pageSizeOptions: [5, 10, 20, 30, 50] },
            columnPinning: {
              left: ['select', 'userId'],
              right: ['overflow-menu'],
            },
            columnSettings: {
              localStorageKey: 'users-table', // Auto-saves column visibility and order to localStorage
            },
            editing: {
              enabled: true,
              onDataChange: setTableData,
            },
            sideFilterPanel: {
              onAdvancedFilterClick: () => alert('advanceFilterClick'),
              onApply: (filters) => {
                // eslint-disable-next-line no-console
                console.log('Column filters changed:', filters);
              },
            },
          }}
          tableSize="md"
          height={600}
          emptyState={{
            title: 'No users found',
            subtitle:
              'Try adjusting your search or filters, or add a new user to get started',
          }}
          toolbar={[
            { type: 'filter' },
            {
              type: 'custom',
              element: (
                <Dropdown
                  id="user-filter-dropdown"
                  titleText=""
                  aria-label="Filter users"
                  label={
                    filterOptions.find((opt) => opt.id === selectedFilter)
                      ?.label || 'All users'
                  }
                  items={filterOptions}
                  itemToString={(item) => (item ? item.label : '')}
                  selectedItem={filterOptions.find(
                    (opt) => opt.id === selectedFilter
                  )}
                  onChange={({ selectedItem }) =>
                    setSelectedFilter(selectedItem.id)
                  }
                  size="lg"
                />
              ),
            },
            { type: 'search' },
            {
              type: 'custom',
              element: (
                <IconButton
                  kind="ghost"
                  label="Download"
                  onClick={() => alert('Download')}>
                  <Download />
                </IconButton>
              ),
            },
            {
              type: 'custom',
              element: (
                <IconButton
                  kind="ghost"
                  label="Refresh"
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      //setTableData(generateMockData(30));
                      setIsLoading(false);
                    }, 1000);
                  }}>
                  <Renew />
                </IconButton>
              ),
            },
            {
              type: 'settings',
              menuItems: [
                {
                  label: 'Export table settings',
                  onClick: () => {
                    // eslint-disable-next-line no-console
                    console.log('Exporting table settings');
                    alert('Table settings exported!');
                  },
                },
                {
                  type: 'columnSettings', // Built-in column settings - positioned in the middle
                },
                {
                  label: 'Import settings',
                  onClick: () => {
                    // eslint-disable-next-line no-console
                    console.log('Importing table settings');
                    alert('Import table settings');
                  },
                },
                {
                  label: 'Reset to defaults',
                  onClick: () => {
                    // eslint-disable-next-line no-console
                    console.log('Resetting to defaults');
                    if (
                      confirm(
                        'Are you sure you want to reset all table settings to defaults?'
                      )
                    ) {
                      alert('Table settings reset to defaults');
                    }
                  },
                  hasDivider: true,
                  isDelete: true,
                },
              ],
            },
            {
              type: 'custom',
              element: (
                <IconButton
                  kind="ghost"
                  label={
                    isHeaderContentVisible ? 'Collapse header' : 'Expand header'
                  }
                  onClick={toggleHeaderContent}
                  iconDescription={
                    isHeaderContentVisible ? 'Expand table' : 'Collapse table'
                  }>
                  {isHeaderContentVisible ? <ChevronUp /> : <ChevronDown />}
                </IconButton>
              ),
            },
            {
              type: 'custom',
              element: (
                <Button
                  kind="primary"
                  renderIcon={AddIcon}
                  onClick={() => alert('Create user')}>
                  Create user
                </Button>
              ),
            },
          ]}
        />
      </div>
    </>
  );
};

export default MixTable;
