import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { formatShortDate } from "@/lib/sleep-utils";
import { useI18n } from "@/i18n";

const tooltipProps = {
  cursor: { fill: "rgba(148,163,184,0.15)" },
  contentStyle: { background: "#161B26", border: "1px solid #2A3142", borderRadius: 12, fontSize: 12, color: "#E2E8F0" },
  labelStyle: { color: "#94A3B8" },
  itemStyle: { color: "#E2E8F0" },
};

export function TrendsCard({ entries = [] }) {
  const { t } = useI18n();
  const data = [...entries]
    .slice(0, 7)
    .map((e) => ({ name: formatShortDate(e.date), hours: e.estimated_total_sleep_hours ?? 0, quality: e.sleep_quality ?? 0 }));
  // Average only nights that actually have a value, so unlogged mornings don't pull it down.
  const average = (key) => {
    const values = data.map((d) => d[key]).filter((v) => v > 0);
    return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
  };
  const avgHours = average("hours");
  const avgQ = average("quality");

  return (
    <div className="space-y-5 rounded-[1.25rem] border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-heading text-lg font-bold">{t("Sleep trends")}</h3>
        <span className="text-sm text-muted-foreground">{data.length} {t("nights")}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-secondary p-3">
          <p className="text-xs text-muted-foreground">{t("Avg hours")}</p>
          <p className="font-heading text-2xl font-bold text-[#818CF8]">{avgHours.toFixed(1)}h</p>
        </div>
        <div className="rounded-2xl bg-secondary p-3">
          <p className="text-xs text-muted-foreground">{t("Avg quality")}</p>
          <p className="font-heading text-2xl font-bold text-[#34D399]">{avgQ ? avgQ.toFixed(1) : "—"}</p>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-muted-foreground">{t("Sleep hours")}</p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 10]} />
              <Tooltip {...tooltipProps} formatter={(v) => (v > 0 ? `${v} h` : "—")} separator="" />
              <Bar dataKey="hours" name="" radius={[6, 6, 0, 0]} fill="#818CF8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-muted-foreground">{t("Quality (1–5)")}</p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 5]} />
              <Tooltip {...tooltipProps} formatter={(v) => (v > 0 ? `${v}/5` : "—")} separator="" />
              <Bar dataKey="quality" name="" radius={[6, 6, 0, 0]} fill="#34D399" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}