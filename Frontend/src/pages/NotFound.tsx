import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-[var(--font-display)] text-5xl font-semibold text-[var(--color-ledger-500)]">404</p>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">This page doesn't exist in the portal.</p>
      <Link to="/" className="mt-5">
        <Button size="sm">Back to dashboard</Button>
      </Link>
    </div>
  );
}
