import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import "./Workspace.css";

export default function Workspace() {
  const { user, logout, setActiveCompany } = useAuth();
  const { projects, packages, issues, approvals, activity } = useData();
  const navigate = useNavigate();

  if (!user) return null;

  const activeCompany = user.memberships.find((m) => m.id === user.activeCompanyId);

  // Compute live stats
  const activeProjects = projects.filter((p) => p.status === "Active");
  const openIssues = issues.filter((i) => i.status !== "Closed").length;
  const pendingApprovals = approvals.filter((a) => a.decision === "Pending").length;
  const inProgressPkgs = packages.filter((wp) => wp.status === "In Progress").length;
  const recentActivity = activity.slice(0, 8);

  return (
    <div className="ws-layout">
      <aside className="ws-sidebar">
        <div className="ws-logo" onClick={() => navigate("/workspace")}>HindTrail</div>
        <nav className="ws-nav">
          <a className="active" onClick={() => navigate("/workspace")}>
            <span className="ws-nav-icon">&#9632;</span> Dashboard
          </a>
          <a onClick={() => navigate("/projects")}>
            <span className="ws-nav-icon">&#9645;</span> Projects
          </a>
        </nav>
        <div className="ws-user">
          {user.memberships.length > 1 && (
            <div className="ws-company-switch">
              <label>Viewing as</label>
              <select value={user.activeCompanyId || ""} onChange={(e) => setActiveCompany(e.target.value)}>
                {user.memberships.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="ws-user-info">
            <div className="ws-avatar">{user.fullName.charAt(0)}</div>
            <div>
              <strong>{user.fullName}</strong>
              <span>{activeCompany?.name}</span>
            </div>
          </div>
          <button className="ws-logout" onClick={() => { logout(); navigate("/login"); }}>Sign out</button>
        </div>
      </aside>

      <main className="ws-main">
        <div className="ws-header">
          <div>
            <h1>Welcome back, {user.fullName}</h1>
            <p>{activeCompany?.name} &middot; {activeCompany?.role?.toUpperCase()}</p>
          </div>
        </div>

        <div className="ws-stats">
          <div className="ws-stat-card">
            <span className="ws-stat-value">{activeProjects.length}</span>
            <span className="ws-stat-label">Active Projects</span>
          </div>
          <div className="ws-stat-card">
            <span className="ws-stat-value">{inProgressPkgs}</span>
            <span className="ws-stat-label">Packages In Progress</span>
          </div>
          <div className="ws-stat-card ws-stat-warning">
            <span className="ws-stat-value">{openIssues}</span>
            <span className="ws-stat-label">Open Issues</span>
          </div>
          <div className="ws-stat-card ws-stat-alert">
            <span className="ws-stat-value">{pendingApprovals}</span>
            <span className="ws-stat-label">Pending Approvals</span>
          </div>
        </div>

        <section className="ws-section">
          <div className="ws-section-header">
            <h2>My Projects</h2>
            <button className="btn-ghost btn-sm" onClick={() => navigate("/projects")}>View all</button>
          </div>
          <div className="ws-projects-grid">
            {activeProjects.map((p) => (
              <div key={p.id} className="ws-project-card" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="ws-proj-top">
                  <span className="ws-proj-code">{p.code}</span>
                  <span className="ws-proj-status">{p.status}</span>
                </div>
                <h3>{p.name}</h3>
                <div className="ws-proj-meta">
                  <span>{p.client}</span>
                  <span className="dot">&middot;</span>
                  <span>{p.location}</span>
                </div>
              </div>
            ))}
            {activeProjects.length === 0 && <p className="proj-empty">No active projects yet.</p>}
          </div>
        </section>

        <section className="ws-section">
          <h2>Recent Activity</h2>
          <div className="ws-activity-list">
            {recentActivity.map((a) => (
              <div key={a.id} className="ws-activity-row">
                <div className="ws-activity-dot" />
                <div className="ws-activity-body">
                  <span>
                    <strong>{a.user}</strong>
                    <span className="ws-activity-company"> ({a.company})</span>
                    {" "}&middot; {a.actionType}
                  </span>
                  <span className="ws-activity-obj">{a.objectLabel}</span>
                  <span className="ws-activity-time">{a.timestamp}</span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && <p className="proj-empty">No activity yet.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
