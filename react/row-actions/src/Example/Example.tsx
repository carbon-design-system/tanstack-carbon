import { Grid, Column } from '@carbon/react';
import { RowActions } from './RowActions';
import { RowWithContextMenu } from './RowWithContextMenu';
import './example.scss';

export const Example = () => (
  <Grid className="page-grid">
    <Column sm={4} md={8} lg={16}>
      <RowActions />
    </Column>
    <Column sm={4} md={8} lg={16}>
      <RowWithContextMenu />
    </Column>
  </Grid>
);
