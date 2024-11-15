import { Grid, Column } from '@carbon/react';
import { SortableColumns } from './SortableColumns';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <SortableColumns />
    </Column>
  </Grid>
);
