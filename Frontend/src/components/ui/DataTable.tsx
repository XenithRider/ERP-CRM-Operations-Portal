import { type ReactNode, useMemo, useState } from "react";
import { cx } from "@/lib/format";
import { Search } from "lucide-react";
import { Input } from "./Input";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: "left" | "right";
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyLabel?: string;
}

export function DataTable<T>({
  columns,
  rows,
  searchPlaceholder = "Search…",
  searchFn,
  rowKey,
  onRowClick,
  emptyLabel = "No records found.",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const filtered = useMemo(() => {
    let result = rows;
    if (query && searchFn) {
      result = result.filter((r) => searchFn(r, query.toLowerCase()));
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sortValue) {
        result = [...result].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          if (av < bv) return -1 * sortDir;
          if (av > bv) return 1 * sortDir;
          return 0;
        });
      }
    }
    return result;
  }, [rows, query, sortKey, sortDir, searchFn, columns]);

  function toggleSort(col: Column<T>) {
    if (!col.sortValue) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(col.key);
      setSortDir(1);
    }
  }

  return (
    <div>
      {searchFn && (
        <div className="border-b border-[var(--color-border)] p-3">
          <div className="relative max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-ink-faint)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8"
            />
          </div>
        </div>
      )}
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col)}
                  style={{ width: col.width }}
                  className={cx(
                    "px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]",
                    col.align === "right" ? "text-right" : "text-left",
                    col.sortValue && "cursor-pointer select-none hover:text-[var(--color-ink)]"
                  )}
                >
                  {col.header}
                  {sortKey === col.key && (sortDir === 1 ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[var(--color-ink-faint)]">
                  {emptyLabel}
                </td>
              </tr>
            )}
            {filtered.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cx(
                  "border-b border-[var(--color-border)] last:border-0",
                  onRowClick && "cursor-pointer hover:bg-[var(--color-surface-sunken)]"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cx("px-4 py-3", col.align === "right" ? "text-right" : "text-left")}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
