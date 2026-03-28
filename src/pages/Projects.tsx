import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PROJECTS, type Project, type ProjectStatus } from "../data/mock";
import "./Projects.css";

const STATUS_COLORS: Record<ProjectStatus, string> = {
  Active: "status-active",
  Closed: "status-closed",
  "On Hold": "status-hold",
};

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <div className="proj-card" onClick={onClick}>
      <div className="proj-card-header">
        <div>
          <span className="proj-code">{project.code}</span>
          <h3 className="proj-name">{project.name}</h3>
        </div>
        <span className={`proj-status ${STATUS_COLORS[project.status]}`}>{project.status}</span>
      </div>
      <div className="proj-meta">
        <span>{project.client}</span>
        <span className="dot">&middot;</span>
        <span>{project.location}</span>
      </div>
      <p className="proj-desc">{project.description}</p>
      <div className="proj-dates">
        <span>{project.startDate}</span>
        <span>&rarr;</span>
        <span>{project.endDate}</span>
      </div>
    </div>
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);

  const activeCompany = user?.memberships.find((m) => m.id === user.activeCompanyId);

  const filtered = PROJECTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="projects-layout">
      <aside className="proj-sidebar">
        <div className="proj-logo" onClick={() => navigate("/workspace")}>HindTrail</div>
        <nav className="proj-nav">
          <a onClick={() => navigate("/workspace")}>
            <span className="ws-nav-icon">&#9632;</span> Dashboard
          </a>
          <a className="active">
            <span className="ws-nav-icon">&#9645;</span> Projects
          </a>
        </nav>
        <div className="proj-user">
          <div className="ws-user-info">
            <div className="ws-avatar">{user?.fullName.charAt(0)}</div>
            <div>
              <strong>{user?.fullName}</strong>
              <span>{activeCompany?.name}</span>
            </div>
          </div>
          <button className="ws-logout" onClick={() => { logout(); navigate("/login"); }}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="proj-main">
        <div className="proj-topbar">
          <div>
            <h1>Projects</h1>
            <p>{PROJECTS.length} projects accessible to you</p>
          </div>
          <button className="btn-primary" onClick={() => setShowNew(true)}>
            + New Project
          </button>
        </div>

        <input
          className="proj-search"
          placeholder="Search projects, clients, codes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="proj-grid">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} onClick={() => navigate(`/projects/${p.id}`)} />
          ))}
          {filtered.length === 0 && (
            <p className="proj-empty">No projects match your search.</p>
          )}
        </div>
      </main>

      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Project</h2>
            <div className="modal-fields">
              <label>Project Name<input placeholder="e.g. Refinery Turnaround 2026" /></label>
              <label>Project Code<input placeholder="e.g. RT-2026" /></label>
              <label>Client Name<input placeholder="e.g. SasolOil" /></label>
              <label>Location<input placeholder="e.g. Secunda, South Africa" /></label>
              <div className="modal-row">
                <label>Start Date<input type="date" /></label>
                <label>End Date<input type="date" /></label>
              </div>
              <label>Description<textarea rows={3} placeholder="Brief scope description..." /></label>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowNew(false)}>Create Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
