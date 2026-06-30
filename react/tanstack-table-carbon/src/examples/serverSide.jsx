import { useState, useEffect } from 'react';
import { TanstackTable, TableOverflowMenu } from '@/lib';
import {
  Add as AddIcon,
  Download,
  Renew,
  Settings,
  TableSplit as TableIcon,
} from '@carbon/icons-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Tag,
  IconButton,
  OverflowMenuItem,
} from '@carbon/react';
import commonStyles from './scss/common.module.scss';

// Mock API function to simulate server-side data fetching
const fetchServerData = async ({
  pageIndex,
  pageSize,
  sorting,
  globalFilter,
  columnFilters,
}) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate mock data (in real app, this would be an API call)
  const allData = Array.from({ length: 100 }, (_, i) => ({
    id: `user-${i + 1}`,
    userId: `USR${String(i + 1).padStart(5, '0')}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@company.com`,
    department: ['IT', 'HR', 'Sales', 'Marketing', 'Finance'][
      Math.floor(Math.random() * 5)
    ],
    role: ['Admin', 'Manager', 'Developer', 'Analyst'][
      Math.floor(Math.random() * 4)
    ],
    status: ['Active', 'Inactive', 'Pending'][Math.floor(Math.random() * 3)],
    location: ['New York', 'London', 'Tokyo', 'Mumbai'][
      Math.floor(Math.random() * 4)
    ],
  }));

  // Apply server-side filtering
  let filteredData = [...allData];

  // Global search filter
  if (globalFilter) {
    filteredData = filteredData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(globalFilter.toLowerCase())
      )
    );
  }

  // Column filters
  if (columnFilters && columnFilters.length > 0) {
    columnFilters.forEach((filter) => {
      filteredData = filteredData.filter((row) => {
        const cellValue = row[filter.id];
        if (Array.isArray(filter.value)) {
          return filter.value.includes(cellValue);
        }
        return String(cellValue)
          .toLowerCase()
          .includes(String(filter.value).toLowerCase());
      });
    });
  }

  // Apply server-side sorting
  if (sorting && sorting.length > 0) {
    const { id, desc } = sorting[0];
    filteredData.sort((a, b) => {
      const aVal = a[id];
      const bVal = b[id];
      if (aVal < bVal) {
        return desc ? 1 : -1;
      }
      if (aVal > bVal) {
        return desc ? -1 : 1;
      }
      return 0;
    });
  }

  // Apply server-side pagination
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / pageSize);
  const start = pageIndex * pageSize;
  const end = start + pageSize;
  const paginatedData = filteredData.slice(start, end);

  return {
    data: paginatedData,
    pageCount: totalPages,
    rowCount: totalRows,
  };
};

