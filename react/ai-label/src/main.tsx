import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CodeSnippet,
  Column,
  Grid,
  Header,
  HeaderContainer,
  HeaderName,
} from '@carbon/react';

import { SortableWithAiLabel } from './SortableWithAiLabel';
import { ColumnWithAiLabel } from './ColumnWithAiLabel';

import './index.scss';
import { WithSelection } from './WithSelection';

const renderUIShellHeader = () => (
  <HeaderContainer
    render={() => (
      <Header aria-label="Tanstack Carbon DataTable">
        <HeaderName href="/" prefix="Carbon">
          DataTable /{' '}
          <CodeSnippet hideCopyButton type="inline">
            @tanstack/table
          </CodeSnippet>
          explorations
        </HeaderName>
      </Header>
    )}
  />
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {renderUIShellHeader()}
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
    </Grid>
  </StrictMode>
);
