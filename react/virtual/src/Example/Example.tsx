import { Grid, Column } from '@carbon/react';
import { Virtual } from './Virtual';

export const Example = () => {
  return (
    <Grid className="page-grid">
      <Column sm={4} md={8} lg={16}>
        <Virtual />
      </Column>
    </Grid>
  );
};
