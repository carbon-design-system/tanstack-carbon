import { Grid, Column } from '@carbon/react';
import { EditableCells } from './EditableCells';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <EditableCells />
    </Column>
  </Grid>
);
