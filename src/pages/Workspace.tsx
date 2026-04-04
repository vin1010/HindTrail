import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import * as api from "../api";
import "./Workspace.css";

export default function Workspace() {
  const { user, logout, setActiveCompany } = useAuth();
  const { projects, loadWorkspaceData } = useData();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    openIssues: 0,
    pendingApprovals: 0,
    inProgressPkgs: 0,
    totalPackages: 0,
    closedPackages: 0,
    totalDocs: 0,
    packagesByStatus: {} as Record<string, number>,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.activeCompanyId) {
      setStatsLoading(true);
      loadWorkspaceData(user.activeCompanyId)
        .then((data) => {
          setStats(data.stats);
          setRecentActivity(data.recentActivity);
        })
        .finally(() => setStatsLoading(false));

      api.workspace.notifications(user.fullName)
        .then(setNotifications)
        .catch(() => {});
    }
  }, [user?.activeCompanyId]);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;
  const activeCompany = user.memberships.find((m) => m.id === user.activeCompanyId);
  const activeProjects = projects.filter((p) => p.status === "Active");

  return (
    <div className="ws-layout">
      <aside className="ws-sidebar">
        <div className="ws-logo" onClick={() => navigate("/workspace")}>HindTrail</div>
        <nav className="ws-nav">
          <a className="active" onClick={() => navigate("/workspace")}><span className="ws-nav-icon">&#9632;</span> Dashboard</a>
          <a onClick={() => navigate("/projects")}><span className="ws-nav-icon">&#9645;</span> Projects</a>
          <a onClick={() => navigate("/contractors")}><span className="ws-nav-icon">&#9829;</span> Contractors</a>
        </nav>
        <div className="ws-user">
          {user.memberships.length > 1 && (
            <div className="ws-company-switch">
              <label>Viewing as</label>
              <select value={user.activeCompanyId || ""} onChange={(e) => setActiveCompany(e.target.value)}>
                {user.memberships.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}
          <div className="ws-user-info">
            <div className="ws-avatar">{user.fullName.charAt(0)}</div>
            <div><strong>{user.fullName}</strong><span>{activeCompany?.name}</span></div>
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
          <div className="ws-notif-wrap" ref={notifRef}>
            <button className="ws-notif-btn" onClick={() => setShowNotifs((v) => !v)}>
              🔔
              {notifications.length > 0 && (
                <span className="ws-notif-badge">{notifications.length}</span>
              )}
            </button>
            {showNotifs && (
              <div className="ws-notif-dropdown">
                <div className="ws-notif-header">Pending Approvals</div>
                {notifications.length === 0 ? (
                  <div className="ws-notif-empty">All clear — no pending approvals</div>
                ) : (
                  notifications.map((n: any) => (
                    <div key={n.id} className="ws-notif-item"
                      onClick={() => { navigate(`/projects/${n.package?.projectId}/packages/${n.packageId}`); setShowNotifs(false); }}>
                      <div className="ws-notif-label">{n.objectLabel}</div>
                      <div className="ws-notif-meta">{n.package?.code} · Approver: {n.approver}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="ws-stats">
          {statsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ws-stat-card ws-stat-skeleton">
                <span className="ws-stat-value">—</span>
                <span className="ws-stat-label">Loading...</span>
              </div>
            ))
          ) : (
            <>
              <div className="ws-stat-card"><span className="ws-stat-value">{activeProjects.length}</span><span className="ws-stat-label">Active Projects</span></div>
              <div className="ws-stat-card"><span className="ws-stat-value">{stats.totalPackages}</span><span className="ws-stat-label">Total Packages</span></div>
              <div className="ws-stat-card"><span className="ws-stat-value">{stats.inProgressPkgs}</span><span className="ws-stat-label">Packages In Progress</span></div>
              <div className="ws-stat-card"><span className="ws-stat-value">{stats.closedPackages}</span><span className="ws-stat-label">Packages Closed</span></div>
              <div className="ws-stat-card ws-stat-warning"><span className="ws-stat-value">{stats.openIssues}</span><span className="ws-stat-label">Open Issues</span></div>
              <div className="ws-stat-card ws-stat-alert"><span className="ws-stat-value">{stats.pendingApprovals}</span><span className="ws-stat-label">Pending Approvals</span></div>
            </>
          )}
        </div>

        {!statsLoading && Object.keys(stats.packagesByStatus).length > 0 && (
          <section className="ws-section">
            <h2>Packages by Status</h2>
            <div className="ws-status-breakdown">
              {["Not Started", "In Progress", "Awaiting Approval", "Ready for Handover", "Closed"].map((s) => (
                <div key={s} className="ws-status-row">
                  <span className="ws-status-name">{s}</span>
                  <span className="ws-status-count">{stats.packagesByStatus[s] ?? 0}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="ws-section">
          <div className="ws-section-header">
            <h2>My Projects</h2>
            <button className="btn-ghost btn-sm" onClick={() => navigate("/projects")}>View all</button>
          </div>
          <div className="ws-projects-grid">
            {activeProjects.map((p) => (
              <div key={p.id} className="ws-project-card" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="ws-proj-top"><span className="ws-proj-code">{p.code}</span><span className="ws-proj-status">{p.status}</span></div>
                <h3>{p.name}</h3>
                <div className="ws-proj-meta"><span>{(p as any).clientName || (p as any).client}</span><span className="dot">&middot;</span><span>{p.location}</span></div>
              </div>
            ))}
            {activeProjects.length === 0 && <p className="proj-empty">No active projects yet. Create one from the Projects page.</p>}
          </div>
        </section>

        <section className="ws-section">
          <h2>Recent Activity</h2>
          <div className="ws-activity-list">
            {recentActivity.map((a: any) => (
              <div key={a.id} className="ws-activity-row">
                <div className="ws-activity-dot" />
                <div className="ws-activity-body">
                  <span><strong>{a.user}</strong><span className="ws-activity-company"> ({a.company})</span> &middot; {a.actionType}</span>
                  <span className="ws-activity-obj">{a.objectLabel}</span>
                  <span className="ws-activity-time">{typeof a.timestamp === "string" ? a.timestamp : new Date(a.timestamp).toLocaleString()}</span>
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
