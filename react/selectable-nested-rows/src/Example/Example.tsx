import { Grid, Column } from '@carbon/react';
import { SelectableNestedRows } from './SelectableNestedRows';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <SelectableNestedRows />
    </Column>
  </Grid>
);
