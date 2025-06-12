import { Grid, Column } from '@carbon/react';
import { TabbedHeaderExamples } from './TabbedHeaderExamples';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={8}>
      <TabbedHeaderExamples />
    </Column>
  </Grid>
);
