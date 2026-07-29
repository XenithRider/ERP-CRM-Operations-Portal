import { useEffect, useState } from "react";
import { Plus, ShieldAlert, X, AlertCircle } from "lucide-react";
import { usersService } from "@/services/usersService";
import type { User } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/format";

export function Employees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SALES");
  
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const data = await usersService.list();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const newUser = await usersService.create({ name, email, password, role });
      setEmployees((prev) => [newUser, ...prev]);
      setModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("SALES");
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRoleChange(id: string | number, newRole: string) {
    if (id === user?.id) {
      alert("You cannot change your own role.");
      return;
    }
    
    // Optimistic UI update
    const previous = [...employees];
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, role: newRole } : e)));
    
    try {
      await usersService.updateRole(id, newRole);
    } catch (err: any) {
      alert(err.message || "Failed to update role");
      setEmployees(previous); // Revert on failure
    }
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-[var(--color-danger-500)]" />
        <h2 className="text-xl font-semibold text-[var(--color-ink)]">Access Denied</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">Only Administrators can view and manage employees.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold tracking-tight text-[var(--color-ink)]">Employees</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Manage users and roles ({employees.length} total).</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #6366f1, #4338ca)", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}
        >
          <Plus className="h-4 w-4" /> New Employee
        </button>
      </div>

      <div className="glass rounded-2xl inner-border overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
        {loading ? (
          <div className="space-y-3 p-6">{[...Array(3)].map((_, i) => <div key={i} className="h-12 shimmer rounded-xl" />)}</div>
        ) : employees.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p style={{ color: "var(--color-ink-muted)" }}>No employees found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Name", "Email", "Role", "Created", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-glass)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-5 py-3.5 text-[var(--color-ink)] font-medium">{emp.name}</td>
                  <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{emp.email}</td>
                  <td className="px-5 py-3.5">
                    <select
                      className="modal-input w-36 text-xs font-semibold uppercase"
                      value={emp.role}
                      onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                      disabled={emp.id === user?.id}
                      style={{
                        padding: "0.25rem 0.5rem",
                        height: "auto",
                        background: emp.id === user?.id ? "var(--color-surface-sunken)" : "var(--color-surface)"
                      }}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="SALES">Sales</option>
                      <option value="WAREHOUSE">Warehouse</option>
                      <option value="ACCOUNTS">Accounts</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[var(--color-ink-faint)]">
                    {/* @ts-ignore */}
                    {formatDate(emp.created_at || new Date())}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {emp.id === user?.id && <span className="badge" style={{ background: "var(--color-accent-100)", color: "var(--color-accent-400)" }}>You</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div
            className="glass slide-in w-full max-w-md rounded-2xl inner-border"
            style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}
          >
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
              <h2 className="font-[var(--font-display)] text-base font-semibold text-[var(--color-ink)]">Add Employee</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 text-[var(--color-ink-muted)]"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 p-6">
              <div>
                <label className="modal-label">Full Name</label>
                <input required type="text" className="modal-input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              
              <div>
                <label className="modal-label">Email Address</label>
                <input required type="email" className="modal-input" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div>
                <label className="modal-label">Initial Password</label>
                <input required type="password" minLength={6} className="modal-input" value={password} onChange={e => setPassword(e.target.value)} />
              </div>

              <div>
                <label className="modal-label">Role</label>
                <select className="modal-input" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="ADMIN">Admin</option>
                  <option value="SALES">Sales</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="ACCOUNTS">Accounts</option>
                </select>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border px-4 py-3" style={{ background: "var(--color-danger-100)", borderColor: "rgba(244,63,94,0.3)" }}>
                  <AlertCircle className="h-4 w-4 shrink-0 text-[var(--color-danger-500)]" />
                  <p className="text-sm text-[var(--color-danger-500)]">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-ink-muted)] bg-[var(--color-glass)]">Cancel</button>
                <button type="submit" disabled={submitting} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "linear-gradient(135deg, #6366f1, #4338ca)" }}>
                  {submitting ? "Adding..." : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
