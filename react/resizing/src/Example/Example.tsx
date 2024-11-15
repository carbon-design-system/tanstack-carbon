import { Grid, Column } from '@carbon/react';
import { ResizableCols } from './ResizableCols';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <ResizableCols />
    </Column>
  </Grid>
);
