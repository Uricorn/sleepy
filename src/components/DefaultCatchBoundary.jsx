import { ErrorComponent, Link, rootRouteId, useMatch, useRouter } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";

export function DefaultCatchBoundary({ error }) {
  const router = useRouter();
  const { t } = useI18n();
  const isRoot = useMatch({ strict: false, select: (state) => state.id === rootRouteId });

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-24">
      <ErrorComponent error={error} />
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.invalidate()}>
          {t("Try again")}
        </Button>
        <Button asChild>{isRoot ? <Link to="/">{t("Home")}</Link> : <Link to="/" onClick={(e) => { e.preventDefault(); window.history.back(); }}>{t("Go back")}</Link>}</Button>
      </div>
    </div>
  );
}
