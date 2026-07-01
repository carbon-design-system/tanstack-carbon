import { useMemo, useState } from 'react';
import { TanstackTable } from '@/lib';
import { TableSplit as TableIcon } from '@carbon/icons-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  RadioButtonGroup,
  RadioButton,
  CodeSnippet,
} from '@carbon/react';
import commonStyles from './scss/common.module.scss';
import styles from './scss/tableSizes.module.scss';

const ExampleTableSizes = () => {
  const [selectedSize, setSelectedSize] = useState('md');

  // Mock data
  const mockData = useMemo(
    () => [
      {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        department: 'Engineering',
        status: 'Active',
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        department: 'Marketing',
        status: 'Active',
      },
      {
        id: 'user-3',
        name: 'Bob Johnson',
        email: 'bob.j@example.com',
        department: 'Sales',
        status: 'Active',
      },
      {
        id: 'user-4',
        name: 'Alice Williams',
        email: 'alice.w@example.com',
        department: 'HR',
        status: 'Inactive',
      },
      {
        id: 'user-5',
        name: 'Charlie Brown',
        email: 'charlie.b@example.com',
        department: 'Finance',
        status: 'Active',
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
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        enableSorting: true,
      },
    ],
    []
  );

  return (
    <>
      <div className={commonStyles.pageHeader}>
        <div className="example-header">
          <h2 className="example-title">Table Size Variations</h2>
          <p className="example-description">
            The <code>tableSize</code> prop controls the row height and padding
            of the table. Choose a size below to see the difference between xs,
            sm, md, lg, and xl sizes.
          </p>
        </div>
      </div>

      <div className={commonStyles.pageBody}>
        <div className={styles.controlsSection}>
          <RadioButtonGroup
            legendText="Select table size"
            name="table-size"
            valueSelected={selectedSize}
            onChange={(value) => setSelectedSize(value)}
            orientation="horizontal">
            <RadioButton labelText="Extra Small (xs)" value="xs" id="size-xs" />
            <RadioButton labelText="Small (sm)" value="sm" id="size-sm" />
            <RadioButton labelText="Medium (md)" value="md" id="size-md" />
            <RadioButton labelText="Large (lg)" value="lg" id="size-lg" />
            <RadioButton labelText="Extra Large (xl)" value="xl" id="size-xl" />
          </RadioButtonGroup>

          <div className={styles.sizeInfoBox}>
            <p className={styles.sizeInfoText}>
              <strong>Current size:</strong> {selectedSize.toUpperCase()} -{' '}
              {selectedSize === 'xs' && 'Most compact, ideal for dense data'}
              {selectedSize === 'sm' && 'Compact, good for dashboards'}
              {selectedSize === 'md' && 'Default, balanced size'}
              {selectedSize === 'lg' && 'Spacious, easier to read'}
              {selectedSize === 'xl' && 'Most spacious, maximum readability'}
            </p>
          </div>
        </div>
        <TanstackTable
          data={mockData}
          columns={columns}
          tableSize={selectedSize}
          useZebraStyles={false}
          toolbar={[{ type: 'search' }]}
          features={{
            selection: {
              type: 'checkbox',
              batchActions: [
                {
                  label: 'Delete',
                  icon: () => null,
                  onClick: (selectedRows) => {
                    alert(`Delete ${selectedRows.length} users`);
                  },
                },
              ],
            },
          }}
        />

        <div className={styles.usageSection}>
          <h5 className={styles.usageTitle}>💡 Usage Example:</h5>
          <CodeSnippet type="multi" feedback="Copied to clipboard">
            {`<TanstackTable
  data={data}
  columns={columns}
  tableSize="${selectedSize}"  // xs, sm, md, lg, xl
/>`}
          </CodeSnippet>
        </div>
      </div>
    </>
  );
};

export default ExampleTableSizes;
