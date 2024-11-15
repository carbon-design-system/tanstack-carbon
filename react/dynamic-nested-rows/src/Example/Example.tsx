import { Grid, Column } from '@carbon/react';
import { DynamicNestedRows } from './DynamicNestedRows';
import './example.scss';

export const Example = () => {
  return (
    <Grid className="page-grid">
      <Column sm={4} md={8} lg={8}>
        <DynamicNestedRows />
      </Column>
    </Grid>
  );
};
