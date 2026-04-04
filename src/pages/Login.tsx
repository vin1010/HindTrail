import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleOAuth = async (provider: "google" | "microsoft") => {
    // MVP: simulate OAuth by prompting email
    const mockEmail = prompt("Enter your email (MVP mock OAuth):", "vindy@roteq.co.za");
    if (!mockEmail) return;
    try {
      setError("");
      const next = await login(provider, mockEmail);
      navigate(next === "onboarding" ? "/onboarding" : "/workspace");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      const next = await login("email", email);
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

        {!showEmail ? (
          <div className="login-methods">
            <button className="login-btn login-btn-google" onClick={() => handleOAuth("google")} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button className="login-btn login-btn-microsoft" onClick={() => handleOAuth("microsoft")} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
              </svg>
              Continue with Microsoft
            </button>
            <div className="login-divider"><span>or</span></div>
            <button className="login-btn login-btn-email" onClick={() => setShowEmail(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/>
              </svg>
              Continue with Email
            </button>
          </div>
        ) : (
          <form className="login-email-form" onSubmit={handleEmailSubmit}>
            <label className="login-field-label">Email address</label>
            <input type="email" className="login-input" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            <button type="submit" className="login-btn login-btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <button type="button" className="login-back" onClick={() => setShowEmail(false)}>
              Back to all sign-in options
            </button>
          </form>
        )}

        <div className="login-test-accounts">
          <div className="login-test-label">Test accounts</div>
          <div className="login-test-btns">
            <button
              className="login-test-btn"
              onClick={async () => {
                try { setError(""); const next = await login("email", "vindy@roteq.co.za"); navigate(next === "onboarding" ? "/onboarding" : "/workspace"); }
                catch (err: any) { setError(err.message || "Login failed"); }
              }}
              disabled={loading}
            >
              <span className="login-test-avatar" style={{ background: "#4f46e5" }}>V</span>
              <div>
                <div className="login-test-name">Vindy Sharma</div>
                <div className="login-test-role">Roteq Engineering · Contractor</div>
              </div>
            </button>
            <button
              className="login-test-btn"
              onClick={async () => {
                try { setError(""); const next = await login("email", "john@glencore.com"); navigate(next === "onboarding" ? "/onboarding" : "/workspace"); }
                catch (err: any) { setError(err.message || "Login failed"); }
              }}
              disabled={loading}
            >
              <span className="login-test-avatar" style={{ background: "#0891b2" }}>J</span>
              <div>
                <div className="login-test-name">John Smith</div>
                <div className="login-test-role">Glencore Ltd · Client</div>
              </div>
            </button>
          </div>
        </div>

        <div className="login-footer">
          <a href="#">Terms</a><span className="dot">&middot;</span><a href="#">Privacy</a>
        </div>
      </div>
    </div>
  );
}
