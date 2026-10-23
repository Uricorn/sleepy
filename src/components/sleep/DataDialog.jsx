import { useEffect, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Database, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { exportData, importData, markBackedUp } from "@/lib/sleep-fns";
import { EraseDataDialog } from "./DeleteAccountDialog";
import { useI18n } from "@/i18n";

export function DataDialog({ className, iconOnly = false }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const fileRef = useRef(null);

  useEffect(() => {
    const onSaved = (event) => {
      if (event.detail?.success) {
        markBackedUp();
        toast.success(t("Backup saved"));
      } else {
        toast.info(t("Backup not saved"));
      }
    };
    window.addEventListener("sleepy-backup-result", onSaved);
    return () => window.removeEventListener("sleepy-backup-result", onSaved);
  }, []);

  const onExport = () => {
    const filename = `sleepy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    if (window.SleepyNative?.saveBackup) {
      window.SleepyNative.saveBackup(filename, exportData());
      return;
    }
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    markBackedUp();
    toast.success(t("Backup downloaded"));
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const n = importData(await file.text());
      await router.invalidate();
      toast.success(t("Imported {n} nights", { n }));
      setOpen(false);
    } catch (err) {
      toast.error(t(err.message || "Could not import file"));
    }
  };

  return (
    <>
      <button className={className} aria-label={t("Your data")} onClick={() => setOpen(true)}>
        <Database className="h-4 w-4" />
        {!iconOnly && <span>{t("Your data")}</span>}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Your data")}</DialogTitle>
            <DialogDescription>
              {t("Everything is stored only on this device — no account needed. Export a backup to keep it safe or move it to another device.")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <button onClick={onExport} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#818CF8] font-semibold text-[#0C1017]">
              <Download className="h-4 w-4" /> {t("Export data")}
            </button>
            <button onClick={() => fileRef.current?.click()} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-secondary font-semibold">
              <Upload className="h-4 w-4" /> {t("Import data")}
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
            <EraseDataDialog onDone={() => setOpen(false)} />
            <Link to="/privacy" onClick={() => setOpen(false)} className="block pt-1 text-center text-sm text-muted-foreground underline">
              {t("Privacy policy")}
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}