import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireSignedIn, AuthGateError } from "@/components/auth/AuthGate";
import { SleepLayout } from "@/components/sleep/Layout";
import { useReminders } from "@/hooks/useReminders";

export const Route = createFileRoute("/_authed")({
  ssr: false,
  beforeLoad: requireSignedIn,
  errorComponent: AuthGateError,
  component: AuthedLayout,
});

function AuthedLayout() {
  useReminders();
  return (
    <SleepLayout>
      <Outlet />
    </SleepLayout>
  );
}