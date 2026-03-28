import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Onboarding.css";

type OnboardingPath = "choose" | "create" | "independent";

export default function Onboarding() {
  const { user, createCompany, createIndependentProfile } = useAuth();
  const navigate = useNavigate();
  const [path, setPath] = useState<OnboardingPath>("choose");
  const [companyName, setCompanyName] = useState("");
  const [displayName, setDisplayName] = useState(user?.fullName || "");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCompany(companyName);
      navigate("/workspace");
    } finally { setLoading(false); }
  };

  const handleIndependent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createIndependentProfile(displayName);
      navigate("/workspace");
    } finally { setLoading(false); }
  };

  return (
    <div className="onboard-page">
      <div className="onboard-card">
        <div className="onboard-brand">
          <div className="onboard-logo">HindTrail</div>
          <h2>Welcome, {user?.fullName || "there"}!</h2>
          <p>Set up your workspace to get started</p>
        </div>

        {path === "choose" && (
          <div className="onboard-options">
            <button className="onboard-option" onClick={() => setPath("create")}>
              <div className="onboard-option-icon">+</div>
              <div><strong>Create a Company</strong><span>Set up a new company workspace</span></div>
            </button>
            <button className="onboard-option" onClick={() => setPath("independent")}>
              <div className="onboard-option-icon">&#9733;</div>
              <div><strong>Independent Profile</strong><span>I work independently across contractors</span></div>
            </button>
          </div>
        )}

        {path === "create" && (
          <form className="onboard-form" onSubmit={handleCreate}>
            <label>Company Name</label>
            <input className="onboard-input" placeholder="e.g. Roteq Engineering" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required autoFocus />
            <div className="onboard-actions">
              <button type="button" className="btn-ghost" onClick={() => setPath("choose")}>Back</button>
              <button type="submit" className="btn-primary" disabled={loading || !companyName.trim()}>
                {loading ? "Creating..." : "Create Company"}
              </button>
            </div>
          </form>
        )}

        {path === "independent" && (
          <form className="onboard-form" onSubmit={handleIndependent}>
            <label>Display Name</label>
            <input className="onboard-input" placeholder="e.g. Bharath Kumar" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required autoFocus />
            <p className="onboard-hint">Profile: <strong>{displayName || "Your Name"} (Independent)</strong></p>
            <div className="onboard-actions">
              <button type="button" className="btn-ghost" onClick={() => setPath("choose")}>Back</button>
              <button type="submit" className="btn-primary" disabled={loading || !displayName.trim()}>
                {loading ? "Creating..." : "Create Profile"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
