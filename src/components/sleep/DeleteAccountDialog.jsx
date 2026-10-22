import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { eraseAllData } from "@/lib/sleep-fns";

export function EraseDataDialog({ onDone }) {
  const router = useRouter();

  const confirm = async () => {
    eraseAllData();
    await router.invalidate();
    toast.success("All data erased");
    onDone?.();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 text-sm font-medium text-destructive">
          <Trash2 className="h-4 w-4" /> Erase all data
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Erase all data?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes every diary entry and reminder setting stored on this device. Export a backup first if you want to keep it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Erase everything
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}