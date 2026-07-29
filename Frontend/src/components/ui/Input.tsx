import type { InputHTMLAttributes } from "react";
import { cx } from "@/lib/format";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-ledger-500)]",
        className
      )}
      {...props}
    />
  );
}
