import { Grid, Column } from '@carbon/react';
import { ResizableCols } from './ResizableCols';
import { LegacyGrid } from './LegacyGrid';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <ResizableCols />
    </Column>
    <Column sm={4} md={8} lg={16}>
      <LegacyGrid />
    </Column>
  </Grid>
);
