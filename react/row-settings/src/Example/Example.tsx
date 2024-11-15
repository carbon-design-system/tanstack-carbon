import { Grid, Column } from '@carbon/react';
import { RowSettings } from './RowSettings';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <RowSettings />
    </Column>
  </Grid>
);
