import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("sumit.kulkarni@opsportal.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Couldn't sign in. Check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-ledger-500)] text-white">
            <Layers className="h-6 w-6" />
          </div>
          <h1 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">Operations Portal</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Sign in to your ERP/CRM workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-ink-muted)]">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-ink-muted)]">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Any value works in demo mode" />
          </div>
          {error && <p className="text-xs text-[var(--color-clay-600)]">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-xs text-[var(--color-ink-faint)]">
            Demo mode — any email/password combination signs you in with mock data.
          </p>
        </form>
      </div>
    </div>
  );
}
