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

import { ColumnAlignment } from './ColumnAlignment';

import './index.scss';

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
      <Column sm={4} md={8} lg={16}>
        <ColumnAlignment />
      </Column>
    </Grid>
  </StrictMode>
);
