import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import './i18n';
import { Example } from './Example.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Example />
  </StrictMode>
);
