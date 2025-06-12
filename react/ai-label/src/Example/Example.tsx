import { Column, Grid } from '@carbon/react';
import { SortableWithAiLabel } from './SortableWithAiLabel';
import { ColumnWithAiLabel } from './ColumnWithAiLabel';
import { WithSelection } from './WithSelection';
import './example.scss';
import { FullTableAI } from './FullTableAi';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={8}>
      <ColumnWithAiLabel />
    </Column>
    <Column sm={4} md={8} lg={8}>
      <SortableWithAiLabel />
    </Column>
    <Column sm={4} md={8} lg={8}>
      <WithSelection />
    </Column>
    <Column sm={4} md={8} lg={8}>
      <FullTableAI />
    </Column>
  </Grid>
);
