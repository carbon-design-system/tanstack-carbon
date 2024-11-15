import React, { useState } from 'react';
import { useDatagrid, Datagrid } from '@carbon/ibm-products';
import { makeData } from './makeData';

export const LegacyGrid = () => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Rule',
        accessor: 'rule',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      {
        Header: 'Other',
        accessor: 'other',
      },
      {
        Header: 'Example',
        accessor: 'example',
      },
    ],
    []
  );
  const [data] = useState(makeData(7));
  const rows = React.useMemo(() => data, [data]);

  const datagridState = useDatagrid({
    columns,
    data: rows,
    gridTitle: 'Legacy Datagrid',
    gridDescription: (
      <>
        This example demonstrates how to mix and match Datagrid and
        @tanstack/react-table@v8
      </>
    ),
  });

  return <Datagrid datagridState={datagridState} />;
};
