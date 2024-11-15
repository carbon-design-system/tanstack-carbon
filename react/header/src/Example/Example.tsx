import { Grid, Column } from '@carbon/react';
import { HeaderExamples } from './HeaderExamples';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={8}>
      <HeaderExamples />
    </Column>
  </Grid>
);
