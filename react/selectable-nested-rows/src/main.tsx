import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CodeSnippet,
  Header,
  HeaderContainer,
  HeaderName,
} from '@carbon/react';

import './index.scss';
import { Example } from './Example';

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
    <Example />
  </StrictMode>
);
