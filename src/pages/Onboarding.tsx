import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Onboarding.css";

type OnboardingPath = "choose" | "join" | "create" | "independent";

export default function Onboarding() {
  const { user, joinCompany, createCompany, createIndependentProfile } = useAuth();
  const navigate = useNavigate();
  const [path, setPath] = useState<OnboardingPath>("choose");
  const [inviteCode, setInviteCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [displayName, setDisplayName] = useState(user?.fullName || "");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    joinCompany("Invited Company");
    navigate("/workspace");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCompany(companyName);
    navigate("/workspace");
  };

  const handleIndependent = (e: React.FormEvent) => {
    e.preventDefault();
    createIndependentProfile(displayName);
    navigate("/workspace");
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
            <button className="onboard-option" onClick={() => setPath("join")}>
              <div className="onboard-option-icon">+</div>
              <div>
                <strong>Join a Company</strong>
                <span>I have an invite code or link</span>
              </div>
            </button>

            <button className="onboard-option" onClick={() => setPath("create")}>
              <div className="onboard-option-icon">&#9878;</div>
              <div>
                <strong>Create a Company</strong>
                <span>Set up a new company workspace</span>
              </div>
            </button>

            <button className="onboard-option" onClick={() => setPath("independent")}>
              <div className="onboard-option-icon">&#9733;</div>
              <div>
                <strong>Independent Profile</strong>
                <span>I work independently across contractors</span>
              </div>
            </button>
          </div>
        )}

        {path === "join" && (
          <form className="onboard-form" onSubmit={handleJoin}>
            <label>Invite Code or Link</label>
            <input
              className="onboard-input"
              placeholder="Paste your invite code..."
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
              autoFocus
            />
            <div className="onboard-actions">
              <button type="button" className="btn-ghost" onClick={() => setPath("choose")}>Back</button>
              <button type="submit" className="btn-primary">Join Company</button>
            </div>
          </form>
        )}

        {path === "create" && (
          <form className="onboard-form" onSubmit={handleCreate}>
            <label>Company Name</label>
            <input
              className="onboard-input"
              placeholder="e.g. Roteq Engineering"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              autoFocus
            />
            <div className="onboard-actions">
              <button type="button" className="btn-ghost" onClick={() => setPath("choose")}>Back</button>
              <button type="submit" className="btn-primary">Create Company</button>
            </div>
          </form>
        )}

        {path === "independent" && (
          <form className="onboard-form" onSubmit={handleIndependent}>
            <label>Display Name</label>
            <input
              className="onboard-input"
              placeholder="e.g. Bharath Kumar"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoFocus
            />
            <p className="onboard-hint">
              This will create a profile: <strong>{displayName || "Your Name"} (Independent)</strong>
            </p>
            <div className="onboard-actions">
              <button type="button" className="btn-ghost" onClick={() => setPath("choose")}>Back</button>
              <button type="submit" className="btn-primary">Create Profile</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
