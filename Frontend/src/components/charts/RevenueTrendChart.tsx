import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";
import { formatCompactNumber } from "@/lib/format";

interface Props {
  data: { month: string; revenue: number; target: number }[];
}

export function RevenueTrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ledger-500)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--color-ledger-500)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--color-ink-muted)" }}
          tickFormatter={(v) => formatCompactNumber(v)}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            borderColor: "var(--color-border)",
            fontSize: 12,
            fontFamily: "var(--font-sans)",
          }}
          formatter={(value) => formatCompactNumber(Number(value))}
        />
        <Area type="monotone" dataKey="revenue" stroke="var(--color-ledger-500)" strokeWidth={2} fill="url(#revenueFill)" />
        <Line type="monotone" dataKey="target" stroke="var(--color-ink-faint)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
