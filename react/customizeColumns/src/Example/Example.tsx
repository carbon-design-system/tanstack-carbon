import { Grid, Column } from '@carbon/react';
import { CustomizeColumns } from './CustomizeColumns';

export const Example = () => {
  return (
    <Grid className="page-grid">
      <Column sm={4} md={8} lg={16}>
        <CustomizeColumns />
      </Column>
    </Grid>
  );
};
