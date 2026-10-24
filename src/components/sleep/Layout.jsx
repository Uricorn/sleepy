import { useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Moon, BookOpen, BarChart3, MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DataDialog } from "./DataDialog";
import { useI18n } from "@/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const NAV = [
  { to: "/", label: "Tonight", icon: Moon },
  { to: "/history", label: "History", icon: BookOpen },
  { to: "/trends", label: "Trends", icon: BarChart3 },
];

export function SleepLayout({ children }) {
  const isMobile = useIsMobile();
  const { t } = useI18n();
  const items = [...NAV, { to: "/chat", label: "Assistant", icon: MessageCircle }];
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    const current = items.find((i) => i.to === pathname);
    if (current) document.title = `Sleepy · ${t(current.label)}`;
  }, [pathname, t]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isMobile) {
    return (
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <header
          className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur"
          style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 2rem)" }}
        >
          <Link to="/" className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-[#818CF8]" />
            <span className="font-heading text-lg font-extrabold tracking-tight">Sleepy</span>
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSwitcher iconOnly className="p-3 text-muted-foreground hover:text-foreground" />
            <DataDialog iconOnly className="p-3 text-muted-foreground hover:text-foreground" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom,16px))]">{children}</main>
        <nav
          aria-label={t("Main")}
          className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border bg-card/95 backdrop-blur"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
        >
          {items.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-1 py-2.5 text-muted-foreground"
              activeProps={{ className: "text-[#818CF8]" }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-medium">{t(label)}</span>
            </Link>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="flex w-[300px] shrink-0 flex-col border-e border-border bg-card p-6">
        <Link to="/" className="mb-10 flex items-center gap-2">
          <Moon className="h-6 w-6 text-[#818CF8]" />
          <span className="font-heading text-2xl font-extrabold tracking-tight">Sleepy</span>
        </Link>
        <nav aria-label={t("Main")} className="flex flex-col gap-1">
          {items.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex h-12 items-center gap-3 rounded-xl px-4 text-muted-foreground hover:bg-secondary"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{t(label)}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-6">
          <p className="mb-3 text-xs text-muted-foreground">{t("Stored only on this device.")}</p>
          <LanguageSwitcher className="mb-3" />
          <DataDialog className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}