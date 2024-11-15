import { Grid, Column } from '@carbon/react';
import { PaginationExample } from './Pagination';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <PaginationExample />
    </Column>
  </Grid>
);
