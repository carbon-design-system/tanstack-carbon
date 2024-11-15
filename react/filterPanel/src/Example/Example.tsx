import { Grid, Column } from '@carbon/react';
import { FilterPanel } from './FilterPanel';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <FilterPanel />
    </Column>
  </Grid>
);
