import { Grid, Column } from '@carbon/react';
import { FilterFlyout } from './FilterFlyout';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <FilterFlyout />
    </Column>
  </Grid>
);