const ServerSideUserTable = () => {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [rowCount, setRowCount] = useState(0);

  // Server-side state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);

  // Column settings state (for persistence)
  const [columnSettings, setColumnSettings] = useState({
    visibility: {},
    order: [],
  });

  // Fetch data whenever server-side state changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchServerData({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          sorting,
          globalFilter,
          columnFilters,
        });
        setTableData(result.data);
        setPageCount(result.pageCount);
        setRowCount(result.rowCount);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [pagination, sorting, globalFilter, columnFilters]);

  // Column definitions
  const columns = [
    {
      accessorKey: 'userId',
      header: 'User ID',
      enableSorting: true,
      enableColumnFilter: true,
      meta: { filterVariant: 'text' },
      size: 120,
    },
    {
      accessorKey: 'name',
      header: 'Full Name',
      enableSorting: true,
      enableColumnFilter: true,
      meta: { filterVariant: 'text' },
      size: 180,
    },
    {
      accessorKey: 'email',
      header: 'Email Address',
      enableSorting: true,
      enableColumnFilter: true,
      meta: { filterVariant: 'text' },
      size: 220,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      enableSorting: true,
      enableColumnFilter: true,
      meta: { filterVariant: 'select' },
      cell: ({ getValue }) => {
        const value = getValue();
        const colors = {
          IT: 'blue',
          HR: 'green',
          Sales: 'purple',
          Marketing: 'magenta',
          Finance: 'teal',
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
      meta: { filterVariant: 'checkbox' },
      size: 140,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      enableColumnFilter: true,
      meta: { filterVariant: 'checkbox' },
      cell: ({ getValue }) => {
        const value = getValue();
        const colors = {
          Active: 'green',
          Inactive: 'gray',
          Pending: 'blue',
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
      meta: { filterVariant: 'select' },
      size: 140,
    },
    {
      id: 'overflow-menu',
      header: '',
      enableSorting: false,
      enableColumnFilter: false,
      size: 50,
      meta: { showInColumnCustomization: false },
      cell: ({ row }) => (
        <TableOverflowMenu size="md" flipped>
          <OverflowMenuItem
            itemText="View Details"
            onClick={() => alert(`Viewing details for ${row.original.name}`)}
          />
          <OverflowMenuItem
            itemText="Edit"
            onClick={() => alert(`Editing ${row.original.name}`)}
          />
          <OverflowMenuItem
            itemText="Delete"
            isDelete
            onClick={() => {
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

  // Server-side handlers
  const handlePaginationChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSortingChange = (newSorting) => {
    // eslint-disable-next-line no-console
    console.log('newSorting', newSorting);
    setSorting(newSorting);
  };

  const handleSearchChange = (value) => {
    setGlobalFilter(value);
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleColumnFiltersChange = (newFilters) => {
    setColumnFilters(newFilters);
    // Reset to first page when filtering
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Column settings handlers (for manual persistence - e.g., API)
  const handleVisibilityChange = (newVisibility) => {
    const updated = { ...columnSettings, visibility: newVisibility };
    setColumnSettings(updated);

    // In real app, save to API here
    // eslint-disable-next-line no-console
    console.log('Save column visibility to API:', newVisibility);
    // Example: await saveColumnSettings(userId, tableId, updated);
  };

  const handleOrderChange = (newOrder) => {
    const updated = { ...columnSettings, order: newOrder };
    setColumnSettings(updated);

    // In real app, save to API here
    // eslint-disable-next-line no-console
    console.log('Save column order to API:', newOrder);
    // Example: await saveColumnSettings(userId, tableId, updated);
  };

  // Batch actions
  const batchActions = [
    {
      label: 'Export Selected',
      icon: AddIcon,
      onClick: (rows) => alert(`Exporting ${rows.length} users`),
    },
    {
      label: 'Deactivate',
      icon: Settings,
      onClick: (rows) => alert(`Deactivating ${rows.length} users`),
    },
  ];

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Server-Side Table</h2>
          <p className="example-description">
            This table demonstrates server-side pagination, sorting, searching,
            and filtering. All data operations are handled on the server with
            simulated API calls and 500ms delay to show loading states.
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
            },
            search: {
              onChange: handleSearchChange,
            },
            pagination: {
              ...pagination,
              onChange: handlePaginationChange,
              pageCount,
              rowCount,
            },
            sorting: {
              sorting,
              onChange: handleSortingChange,
            },
            columnPinning: {
              left: ['select', 'userId'],
              right: ['overflow-menu'],
            },
            columnSettings: {
              visibility: columnSettings.visibility,
              order: columnSettings.order,
              onVisibilityChange: handleVisibilityChange,
              onOrderChange: handleOrderChange,
            },
            sideFilterPanel: {
              onApply: ({ changedFilters }) => {
                handleColumnFiltersChange(changedFilters);
              },
              onReset: ({ allFilters, changedFilters }) => {
                // eslint-disable-next-line no-console
                console.log('Server side filter reset:', {
                  allFilters,
                  changedFilters,
                });
                handleColumnFiltersChange(changedFilters);
              },
            },
          }}
          tableSize="md"
          useZebraStyles={false}
          emptyState={{
            title: 'No users found',
            subtitle: 'Try adjusting your search or filters',
          }}
          toolbar={[
            { type: 'filter' },
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
                    // Trigger data reload without changing pagination state
                    setIsLoading(true);
                    setTimeout(() => {
                      setIsLoading(false);
                    }, 0);
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
                  onClick: () => alert('Export settings'),
                },
                {
                  type: 'columnSettings',
                },
                {
                  label: 'Reset to defaults',
                  onClick: () => {
                    if (confirm('Reset all settings?')) {
                      setColumnSettings({ visibility: {}, order: [] });
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

export default ServerSideUserTable;
