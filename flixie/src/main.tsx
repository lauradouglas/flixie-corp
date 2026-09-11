import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { pageFromPath } from './site';
import './index.css';
import { loadView } from './views';

const root = document.getElementById('root')!;
const page = pageFromPath(window.location.pathname);
const year = Number(root.dataset.year) || new Date().getFullYear();
loadView(page).then(View => {
  const app = <StrictMode><App page={page} year={year} View={View} /></StrictMode>;
  if (root.dataset.prerendered === 'true') hydrateRoot(root, app);
  else createRoot(root).render(app);
});
