import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL, USE_MOCK } from "@/services/apiClient";

export function Settings() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="font-[var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-ink)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Profile and connection settings for this workspace.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-ink-muted)]">Full name</label>
              <Input defaultValue={user?.name} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-ink-muted)]">Email</label>
              <Input defaultValue={user?.email} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-ink-muted)]">Role</label>
            <Input defaultValue={user?.role} disabled />
          </div>
          <Button size="sm">Save changes</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Backend connection</CardTitle></CardHeader>
        <CardBody className="space-y-2 text-sm">
          <p className="flex justify-between"><span className="text-[var(--color-ink-muted)]">API base URL</span><span className="num">{API_BASE_URL}</span></p>
          <p className="flex justify-between"><span className="text-[var(--color-ink-muted)]">Mock data mode</span><span className="num">{USE_MOCK ? "on" : "off"}</span></p>
          <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
            Configure these in <code className="rounded bg-[var(--color-surface-sunken)] px-1 py-0.5">.env</code> — set{" "}
            <code className="rounded bg-[var(--color-surface-sunken)] px-1 py-0.5">VITE_API_BASE_URL</code> to the ERP-CRM backend and{" "}
            <code className="rounded bg-[var(--color-surface-sunken)] px-1 py-0.5">VITE_USE_MOCK=false</code> once it's reachable.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
