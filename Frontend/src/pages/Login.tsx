import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-4"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.15) 0%, transparent 70%)",
      }}
    >
      <div className="w-full max-w-sm fade-in">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl inner-border"
            style={{
              background: "linear-gradient(135deg, #6366f1, #4338ca)",
              boxShadow: "0 0 30px rgba(99,102,241,0.4), 0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <Layers className="h-7 w-7 text-white" />
          </div>
          <h1
            className="font-[var(--font-display)] text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-ink)" }}
          >
            Ops Portal
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--color-ink-muted)" }}>
            Sign in to your ERP / CRM workspace
          </p>
        </div>

        {/* Form card */}
        <div
          className="glass rounded-2xl p-8"
          style={{
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--color-ink-muted)" }}
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full rounded-xl border px-4 py-3 text-sm transition-all"
                style={{
                  background: "var(--color-surface-sunken)",
                  borderColor: "var(--color-border-strong)",
                  color: "var(--color-ink)",
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--color-ink-muted)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border px-4 py-3 pr-11 text-sm transition-all"
                  style={{
                    background: "var(--color-surface-sunken)",
                    borderColor: "var(--color-border-strong)",
                    color: "var(--color-ink)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1"
                  style={{ color: "var(--color-ink-muted)" }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2.5 rounded-xl border px-4 py-3"
                style={{
                  background: "var(--color-danger-100)",
                  borderColor: "rgba(244,63,94,0.3)",
                }}
              >
                <AlertCircle className="h-4 w-4 shrink-0" style={{ color: "var(--color-danger-500)" }} />
                <p className="text-sm" style={{ color: "var(--color-danger-500)" }}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #6366f1, #4338ca)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        {/* Demo credentials hint */}
        <div
          className="mt-6 rounded-xl border p-4 text-xs"
          style={{
            background: "var(--color-accent-50)",
            borderColor: "var(--color-accent-100)",
            color: "var(--color-ink-muted)",
          }}
        >
          <p className="mb-2 font-semibold" style={{ color: "var(--color-accent-400)" }}>
            Demo credentials
          </p>
          <div className="space-y-1">
            <p><span className="font-medium" style={{ color: "var(--color-ink)" }}>Admin:</span> admin@example.com</p>
            <p><span className="font-medium" style={{ color: "var(--color-ink)" }}>Sales:</span> sales@example.com</p>
            <p><span className="font-medium" style={{ color: "var(--color-ink)" }}>Password:</span> Password123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
