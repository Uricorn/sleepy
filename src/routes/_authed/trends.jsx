import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { TrendsCard } from "@/components/sleep/TrendsCard";
import { getTrends } from "@/lib/sleep-fns";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/_authed/trends")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sleepy · Trends" }] }),
  loader: () => getTrends(),
  component: TrendsPage,
});

function TrendsPage() {
  const entries = useLoaderData({ from: "/_authed/trends" });
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">{t("Sleep trends")}</h1>
        <p className="text-sm text-muted-foreground">{t("Your last 14 nights at a glance.")}</p>
      </div>
      <TrendsCard entries={entries} />
    </div>
  );
}