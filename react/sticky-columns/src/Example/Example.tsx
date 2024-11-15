import { Grid, Column } from '@carbon/react';
import { StickyColumns } from './StickyColumns';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <StickyColumns />
    </Column>
  </Grid>
);
