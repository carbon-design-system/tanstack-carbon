import { useState } from 'react';
import { TanstackTable } from '@/lib';
import { TrashCan, Download } from '@carbon/icons-react';
import { Tag } from '@carbon/react';
import commonStyles from './scss/common.module.scss';

const STORAGE_KEY = 'playground_persistent_filters_state_v3';
const DEFAULT_STATE = {
  filters: [
    { id: 'department', value: 'Engineering' },
    { id: 'role', value: ['Admin', 'Viewer'] },
    { id: 'skill', value: ['React', 'Python'] },
    { id: 'accessLevel', value: 'Level 3' },
    { id: 'joinDate', value: { start: '2022-01-01', end: '2024-12-31' } },
  ],
  search: '',
  pagination: { pageIndex: 0, pageSize: 5 },
  sorting: [{ id: 'status', desc: false }],
};

// Sample data covering every side panel filter type
const data = [
  {
    id: '1',
    name: 'Alice Johnson',
    role: 'Admin',
    department: 'Engineering',
    status: 'Active',
    skill: 'React',
    accessLevel: 'Level 3',
    score: 95,
    projects: 12,
    joinDate: '2023-01-15',
    resignDate: '2024-01-15',
    loginTime: '09:00 AM',
  },
  {
    id: '2',
    name: 'Bob Smith',
    role: 'Editor',
    department: 'Marketing',
    status: 'Inactive',
    skill: 'Node.js',
    accessLevel: 'Level 1',
    score: 72,
    projects: 5,
    joinDate: '2023-03-22',
    resignDate: null,
    loginTime: '10:15 AM',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    role: 'Viewer',
    department: 'Engineering',
    status: 'Active',
    skill: 'Python',
    accessLevel: 'Level 1',
    score: 88,
    projects: 8,
    joinDate: '2022-11-05',
    resignDate: '2023-11-05',
    loginTime: '08:45 AM',
  },
  {
    id: '4',
    name: 'Diana Prince',
    role: 'Admin',
    department: 'Sales',
    status: 'Pending',
    skill: 'React',
    accessLevel: 'Level 3',
    score: 64,
    projects: 3,
    joinDate: '2024-02-10',
    resignDate: null,
    loginTime: '11:30 AM',
  },
  {
    id: '5',
    name: 'Evan Wright',
    role: 'Editor',
    department: 'Finance',
    status: 'Active',
    skill: 'SQL',
    accessLevel: 'Level 2',
    score: 91,
    projects: 15,
    joinDate: '2021-08-19',
    resignDate: '2022-08-19',
    loginTime: '09:15 AM',
  },
  {
    id: '6',
    name: 'Fiona Gallagher',
    role: 'Viewer',
    department: 'Engineering',
    status: 'Inactive',
    skill: 'Python',
    accessLevel: 'Level 1',
    score: 55,
    projects: 2,
    joinDate: '2024-05-01',
    resignDate: null,
    loginTime: '02:00 PM',
  },
  {
    id: '7',
    name: 'George Clark',
    role: 'Editor',
    department: 'Sales',
    status: 'Active',
    skill: 'Node.js',
    accessLevel: 'Level 2',
    score: 84,
    projects: 9,
    joinDate: '2023-09-12',
    resignDate: '2024-09-12',
    loginTime: '08:30 AM',
  },
  {
    id: '8',
    name: 'Hannah Abbott',
    role: 'Admin',
    department: 'Finance',
    status: 'Active',
    skill: 'SQL',
    accessLevel: 'Level 3',
    score: 98,
    projects: 20,
    joinDate: '2020-04-30',
    resignDate: null,
    loginTime: '09:45 AM',
  },
  {
    id: '9',
    name: 'Ian Malcolm',
    role: 'Viewer',
    department: 'Marketing',
    status: 'Pending',
    skill: 'React',
    accessLevel: 'Level 1',
    score: 79,
    projects: 6,
    joinDate: '2023-12-01',
    resignDate: '2024-12-01',
    loginTime: '01:15 PM',
  },
  {
    id: '10',
    name: 'Julia Roberts',
    role: 'Admin',
    department: 'Engineering',
    status: 'Active',
    skill: 'Python',
    accessLevel: 'Level 3',
    score: 93,
    projects: 14,
    joinDate: '2022-06-18',
    resignDate: null,
    loginTime: '09:05 AM',
  },
  {
    id: '11',
    name: 'Kevin Bacon',
    role: 'Editor',
    department: 'Finance',
    status: 'Inactive',
    skill: 'SQL',
    accessLevel: 'Level 2',
    score: 61,
    projects: 4,
    joinDate: '2024-01-11',
    resignDate: '2025-01-11',
    loginTime: '03:45 PM',
  },
  {
    id: '12',
    name: 'Laura Croft',
    role: 'Admin',
    department: 'Sales',
    status: 'Active',
    skill: 'React',
    accessLevel: 'Level 3',
    score: 89,
    projects: 11,
    joinDate: '2023-07-25',
    resignDate: null,
    loginTime: '08:50 AM',
  },
];

