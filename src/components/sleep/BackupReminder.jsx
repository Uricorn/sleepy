import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { lastBackupAt } from "@/lib/sleep-fns";
import { DataDialog } from "./DataDialog";

const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;

export function BackupReminder({ hasEntries }) {
  const [due, setDue] = useState(false);
  useEffect(() => {
    const last = lastBackupAt();
    setDue(hasEntries && (!last || Date.now() - last > TWO_WEEKS));
  }, [hasEntries]);
  if (!due) return null;
  return (
    <section className="flex items-center gap-3 rounded-2xl border border-[#818CF8]/30 bg-[#818CF8]/10 p-4">
      <ShieldAlert className="h-5 w-5 shrink-0 text-[#818CF8]" />
      <p className="flex-1 text-sm">Your diary lives only on this device. Back it up so you don't lose it.</p>
      <DataDialog className="flex h-10 items-center rounded-full bg-[#818CF8] gap-2 px-4 text-sm font-semibold text-[#0C1017]" />
    </section>
  );
}