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

import { RowActions } from './RowActions';

import './index.scss';
import { RowWithContextMenu } from './RowWithContextMenu';

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
        <RowActions />
      </Column>
      <Column sm={4} md={8} lg={16}>
        <RowWithContextMenu />
      </Column>
    </Grid>
  </StrictMode>
);
