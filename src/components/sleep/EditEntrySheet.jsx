import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { BeforeBedForm } from "./BeforeBedForm";
import { AfterWakingForm } from "./AfterWakingForm";
import { saveBeforeBed, saveAfterWaking } from "@/lib/sleep-fns";
import { formatDateLabel } from "@/lib/sleep-utils";
import { useI18n } from "@/i18n";

export function EditEntrySheet({ entry, open, onOpenChange }) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const saveBedFn = saveBeforeBed;
  const saveWakeFn = saveAfterWaking;

  const onSaved = async (fn, vars) => {
    setSaving(true);
    try {
      await fn({ data: vars });
      toast.success(t("Saved"));
      await router.invalidate();
      onOpenChange?.(false);
    } catch {
      toast.error(t("Could not save"));
    } finally {
      setSaving(false);
    }
  };

  const content = entry && (
    <Tabs defaultValue="before">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="before">{t("Before Bed")}</TabsTrigger>
        <TabsTrigger value="after">{t("After Waking")}</TabsTrigger>
      </TabsList>
      <TabsContent value="before" className="mt-4">
        <BeforeBedForm
          entry={entry}
          saving={saving}
          onSave={(d) => onSaved(saveBedFn, { id: entry.id, nightDate: entry.date, ...d })}
        />
      </TabsContent>
      <TabsContent value="after" className="mt-4">
        <AfterWakingForm
          entry={entry}
          saving={saving}
          onSave={(d) => onSaved(saveWakeFn, { id: entry.id, ...d })}
        />
      </TabsContent>
    </Tabs>
  );

  const title = entry ? formatDateLabel(entry.date) : t("Entry");

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-center">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{t("Edit both stages of this night.")}</DrawerDescription>
          </DrawerHeader>
          <div className="max-h-[72vh] overflow-y-auto px-4 pb-8">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("Edit both stages of this night.")}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[72vh] overflow-y-auto">{content}</div>
      </DialogContent>
    </Dialog>
  );
}