import { Grid, Column } from '@carbon/react';
import { RowExpansion } from './RowExpansion';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <RowExpansion />
    </Column>
  </Grid>
);
