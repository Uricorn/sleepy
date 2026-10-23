import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export function NotFound({ children }) {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-24 text-center">
      <p className="text-6xl font-semibold tracking-tight">404</p>
      <p className="text-muted-foreground">{children ?? t("The page you are looking for does not exist.")}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.history.back()}>
          {t("Go back")}
        </Button>
        <Button asChild>
          <Link to="/">{t("Start over")}</Link>
        </Button>
      </div>
    </div>
  );
}
