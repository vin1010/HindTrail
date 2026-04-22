import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./DemoSwitcher.css";

// Must match the demo accounts seeded by /admin/seed-demo on the backend.
const DEMO_ACCOUNTS = [
  { email: "asha.verma@cli-001.example",      name: "Asha Verma",    tier: "Client",      badge: "C",  color: "#0891b2" },
  { email: "ethan.miller@con-001.example",    name: "Ethan Miller",  tier: "Contractor",  badge: "1",  color: "#4f46e5" },
  { email: "dylan.scott@sub-001.example",     name: "Dylan Scott",   tier: "Subcontractor", badge: "2", color: "#059669" },
  { email: "wei.zhang@ssub-001.example",      name: "Wei Zhang",     tier: "Sub-sub",     badge: "3",  color: "#b45309" },
];

function isDemoEmail(email: string | undefined): boolean {
  if (!email) return false;
  return DEMO_ACCOUNTS.some((a) => a.email === email);
}

export default function DemoSwitcher() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  // Only show when the logged-in user is a demo account. Keeps the control
  // invisible in real production flows.
  if (!user || !isDemoEmail(user.email)) return null;

  const current = DEMO_ACCOUNTS.find((a) => a.email === user.email)!;

  const switchTo = async (email: string) => {
    if (email === user.email) { setOpen(false); return; }
    setSwitching(email);
    try {
      const acc = DEMO_ACCOUNTS.find((a) => a.email === email)!;
      // Clear prior session then re-login as the chosen account.
      logout();
      const next = await login("email", acc.email, acc.name);
      setOpen(false);
      // Stay on workspace for a clean demo landing; if they were on login
      // route it doesn't matter, login redirects.
      if (location.pathname === "/login" || location.pathname === "/onboarding") {
        navigate("/workspace", { replace: true });
      } else {
        navigate(next === "onboarding" ? "/onboarding" : "/workspace", { replace: true });
      }
    } catch {
      setSwitching(null);
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="demo-switcher">
      <button
        className="demo-switcher-trigger"
        onClick={() => setOpen(!open)}
        aria-label="Switch demo user"
      >
        <span className="demo-switcher-dot" style={{ background: current.color }}>
          {current.badge}
        </span>
        <div className="demo-switcher-label">
          <span className="demo-switcher-title">Viewing as {current.name}</span>
          <span className="demo-switcher-subtitle">{current.tier} · demo mode</span>
        </div>
        <span className="demo-switcher-chevron">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <>
          <div className="demo-switcher-scrim" onClick={() => setOpen(false)} />
          <div className="demo-switcher-menu">
            <div className="demo-switcher-menu-header">Switch demo perspective</div>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                className={`demo-switcher-item ${acc.email === user.email ? "demo-switcher-item-active" : ""}`}
                onClick={() => switchTo(acc.email)}
                disabled={switching !== null}
              >
                <span className="demo-switcher-dot" style={{ background: acc.color }}>
                  {acc.badge}
                </span>
                <div>
                  <div className="demo-switcher-item-name">{acc.name}</div>
                  <div className="demo-switcher-item-meta">{acc.tier}</div>
                </div>
                {switching === acc.email ? (
                  <span className="demo-switcher-loader">…</span>
                ) : acc.email === user.email ? (
                  <span className="demo-switcher-current">current</span>
                ) : null}
              </button>
            ))}
            <div className="demo-switcher-footer">
              Hot-swap between the four seeded demo accounts. Invisible in production.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
