import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SleepLayout } from "@/components/sleep/Layout";
import { useReminders } from "@/hooks/useReminders";

// ssr: false — all data lives in this browser's localStorage.
export const Route = createFileRoute("/_authed")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  useReminders();
  return (
    <SleepLayout>
      <Outlet />
    </SleepLayout>
  );
}