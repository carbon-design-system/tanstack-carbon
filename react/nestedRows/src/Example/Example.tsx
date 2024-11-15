import { Grid, Column } from '@carbon/react';
import { NestedRows } from './NestedRows';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <NestedRows />
    </Column>
  </Grid>
);