// Read once on mount. An empty filter array / empty search text are valid saved values (the user
// cleared them), so a default is only used for a part that has not been saved yet.
const getSavedState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        filters: Array.isArray(parsed.filters) ? parsed.filters : DEFAULT_STATE.filters,
        search: typeof parsed.search === 'string' ? parsed.search : DEFAULT_STATE.search,
        pagination: parsed.pagination ?? DEFAULT_STATE.pagination,
        sorting: Array.isArray(parsed.sorting) ? parsed.sorting : DEFAULT_STATE.sorting,
      };
    }
  } catch {
    // Fall back to the default state
  }
  return DEFAULT_STATE;
};

// Save full table state snapshot to storage
const saveState = (tableState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tableState));
  } catch {
    // Storage full or unavailable, the state just won't be restored next time
  }
};

const PersistentFilters = () => {
  const [savedState] = useState(getSavedState);

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      enableColumnFilter: true,
      meta: {
        filterVariant: 'text', // Text Search Filter
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      enableColumnFilter: true,
      meta: {
        filterVariant: 'checkbox', // Multi-Checkbox Filter (OR logic)
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      enableColumnFilter: true,
      meta: {
        filterVariant: 'select', // Dropdown Single Select Filter
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableColumnFilter: true,
      meta: {
        filterVariant: 'select', // Select with Badge
      },
      cell: (info) => {
        const value = info.getValue();
        const type = value === 'Active' ? 'green' : value === 'Pending' ? 'warm-gray' : 'red';
        return <Tag type={type}>{value}</Tag>;
      },
    },
    {
      accessorKey: 'skill',
      header: 'Skill',
      enableColumnFilter: true,
      meta: {
        filterVariant: 'multiselect', // Multi-Select Dropdown Filter
      },
    },
    {
      accessorKey: 'accessLevel',
      header: 'Access Level',
      enableColumnFilter: true,
      meta: {
        filterVariant: 'radio', // Radio Button Filter
      },
    },
    {
      accessorKey: 'score',
      header: 'Score',
      enableColumnFilter: true,
      meta: {
        filterVariant: 'slider', // Range Slider Filter
      },
    },
    {
      accessorKey: 'projects',
      header: 'Projects',
      enableColumnFilter: true,
      meta: {
        filterVariant: 'number', // Number Input Filter
      },
    },
    {
      accessorKey: 'joinDate',
      header: 'Join Date',
      enableColumnFilter: true,
      meta: {
        filterVariant: 'dateRange', // Date Range Picker Filter
        dateFormat: 'Y-m-d',
      },
    },
    {
      accessorKey: 'resignDate',
      header: 'Resign Date',
      enableColumnFilter: true,
      cell: ({ getValue }) => getValue() ?? '-',
      meta: {
        filterVariant: 'date', // Single Date Picker Filter
        dateFormat: 'Y-m-d',
      },
    },
    {
      accessorKey: 'loginTime',
      header: 'Login Time',
      enableColumnFilter: true,
      meta: {
        filterVariant: 'time', // Time Picker Filter
      },
    },
  ];

  const batchActions = [
    {
      label: 'Delete',
      icon: TrashCan,
      onClick: (selectedRows) => {
        alert(`Delete ${selectedRows.length} user(s)?`);
      },
    },
    {
      label: 'Export',
      icon: Download,
      onClick: (selectedRows) => {
        alert(`Exporting ${selectedRows.length} user(s)...`);
      },
    },
  ];

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Persistent Filters (All Types)</h2>
          <p className="example-description">
            Demonstrates all side panel filter variants working with state
            persistence: Text, Checkbox, Select, MultiSelect, Radio, Slider,
            Number, Date, Date Range, and Time. The search text, the sorting, the
            current page and the page size are persisted too. Apply any filters,
            search, change the page or the page size, reload the page, and
            everything is restored without having to click &quot;Apply&quot;
            again.
          </p>
        </div>
      </div>
      <div className={commonStyles.pageBody}>
        <TanstackTable
          data={data}
          columns={columns}
          toolbar={[{ type: 'filter' }, { type: 'search' }]}
          features={{
            selection: {
              type: 'checkbox',
              batchActions,
            },
            pagination: {
              pageSizeOptions: [5, 10, 20],
            },
            sideFilterPanel: true,
            statePersistence: {
              initialState: savedState,
              onStateChange: saveState,
            },
          }}
        />
      </div>
    </>
  );
};

export default PersistentFilters;
