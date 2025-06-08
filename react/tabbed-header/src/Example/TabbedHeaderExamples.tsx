import { useState } from 'react';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';

import { createColumnHelper } from '@tanstack/react-table';
import { makeData } from './makeData';
import { ExampleTable } from './ExampleTable';

type Resource = {
  id: string;
  name: string;
  rule: string;
  status: string;
  other: string;
  example: string;
};

const columnHelper = createColumnHelper<Resource>();

const columns = [
  columnHelper.accessor((row) => row.name, {
    id: 'name',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Name</span>,
  }),
  columnHelper.accessor('rule', {
    header: () => 'Rule',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('status', {
    header: () => <span>Status</span>,
  }),
  columnHelper.accessor('other', {
    header: 'Other',
  }),
  columnHelper.accessor('example', {
    header: 'Example',
  }),
];

export const HeaderExamples = () => {
  const [table1Data] = useState(makeData(7));
  const [table2Data] = useState(makeData(7));
  const [table3Data] = useState(makeData(7));

  return (
    <>
      <Tabs>
        <TabList aria-label="List of tabs" contained>
          <Tab>Catalog assets</Tab>
          <Tab>Policies</Tab>
          <Tab>Rules</Tab>
        </TabList>
        <TabPanels>
          <TabPanel className="table-tab-panel">
            <ExampleTable data={table1Data} columns={columns} />
          </TabPanel>
          <TabPanel className="table-tab-panel">
            <ExampleTable data={table2Data} columns={columns} />
          </TabPanel>
          <TabPanel className="table-tab-panel">
            <ExampleTable data={table3Data} columns={columns} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
