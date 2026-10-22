import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { useAuth } from "@/lib/AuthContext";
import { deleteMyAccount } from "@/lib/sleep-fns";

export function DeleteAccountDialog({ className, iconOnly = false }) {
  const { logout } = useAuth();
  const deleteFn = useServerFn(deleteMyAccount);
  const [busy, setBusy] = useState(false);

  const confirm = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await deleteFn();
      await logout();
    } catch {
      toast.error("Could not delete your account");
      setBusy(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className={className} aria-label="Delete account">
          <Trash2 className="h-4 w-4" />
          {!iconOnly && <span>Delete account</span>}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes your account, all diary entries and reminder settings. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? "Deleting…" : "Delete everything"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}