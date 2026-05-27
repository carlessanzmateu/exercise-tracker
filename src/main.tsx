import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import { Bootstrap } from './Bootstrap';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// HashRouter: rutas en el fragmento (#/...) para que GitHub Pages sirva siempre
// index.html sin necesidad de fallback de servidor para SPA.
createRoot(rootElement).render(
  <StrictMode>
    <HashRouter>
      <Bootstrap />
    </HashRouter>
  </StrictMode>,
);
