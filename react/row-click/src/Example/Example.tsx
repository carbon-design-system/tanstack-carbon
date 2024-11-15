import { Grid, Column } from '@carbon/react';
import { RowClick } from './RowClick';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <RowClick />
    </Column>
  </Grid>
);
