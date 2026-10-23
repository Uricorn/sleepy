import { z } from "zod";
import { createFileRoute, useLoaderData, useRouter } from "@tanstack/react-router";
import { HistoryList } from "@/components/sleep/HistoryList";
import { EditEntrySheet } from "@/components/sleep/EditEntrySheet";
import { getHistory } from "@/lib/sleep-fns";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/_authed/history")({
  ssr: false,
  validateSearch: z.object({ edit: z.string().optional() }),
  head: () => ({ meta: [{ title: "Sleepy · History" }] }),
  loader: () => getHistory(),
  component: HistoryPage,
});

function HistoryPage() {
  const entries = useLoaderData({ from: "/_authed/history" });
  const { t } = useI18n();
  const { edit: editId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const setEditId = (id) => navigate({ search: { edit: id } });
  const edit = entries.find((e) => e.id === editId) || null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">{t("Diary history")}</h1>
        <p className="text-sm text-muted-foreground">{t("Tap any night to edit both stages.")}</p>
      </div>
      <HistoryList entries={entries} onEdit={(e) => setEditId(e.id)} />
      <EditEntrySheet entry={edit} open={!!edit} onOpenChange={(o) => !o && setEditId(undefined)} />
    </div>
  );
}