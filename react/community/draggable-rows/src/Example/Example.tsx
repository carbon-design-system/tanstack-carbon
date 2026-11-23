import { Grid, Column } from '@carbon/react';
import { DraggableRows } from './DraggableRows';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <DraggableRows />
    </Column>
  </Grid>
);
