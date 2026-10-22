import { createHashHistory, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary';
import { NotFound } from '@/components/NotFound';
import { createQueryClient } from '@/lib/query-client';

export const queryClient = createQueryClient();
export function getRouter() {
  return createRouter({
    routeTree,
    history: createHashHistory(),
    context: { queryClient },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    scrollRestoration: true,
  });
}
