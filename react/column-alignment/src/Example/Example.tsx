import { Column, Grid } from '@carbon/react';
import { ColumnAlignment } from './ColumnAlignment';
import './example.scss';

export const Example = () => {
  return (
    <Grid className="page-grid">
      <Column sm={4} md={8} lg={16}>
        <ColumnAlignment />
      </Column>
    </Grid>
  );
};
