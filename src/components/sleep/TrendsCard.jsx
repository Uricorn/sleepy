import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { formatDateLabel } from "@/lib/sleep-utils";

export function TrendsCard({ entries = [] }) {
  const data = [...entries]
    .slice(0, 7)
    .map((e) => ({ name: formatDateLabel(e.date).replace(",", "").split(" ").slice(0, 2).join(" "), hours: e.estimated_total_sleep_hours ?? 0, quality: e.sleep_quality ?? 0 }));
  const avgHours = data.length ? data.reduce((s, d) => s + (d.hours || 0), 0) / data.length : 0;
  const avgQ = data.length ? data.reduce((s, d) => s + (d.quality || 0), 0) / data.length : 0;

  return (
    <div className="space-y-5 rounded-[1.25rem] border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-heading text-lg font-bold">Sleep trends</h3>
        <span className="text-sm text-muted-foreground">{data.length} nights</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-secondary p-3">
          <p className="text-xs text-muted-foreground">Avg hours</p>
          <p className="font-heading text-2xl font-bold text-[#818CF8]">{avgHours.toFixed(1)}h</p>
        </div>
        <div className="rounded-2xl bg-secondary p-3">
          <p className="text-xs text-muted-foreground">Avg quality</p>
          <p className="font-heading text-2xl font-bold text-[#34D399]">{avgQ ? avgQ.toFixed(1) : "—"}</p>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Sleep hours</p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 10]} />
              <Bar dataKey="hours" radius={[6, 6, 0, 0]} fill="#818CF8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Quality (1–5)</p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 5]} />
              <Bar dataKey="quality" radius={[6, 6, 0, 0]} fill="#34D399" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}