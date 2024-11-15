import { Grid, Column } from '@carbon/react';
import { GlobalFilter } from './GlobalFilter';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <GlobalFilter />
    </Column>
  </Grid>
);
