import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PROJECTS, WORK_PACKAGES, getChildren, type WorkPackage } from "../data/mock";
import "./ProjectDetail.css";

const STATUS_COLORS: Record<string, string> = {
  "Not Started": "pkg-grey",
  "In Progress": "pkg-blue",
  "Awaiting Approval": "pkg-yellow",
  "Ready for Handover": "pkg-green",
  Closed: "pkg-muted",
};

function TreeNode({
  pkg,
  level,
  selectedId,
  onSelect,
}: {
  pkg: WorkPackage;
  level: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const children = getChildren(WORK_PACKAGES, pkg.id, pkg.projectId);
  const hasChildren = children.length > 0;
  const isSelected = selectedId === pkg.id;

  return (
    <div className="tree-node" style={{ paddingLeft: level * 20 }}>
      <div
        className={`tree-node-row ${isSelected ? "tree-selected" : ""}`}
        onClick={() => onSelect(pkg.id)}
      >
        {hasChildren ? (
          <button
            className="tree-toggle"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="tree-toggle tree-leaf">–</span>
        )}
        <div className="tree-node-info">
          <span className="tree-code">{pkg.code}</span>
          <span className="tree-name">{pkg.name}</span>
        </div>
        <span className={`tree-status ${STATUS_COLORS[pkg.status]}`}>{pkg.status}</span>
      </div>
      {expanded && hasChildren && (
        <div className="tree-children">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              pkg={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [showNewPkg, setShowNewPkg] = useState(false);

  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) {
    return (
      <div className="pd-layout">
        <div className="pd-empty">
          <h2>Project not found</h2>
          <button className="btn-primary" onClick={() => navigate("/projects")}>Back to Projects</button>
        </div>
      </div>
    );
  }

  const rootPackages = getChildren(WORK_PACKAGES, null, project.id);
  const selected = WORK_PACKAGES.find((wp) => wp.id === selectedPkg);

  const activeCompany = user?.memberships.find((m) => m.id === user.activeCompanyId);

  return (
    <div className="pd-layout">
      {/* Sidebar */}
      <aside className="pd-sidebar">
        <div className="pd-logo" onClick={() => navigate("/workspace")}>HindTrail</div>

        <nav className="pd-nav">
          <a onClick={() => navigate("/workspace")}>
            <span className="ws-nav-icon">&#9632;</span> Dashboard
          </a>
          <a onClick={() => navigate("/projects")}>
            <span className="ws-nav-icon">&#9645;</span> Projects
          </a>
          <a className="active">
            <span className="ws-nav-icon">&#9659;</span> {project.code}
          </a>
        </nav>

        <div className="ws-user">
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

      {/* Tree panel */}
      <div className="pd-tree-panel">
        <div className="pd-tree-header">
          <div>
            <span className="pd-proj-code">{project.code}</span>
            <h2>{project.name}</h2>
            <div className="pd-proj-meta">
              <span>{project.client}</span>
              <span className="dot">&middot;</span>
              <span>{project.location}</span>
            </div>
          </div>
          <button className="btn-primary btn-sm" onClick={() => setShowNewPkg(true)}>
            + Package
          </button>
        </div>

        <div className="pd-tree-body">
          {rootPackages.length === 0 ? (
            <p className="pd-tree-empty">No work packages yet. Create one to get started.</p>
          ) : (
            rootPackages.map((pkg) => (
              <TreeNode
                key={pkg.id}
                pkg={pkg}
                level={0}
                selectedId={selectedPkg}
                onSelect={(id) => setSelectedPkg(id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="pd-detail-panel">
        {selected ? (
          <div className="pd-detail-content">
            <div className="pd-detail-header">
              <div>
                <span className="pd-pkg-code">{selected.code}</span>
                <h2>{selected.name}</h2>
                <span className={`tag ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
              </div>
              <button
                className="btn-primary btn-sm"
                onClick={() => navigate(`/projects/${projectId}/packages/${selected.id}`)}
              >
                Open Full View
              </button>
            </div>

            <div className="pd-detail-grid">
              <div className="pd-detail-row">
                <span className="pd-detail-label">Owner Company</span>
                <span>{selected.ownerCompany}</span>
              </div>
              <div className="pd-detail-row">
                <span className="pd-detail-label">Responsible</span>
                <span>{selected.responsible}</span>
              </div>
              <div className="pd-detail-row">
                <span className="pd-detail-label">Due Date</span>
                <span>{selected.dueDate}</span>
              </div>
              <div className="pd-detail-row pd-detail-full">
                <span className="pd-detail-label">Description</span>
                <p>{selected.description || "—"}</p>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ marginTop: 20 }}
              onClick={() => navigate(`/projects/${projectId}/packages/${selected.id}`)}
            >
              View Documents, Inspections, Issues &amp; More
            </button>
          </div>
        ) : (
          <div className="pd-detail-empty">
            <div className="pd-detail-empty-icon">&#9745;</div>
            <h3>Select a Work Package</h3>
            <p>Click on a package in the tree to view its details</p>
          </div>
        )}
      </div>

      {/* New Package Modal */}
      {showNewPkg && (
        <div className="modal-overlay" onClick={() => setShowNewPkg(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Work Package</h2>
            <div className="modal-fields">
              <label>Package Name<input placeholder="e.g. Mechanical Scope" /></label>
              <label>Package Code<input placeholder="e.g. MCA-MECH" /></label>
              <label>Parent Package
                <select>
                  <option value="">None (root level)</option>
                  {WORK_PACKAGES.filter((wp) => wp.projectId === projectId).map((wp) => (
                    <option key={wp.id} value={wp.id}>{wp.code} — {wp.name}</option>
                  ))}
                </select>
              </label>
              <label>Owner Company<input placeholder="e.g. Roteq Engineering" /></label>
              <label>Responsible Person<input placeholder="e.g. Sara Nkosi" /></label>
              <label>Due Date<input type="date" /></label>
              <label>Description<textarea rows={3} placeholder="Package scope..." /></label>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowNewPkg(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowNewPkg(false)}>Create Package</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
