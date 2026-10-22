import { Link } from "@tanstack/react-router";
import { Moon, BookOpen, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

const NAV = [
  { to: "/", label: "Tonight", icon: Moon },
  { to: "/history", label: "History", icon: BookOpen },
  { to: "/trends", label: "Trends", icon: BarChart3 },
];

export function SleepLayout({ children }) {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  const initial = (user?.full_name || user?.email || "?").slice(0, 1).toUpperCase();

  if (isMobile) {
    return (
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <header
          className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <Link to="/" className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-[#818CF8]" />
            <span className="font-heading text-lg font-extrabold tracking-tight">Lull</span>
          </Link>
          <div className="flex items-center">
            <DeleteAccountDialog iconOnly className="p-3 text-muted-foreground hover:text-destructive" />
            <button onClick={logout} className="p-3 text-muted-foreground hover:text-foreground" aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom,16px))]">{children}</main>
        <nav
          className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-border bg-card/95 backdrop-blur"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
        >
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-1 py-2.5 text-muted-foreground"
              activeProps={{ className: "text-[#818CF8]" }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="flex w-[300px] shrink-0 flex-col border-r border-border bg-card p-6">
        <Link to="/" className="mb-10 flex items-center gap-2">
          <Moon className="h-6 w-6 text-[#818CF8]" />
          <span className="font-heading text-2xl font-extrabold tracking-tight">Lull</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex h-12 items-center gap-3 rounded-xl px-4 text-muted-foreground hover:bg-secondary"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#818CF8]/20 text-sm font-semibold text-[#818CF8]">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.full_name || "Sleeper"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
          <DeleteAccountDialog className="mt-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive" />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}