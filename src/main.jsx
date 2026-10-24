import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { getRouter, queryClient } from './router';
import { I18nProvider } from './i18n';
import './index.css';

const router = getRouter();
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
    </I18nProvider>
  </React.StrictMode>,
);

// Keep the focused field visible when the on-screen keyboard opens.
const isField = (el) => el && el.matches && el.matches('input, textarea, select, [contenteditable="true"]');
const revealField = () => {
  const el = document.activeElement;
  if (isField(el)) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
};
document.addEventListener('focusin', (e) => {
  if (isField(e.target)) setTimeout(revealField, 350);
});
window.visualViewport?.addEventListener('resize', revealField);

// Expose the visible viewport height and keyboard inset as CSS variables.
const syncViewport = () => {
  const vv = window.visualViewport;
  if (!vv) return;
  const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
  const root = document.documentElement.style;
  root.setProperty('--vvh', `${vv.height}px`);
  root.setProperty('--kb', `${kb}px`);
};
window.visualViewport?.addEventListener('resize', syncViewport);
window.visualViewport?.addEventListener('scroll', syncViewport);
syncViewport();
