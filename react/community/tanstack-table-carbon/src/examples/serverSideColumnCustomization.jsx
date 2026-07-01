import { useMemo, useState } from 'react';
import { TanstackTable } from '@/lib';
import {
  Add as AddIcon,
  Renew,
  TableSplit as TableIcon,
} from '@carbon/icons-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  CodeSnippet,
  InlineNotification,
  UnorderedList,
  ListItem,
} from '@carbon/react';
import commonStyles from './scss/common.module.scss';
import styles from './scss/serverSideColumnCustomization.module.scss';

const ExampleServerSideColumnCustomization = () => {
  const [saveStatus, setSaveStatus] = useState(null);

  // Mock data
  const mockData = useMemo(
    () => [
      {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        department: 'Engineering',
        status: 'Active',
        role: 'Developer',
        location: 'New York',
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        department: 'Marketing',
        status: 'Active',
        role: 'Manager',
        location: 'San Francisco',
      },
      {
        id: 'user-3',
        name: 'Bob Johnson',
        email: 'bob.j@example.com',
        department: 'Sales',
        status: 'Active',
        role: 'Sales Rep',
        location: 'Chicago',
      },
      {
        id: 'user-4',
        name: 'Alice Williams',
        email: 'alice.w@example.com',
        department: 'HR',
        status: 'Inactive',
        role: 'HR Specialist',
        location: 'Boston',
      },
      {
        id: 'user-5',
        name: 'Charlie Brown',
        email: 'charlie.b@example.com',
        department: 'Finance',
        status: 'Active',
        role: 'Accountant',
        location: 'Austin',
      },
    ],
    []
  );

  // Define columns
  const columns = useMemo(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        enableSorting: true,
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
        enableSorting: true,
      },
      {
        id: 'department',
        accessorKey: 'department',
        header: 'Department',
        enableSorting: true,
      },
      {
        id: 'role',
        accessorKey: 'role',
        header: 'Role',
        enableSorting: true,
      },
      {
        id: 'location',
        accessorKey: 'location',
        header: 'Location',
        enableSorting: true,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        enableSorting: true,
      },
    ],
    []
  );

  // Load user preferences from localStorage (simulating server)
  const [columnSettings, setColumnSettings] = useState(() => {
    const savedVisibility = localStorage.getItem('serverSideColumnVisibility');
    const savedOrder = localStorage.getItem('serverSideColumnOrder');
    return {
      visibility: savedVisibility ? JSON.parse(savedVisibility) : {},
      order: savedOrder ? JSON.parse(savedOrder) : [],
    };
  });

  // Simulate saving to server with delay
  const _saveToServer = async (key, value) => {
    setSaveStatus('saving');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    localStorage.setItem(key, JSON.stringify(value));
    // eslint-disable-next-line no-console
    console.log(`✅ Saved ${key} to server:`, value);

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleResetPreferences = () => {
    localStorage.removeItem('serverSideColumnVisibility');
    localStorage.removeItem('serverSideColumnOrder');
    setColumnSettings({ visibility: {}, order: [] });
    setSaveStatus('reset');
    setTimeout(() => setSaveStatus(null), 2000);
    // eslint-disable-next-line no-console
    console.log('🔄 Preferences reset!');
  };

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Server-Side Column Customization</h2>
          <p className="example-description">
            This example demonstrates <strong>controlled mode</strong> where the
            parent component manages column preferences and persists them to a
            server (simulated with localStorage).
          </p>
          <UnorderedList className={commonStyles.unorderedList}>
            <ListItem>
              <code>features.columnSettings</code> contains visibility and
              order, controlled by parent state
            </ListItem>
            <ListItem>
              Changes trigger <code>features.columnSettings</code> handlers that
              save to "server" (localStorage)
            </ListItem>
            <ListItem>Preferences persist across page refreshes</ListItem>
            <ListItem>Simulates 500ms network delay when saving</ListItem>
            <ListItem>Check browser console for save operations</ListItem>
          </UnorderedList>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        {saveStatus && (
          <InlineNotification
            kind={
              saveStatus === 'saving'
                ? 'info'
                : saveStatus === 'saved'
                ? 'success'
                : 'info'
            }
            title={
              saveStatus === 'saving'
                ? 'Saving preferences...'
                : saveStatus === 'saved'
                ? 'Preferences saved!'
                : 'Preferences reset!'
            }
            subtitle={
              saveStatus === 'saving'
                ? 'Syncing with server'
                : saveStatus === 'saved'
                ? 'Your column preferences have been saved'
                : 'Column preferences have been reset to defaults'
            }
            hideCloseButton
            lowContrast
            className={styles.notification}
          />
        )}

        <Button
          className={styles.resetToDefault}
          size="sm"
          kind="tertiary"
          renderIcon={Renew}
          onClick={handleResetPreferences}>
          Reset to Defaults
        </Button>

        <TanstackTable
          data={mockData}
          columns={columns}
          features={{
            selection: {
              type: 'checkbox',
              batchActions: [
                {
                  label: 'Delete',
                  icon: () => null,
                  onClick: (selectedRows) => {
                    // eslint-disable-next-line no-console
                    console.log('Delete selected:', selectedRows);
                    alert(`Delete ${selectedRows.length} users`);
                  },
                },
              ],
            },
            columnSettings,
          }}
          toolbar={[
            { type: 'search' },
            { type: 'settings', menuItems: [{ type: 'columnSettings' }] },
            {
              type: 'custom',
              element: (
                <Button renderIcon={AddIcon} onClick={() => alert('Add user')}>
                  Add User
                </Button>
              ),
            },
          ]}
        />

        <div className={styles.infoSection}>
          <h5 className={styles.infoTitle}>
            💡 How to Use in Real Application:
          </h5>
          <CodeSnippet type="multi" feedback="Copied to clipboard">
            {`1. Load preferences from server on mount
const [columnSettings, setColumnSettings] = useState(null);
useEffect(() => {
  fetchUserPreferences().then(prefs => {
    setColumnSettings({
      visibility: prefs.columnVisibility,
      order: prefs.columnOrder
    });
  });
}, []);

2. Pass controlled props
<TanstackTable
  columnSettings={columnSettings}
  onColumnSettingsChange={async (newSettings) => {
    await saveUserPreferences({
      columnVisibility: newSettings.visibility,
      columnOrder: newSettings.order
    });
    setColumnSettings(newSettings);
  }}
/>`}
          </CodeSnippet>
        </div>
      </div>
    </>
  );
};

export default ExampleServerSideColumnCustomization;
