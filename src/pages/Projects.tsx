import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import type { Project, ProjectStatus } from "../data/mock";
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
  const { projects, addProject } = useData();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formClient, setFormClient] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const activeCompany = user?.memberships.find((m) => m.id === user.activeCompanyId);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormName(""); setFormCode(""); setFormClient("");
    setFormLocation(""); setFormStart(""); setFormEnd(""); setFormDesc("");
  };

  const handleCreate = () => {
    if (!formName.trim() || !formCode.trim()) return;
    const p = addProject({
      name: formName.trim(),
      code: formCode.trim(),
      client: formClient.trim() || "—",
      location: formLocation.trim() || "—",
      startDate: formStart || "—",
      endDate: formEnd || "—",
      status: "Active",
      description: formDesc.trim(),
    });
    resetForm();
    setShowNew(false);
    navigate(`/projects/${p.id}`);
  };

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
            <p>{projects.length} projects accessible to you</p>
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
        <div className="modal-overlay" onClick={() => { setShowNew(false); resetForm(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Project</h2>
            <div className="modal-fields">
              <label>Project Name *<input placeholder="e.g. Refinery Turnaround 2026" value={formName} onChange={(e) => setFormName(e.target.value)} required /></label>
              <label>Project Code *<input placeholder="e.g. RT-2026" value={formCode} onChange={(e) => setFormCode(e.target.value)} required /></label>
              <label>Client Name<input placeholder="e.g. SasolOil" value={formClient} onChange={(e) => setFormClient(e.target.value)} /></label>
              <label>Location<input placeholder="e.g. Secunda, South Africa" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} /></label>
              <div className="modal-row">
                <label>Start Date<input type="date" value={formStart} onChange={(e) => setFormStart(e.target.value)} /></label>
                <label>End Date<input type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} /></label>
              </div>
              <label>Description<textarea rows={3} placeholder="Brief scope description..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} /></label>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => { setShowNew(false); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate} disabled={!formName.trim() || !formCode.trim()}>Create Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
