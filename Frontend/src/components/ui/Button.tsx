import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/format";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}

const VARIANT_CLASSES: Record<string, string> = {
  primary: "bg-[var(--color-ledger-500)] text-white hover:bg-[var(--color-ledger-600)]",
  secondary: "bg-[var(--color-surface)] border border-[var(--color-border-strong)] text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)]",
  ghost: "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]",
  danger: "bg-[var(--color-clay-500)] text-white hover:bg-[var(--color-clay-600)]",
};

const SIZE_CLASSES: Record<string, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2 text-sm",
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    />
  );
}
