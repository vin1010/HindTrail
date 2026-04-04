import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import type { WorkPackage } from "../data/mock";
import "./ProjectDetail.css";

const STATUS_COLORS: Record<string, string> = {
  "Not Started": "pkg-grey",
  "In Progress": "pkg-blue",
  "Awaiting Approval": "pkg-yellow",
  "Ready for Handover": "pkg-green",
  Closed: "pkg-muted",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  "In Progress": "#059669",
  "Awaiting Approval": "#d97706",
  "Ready for Handover": "#059669",
  "Not Started": "#9ca3af",
  "Closed": "#6b7280",
};

const COMPANY_COLORS = [
  "#4f46e5", "#0891b2", "#059669", "#d97706", "#dc2626",
  "#7c3aed", "#db2777", "#065f46", "#92400e", "#1e40af",
];

function getCompanyColor(_name: string, index: number): string {
  return COMPANY_COLORS[index % COMPANY_COLORS.length];
}

function NodeCard({
  pkg, projectLocation, selectedId, onSelect, onAddSub, getChildren,
}: {
  pkg: WorkPackage;
  projectLocation: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddSub: (parentId: string) => void;
  getChildren: (parentId: string | null, projectId: string) => WorkPackage[];
}) {
  const [expanded, setExpanded] = useState(true);
  const children = getChildren(pkg.id, pkg.projectId);
  const isSelected = selectedId === pkg.id;
  const dotColor = STATUS_DOT_COLORS[pkg.status] ?? "#9ca3af";

  return (
    <div className="node-card-wrapper">
      <div
        className={`node-card ${isSelected ? "node-card-selected" : ""}`}
        onClick={() => onSelect(pkg.id)}
      >
        <div className="node-card-header">
          <div className="node-card-title">
            <span className="node-card-code">{pkg.code}</span>
            <span className="node-card-name">{pkg.name}</span>
          </div>
          {children.length > 0 && (
            <button
              className="node-expand-btn"
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            >
              {expanded ? "▾" : "▸"}
            </button>
          )}
        </div>

        <div className="node-card-status-row">
          <span className="node-status-dot" style={{ background: dotColor }} />
          <span className="node-status-text">{pkg.status}</span>
          {pkg.responsible && (
            <span className="node-card-meta">{pkg.responsible}</span>
          )}
          {pkg.dueDate && (
            <span className="node-card-meta node-card-due">Due {pkg.dueDate}</span>
          )}
        </div>

        {pkg.ownerCompany && (
          <div className="node-card-company">{pkg.ownerCompany}</div>
        )}

        {projectLocation && (
          <div className="node-card-location">
            <span className="node-location-icon">📍</span>
            {projectLocation}
          </div>
        )}

        <div className="node-card-footer">
          <div className="node-card-people">
            <span className="node-people-icon">👤</span>
            <span className="node-people-count">–</span>
          </div>
          <button
            className="node-add-sub-btn"
            onClick={(e) => { e.stopPropagation(); onAddSub(pkg.id); }}
          >
            + Add Subcontractor
          </button>
        </div>
      </div>

      {expanded && children.length > 0 && (
        <div className="node-children">
          {children.map((child) => (
            <NodeCard
              key={child.id}
              pkg={child}
              projectLocation={projectLocation}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddSub={onAddSub}
              getChildren={getChildren}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamsOverview({
  project, packages,
}: {
  project: any; packages: WorkPackage[];
}) {
  const rootPkgs = packages.filter((p) => !p.parentId);
  const primeContractors = [...new Set(rootPkgs.map((p) => p.ownerCompany))].filter(Boolean);

  // Find subcontractors: companies that own child packages but not root packages
  const childPkgs = packages.filter((p) => p.parentId);
  const subContractors = [...new Set(childPkgs.map((p) => p.ownerCompany))].filter(
    (c) => !primeContractors.includes(c) && Boolean(c)
  );

  const totalPkgs = packages.length;
  const openPkgs = packages.filter((p) => p.status !== "Closed").length;

  return (
    <div className="teams-overview">
      <div className="teams-header">
        <h3>Project Teams</h3>
        <p>{project.name}</p>
      </div>

      <div className="teams-stats">
        <div className="teams-stat">
          <span className="teams-stat-value">{totalPkgs}</span>
          <span className="teams-stat-label">Total Packages</span>
        </div>
        <div className="teams-stat">
          <span className="teams-stat-value">{openPkgs}</span>
          <span className="teams-stat-label">Active</span>
        </div>
        <div className="teams-stat">
          <span className="teams-stat-value">{primeContractors.length + subContractors.length}</span>
          <span className="teams-stat-label">Companies</span>
        </div>
      </div>

      <div className="teams-hierarchy">
        {/* Client */}
        <div className="teams-row teams-row-client">
          <div className="teams-role-label">Client</div>
          <div className="teams-company-card teams-client">
            <div className="teams-company-icon">C</div>
            <div>
              <div className="teams-company-name">{project.client || project.clientName}</div>
              <div className="teams-company-meta">Project Owner</div>
            </div>
          </div>
        </div>

        {/* Connector */}
        {primeContractors.length > 0 && (
          <div className="teams-connector">
            <div className="teams-connector-line" />
            <div className="teams-connector-label">contracted to</div>
            <div className="teams-connector-line" />
          </div>
        )}

        {/* Prime Contractors */}
        {primeContractors.length > 0 && (
          <div className="teams-row">
            <div className="teams-role-label">Prime Contractors</div>
            <div className="teams-company-list">
              {primeContractors.map((name, idx) => {
                const pkgs = rootPkgs.filter((p) => p.ownerCompany === name);
                return (
                  <div key={name} className="teams-company-card" style={{ borderLeftColor: getCompanyColor(name, idx) }}>
                    <div className="teams-company-icon" style={{ background: getCompanyColor(name, idx) }}>
                      {name.charAt(0)}
                    </div>
                    <div>
                      <div className="teams-company-name">{name}</div>
                      <div className="teams-company-meta">{pkgs.length} package{pkgs.length !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Subcontractors */}
        {subContractors.length > 0 && (
          <>
            <div className="teams-connector">
              <div className="teams-connector-line" />
              <div className="teams-connector-label">subcontracted to</div>
              <div className="teams-connector-line" />
            </div>
            <div className="teams-row">
              <div className="teams-role-label">Subcontractors</div>
              <div className="teams-company-list">
                {subContractors.map((name) => {
                  const pkgs = childPkgs.filter((p) => p.ownerCompany === name);
                  return (
                    <div key={name} className="teams-company-card teams-subcontractor">
                      <div className="teams-company-icon teams-sub-icon">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <div className="teams-company-name">{name}</div>
                        <div className="teams-company-meta">{pkgs.length} sub-package{pkgs.length !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <p className="teams-hint">Select a work package from the left panel to view its details.</p>
    </div>
  );
}

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { projects, packages, addPackage, getChildren, loadProjects, loadPackages } = useData();
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [showNewPkg, setShowNewPkg] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"tree" | "detail">("tree");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [groupsInitialised, setGroupsInitialised] = useState(false);

  useEffect(() => {
    loadProjects();
    if (projectId) loadPackages(projectId);
  }, [projectId]);

  // Once packages load, collapse groups by default if there are more than 2 contractors
  useEffect(() => {
    if (groupsInitialised || packages.filter((p) => p.projectId === projectId && !p.parentId).length === 0) return;
    const roots = packages.filter((p) => p.projectId === projectId && !p.parentId);
    const companies = [...new Set(roots.map((p) => p.ownerCompany || "Unassigned"))];
    if (companies.length > 2) {
      setCollapsedGroups(new Set(companies));
    }
    setGroupsInitialised(true);
  }, [packages]);

  // Form state
  const [fName, setFName] = useState("");
  const [fCode, setFCode] = useState("");
  const [fParent, setFParent] = useState("");
  const [fOwner, setFOwner] = useState("");
  const [fResp, setFResp] = useState("");
  const [fDue, setFDue] = useState("");
  const [fDesc, setFDesc] = useState("");

  const project = projects.find((p) => p.id === projectId);
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

  const rootPackages = getChildren(null, project.id);
  const selected = packages.find((wp) => wp.id === selectedPkg);
  const activeCompany = user?.memberships.find((m) => m.id === user.activeCompanyId);
  const projectPackages = packages.filter((wp) => wp.projectId === projectId);

  // Group root packages by ownerCompany
  const contractorGroups: { company: string; color: string; packages: WorkPackage[] }[] = [];
  const seen = new Map<string, number>();
  rootPackages.forEach((pkg) => {
    const company = pkg.ownerCompany || "Unassigned";
    if (!seen.has(company)) {
      seen.set(company, contractorGroups.length);
      contractorGroups.push({ company, color: getCompanyColor(company, contractorGroups.length), packages: [] });
    }
    contractorGroups[seen.get(company)!].packages.push(pkg);
  });

  const toggleGroup = (company: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(company)) next.delete(company);
      else next.add(company);
      return next;
    });
  };

  const resetForm = () => {
    setFName(""); setFCode(""); setFParent(""); setFOwner(""); setFResp(""); setFDue(""); setFDesc("");
  };

  const handleCreatePkg = async () => {
    if (!fName.trim() || !fCode.trim()) return;
    const newPkg = await addPackage({
      projectId: project.id,
      parentId: fParent || null,
      name: fName.trim(),
      code: fCode.trim(),
      ownerCompany: fOwner.trim() || activeCompany?.name || "—",
      responsible: fResp.trim() || "—",
      dueDate: fDue || "—",
      status: "Not Started",
      description: fDesc.trim(),
    });
    resetForm();
    setShowNewPkg(false);
    setSelectedPkg(newPkg.id);
  };

  return (
    <div className="pd-layout">
      <aside className="pd-sidebar">
        <div className="pd-logo" onClick={() => navigate("/workspace")}>HindTrail</div>
        <nav className="pd-nav">
          <a onClick={() => navigate("/workspace")}><span className="ws-nav-icon">&#9632;</span> Dashboard</a>
          <a onClick={() => navigate("/projects")}><span className="ws-nav-icon">&#9645;</span> Projects</a>
          <a className="active"><span className="ws-nav-icon">&#9659;</span> {project.code}</a>
        </nav>
        <div className="ws-user">
          <div className="ws-user-info">
            <div className="ws-avatar">{user?.fullName.charAt(0)}</div>
            <div>
              <strong>{user?.fullName}</strong>
              <span>{activeCompany?.name}</span>
            </div>
          </div>
          <button className="ws-logout" onClick={() => { logout(); navigate("/login"); }}>Sign out</button>
        </div>
      </aside>

      <div className={`pd-tree-panel${mobilePanel === "detail" ? " pd-mobile-hidden" : ""}`}>
        <div className="pd-tree-header">
          <div>
            <span className="pd-proj-code">{project.code}</span>
            <h2>{project.name}</h2>
            <div className="pd-proj-meta">
              <span className="pd-client-badge">Client: {project.client || (project as any).clientName}</span>
              <span className="dot">&middot;</span>
              <span>{project.location}</span>
            </div>
          </div>
          <button className="btn-primary btn-sm" onClick={() => setShowNewPkg(true)}>+ Package</button>
        </div>
        <div className="pd-tree-body">
          {rootPackages.length === 0 ? (
            <p className="pd-tree-empty">No work packages yet.</p>
          ) : (
            contractorGroups.map((group) => {
              const isCollapsed = collapsedGroups.has(group.company);
              const inProgressCount = group.packages.filter((p) => p.status === "In Progress").length;
              const awaitingCount = group.packages.filter((p) => p.status === "Awaiting Approval").length;
              return (
                <div key={group.company} className="node-contractor-section">
                  <div className="node-contractor-label node-contractor-label-toggle" onClick={() => toggleGroup(group.company)}>
                    <span className="node-contractor-dot" style={{ background: group.color }} />
                    <span className="node-contractor-name">{group.company}</span>
                    <span className="node-contractor-badge">Prime Contractor</span>
                    <div className="node-contractor-right">
                      {isCollapsed && (
                        <span className="node-contractor-summary">
                          {group.packages.length} pkg{group.packages.length !== 1 ? "s" : ""}
                          {inProgressCount > 0 && <span className="nc-dot-blue" />}
                          {awaitingCount > 0 && <span className="nc-dot-amber" />}
                        </span>
                      )}
                      <span className="node-contractor-chevron">{isCollapsed ? "▸" : "▾"}</span>
                    </div>
                  </div>
                  {!isCollapsed && group.packages.map((pkg) => (
                    <NodeCard
                      key={pkg.id}
                      pkg={pkg}
                      projectLocation={project.location}
                      selectedId={selectedPkg}
                      onSelect={(id) => { setSelectedPkg(id); setMobilePanel("detail"); }}
                      onAddSub={(parentId) => { setFParent(parentId); setShowNewPkg(true); }}
                      getChildren={getChildren}
                    />
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={`pd-detail-panel${mobilePanel === "tree" && !selected ? " pd-mobile-hidden" : ""}`}>
        <button className="pd-mobile-back" onClick={() => { setMobilePanel("tree"); setSelectedPkg(null); }}>
          ← Back to packages
        </button>
        {selected ? (
          <div className="pd-detail-content">
            <div className="pd-detail-header">
              <div>
                <span className="pd-pkg-code">{selected.code}</span>
                <h2>{selected.name}</h2>
                <span className={`tag ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
              </div>
              <button className="btn-primary btn-sm" onClick={() => navigate(`/projects/${projectId}/packages/${selected.id}`)}>
                Open Full View
              </button>
            </div>
            <div className="pd-detail-grid">
              <div className="pd-detail-row"><span className="pd-detail-label">Owner Company</span><span>{selected.ownerCompany}</span></div>
              <div className="pd-detail-row"><span className="pd-detail-label">Responsible</span><span>{selected.responsible}</span></div>
              <div className="pd-detail-row"><span className="pd-detail-label">Due Date</span><span>{selected.dueDate}</span></div>
              <div className="pd-detail-row pd-detail-full"><span className="pd-detail-label">Description</span><p>{selected.description || "—"}</p></div>
            </div>
            <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => navigate(`/projects/${projectId}/packages/${selected.id}`)}>
              View Documents, Inspections, Issues &amp; More
            </button>
          </div>
        ) : (
          <TeamsOverview
            project={project}
            packages={projectPackages}
          />
        )}
      </div>

      {showNewPkg && (
        <div className="modal-overlay" onClick={() => { setShowNewPkg(false); resetForm(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Work Package</h2>
            <div className="modal-fields">
              <label>Package Name *<input placeholder="e.g. Mechanical Scope" value={fName} onChange={(e) => setFName(e.target.value)} required /></label>
              <label>Package Code *<input placeholder="e.g. MCA-MECH" value={fCode} onChange={(e) => setFCode(e.target.value)} required /></label>
              <label>Parent Package
                <select value={fParent} onChange={(e) => setFParent(e.target.value)}>
                  <option value="">None (root level)</option>
                  {projectPackages.map((wp) => (
                    <option key={wp.id} value={wp.id}>{wp.code} — {wp.name}</option>
                  ))}
                </select>
              </label>
              <label>Owner Company<input placeholder="e.g. Roteq Engineering" value={fOwner} onChange={(e) => setFOwner(e.target.value)} /></label>
              <label>Responsible Person<input placeholder="e.g. Sara Nkosi" value={fResp} onChange={(e) => setFResp(e.target.value)} /></label>
              <label>Due Date<input type="date" value={fDue} onChange={(e) => setFDue(e.target.value)} /></label>
              <label>Description<textarea rows={3} placeholder="Package scope..." value={fDesc} onChange={(e) => setFDesc(e.target.value)} /></label>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => { setShowNewPkg(false); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={handleCreatePkg} disabled={!fName.trim() || !fCode.trim()}>Create Package</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
