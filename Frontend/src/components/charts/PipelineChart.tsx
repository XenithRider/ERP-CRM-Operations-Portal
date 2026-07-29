import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { formatCompactNumber } from "@/lib/format";

interface Props {
  data: { stage: string; value: number }[];
}

const COLORS = [
  "var(--color-ink-faint)",
  "var(--color-slate-500)",
  "var(--color-amber-500)",
  "var(--color-amber-600)",
  "var(--color-ledger-500)",
];

export function PipelineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }} tickFormatter={(v) => formatCompactNumber(v)} />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "var(--color-border)", fontSize: 12, fontFamily: "var(--font-sans)" }}
          formatter={(value) => formatCompactNumber(Number(value))}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
