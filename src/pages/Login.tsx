import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const TEST_ACCOUNTS = [
  { email: "asha.verma@cli-001.example", name: "Asha Verma", company: "Acme Mining Pty Ltd", role: "Client PM", color: "#0891b2" },
  { email: "ethan.miller@con-001.example", name: "Ethan Miller", company: "IronBuild Construction", role: "Contractor PM", color: "#4f46e5" },
  { email: "dylan.scott@sub-001.example", name: "Dylan Scott", company: "SkyScaff Services", role: "Sub Supervisor", color: "#059669" },
  { email: "wei.zhang@ssub-001.example", name: "Wei Zhang", company: "WeldRight Mobile Welding", role: "Sub-sub Supervisor", color: "#b45309" },
];

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (emailAddr: string) => {
    try {
      setError("");
      const next = await login("email", emailAddr);
      navigate(next === "onboarding" ? "/onboarding" : "/workspace");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  if (user) {
    navigate("/workspace");
    return null;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">HindTrail</div>
          <p className="login-tagline">Project execution across contractors</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="login-section-label">Sign in as</div>
        <div className="login-test-btns">
          {TEST_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              className="login-test-btn"
              onClick={() => handleLogin(acc.email)}
              disabled={loading}
            >
              <span className="login-test-avatar" style={{ background: acc.color }}>
                {acc.name.charAt(0)}
              </span>
              <div className="login-test-info">
                <div className="login-test-name">{acc.name}</div>
                <div className="login-test-role">{acc.company} · {acc.role}</div>
              </div>
              <span className="login-test-arrow">→</span>
            </button>
          ))}
        </div>

        <div className="login-divider"><span>or sign in with email</span></div>

        {!showEmail ? (
          <button className="login-btn login-btn-email" onClick={() => setShowEmail(true)}>
            Use your own email
          </button>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(email); }}>
            <input
              type="email"
              className="login-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <button type="submit" className="login-btn login-btn-primary" disabled={loading} style={{ marginTop: 10, width: "100%" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        <div className="login-footer">
          <a href="#">Terms</a><span className="dot">&middot;</span><a href="#">Privacy</a>
        </div>
      </div>
    </div>
  );
}
