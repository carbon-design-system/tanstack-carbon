import { Grid, Column } from '@carbon/react';
import { BatchActions } from './BatchActions';

export const Example = () => {
  return (
    <Grid className="page-grid">
      <Column sm={4} md={8} lg={16}>
        <BatchActions />
      </Column>
    </Grid>
  );
};
