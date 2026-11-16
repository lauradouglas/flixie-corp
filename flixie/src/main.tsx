import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { pageFromPath } from './site';
import './index.css';
import './web/styles.css';
import { loadView } from './views';

const root = document.getElementById('root')!;
const page = pageFromPath(window.location.pathname);
const year = Number(root.dataset.year) || new Date().getFullYear();
const typographyQa = import.meta.env.DEV
  ? import('./web/typographyQa').then(module => module.applyTypographyQa())
  : Promise.resolve();
Promise.all([loadView(page), typographyQa]).then(([View]) => {
  const app = <StrictMode><App page={page} year={year} View={View} /></StrictMode>;
  if (root.dataset.prerendered === 'true') hydrateRoot(root, app);
  else createRoot(root).render(app);
}).catch(() => {
  // Preserve prerendered public content when a view chunk cannot be downloaded.
  const boot = document.getElementById('flixie-boot');
  if (!boot) return;
  const status = boot.querySelector('[role="status"]');
  if (status) status.textContent = 'Flixie could not open. Check your connection and try again.';
  const retry = document.createElement('a');
  retry.href = window.location.href;
  retry.textContent = 'Try again';
  boot.append(retry);
});
