import { useState } from "react";
import { createFileRoute, useLoaderData, useRouter } from "@tanstack/react-router";
import { HistoryList } from "@/components/sleep/HistoryList";
import { EditEntrySheet } from "@/components/sleep/EditEntrySheet";
import { getHistory } from "@/lib/sleep-fns";

export const Route = createFileRoute("/_authed/history")({
  ssr: false,
  head: () => ({ meta: [{ title: "Lull · History" }] }),
  loader: () => getHistory(),
  component: HistoryPage,
});

function HistoryPage() {
  const entries = useLoaderData({ from: "/_authed/history" });
  const [editId, setEditId] = useState(null);
  const edit = entries.find((e) => e.id === editId) || null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Diary history</h1>
        <p className="text-sm text-muted-foreground">Tap any night to edit both stages.</p>
      </div>
      <HistoryList entries={entries} onEdit={(e) => setEditId(e.id)} />
      <EditEntrySheet entry={edit} open={!!edit} onOpenChange={(o) => !o && setEditId(null)} />
    </div>
  );
}