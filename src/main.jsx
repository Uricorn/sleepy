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
