import { Outlet, createRootRoute } from '@tanstack/react-router';
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary';
import { NotFound } from '@/components/NotFound';
import { Toaster } from '@/components/ui/sonner';
import OfflineSupport from '@/components/OfflineSupport';

export const Route = createRootRoute({
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <OfflineSupport />
      <Toaster />
    </>
  );
}
