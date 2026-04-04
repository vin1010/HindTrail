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

const COMPANY_COLORS = [
  "#4f46e5", "#0891b2", "#059669", "#d97706", "#dc2626",
  "#7c3aed", "#db2777", "#065f46", "#92400e", "#1e40af",
];

function getCompanyColor(_name: string, index: number): string {
  return COMPANY_COLORS[index % COMPANY_COLORS.length];
}

function TreeNode({
  pkg, level, selectedId, onSelect, getChildren, companyColor,
}: {
  pkg: WorkPackage; level: number; selectedId: string | null;
  onSelect: (id: string) => void;
  getChildren: (parentId: string | null, projectId: string) => WorkPackage[];
  companyColor?: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const children = getChildren(pkg.id, pkg.projectId);
  const hasChildren = children.length > 0;
  const isSelected = selectedId === pkg.id;

  // Group children by ownerCompany for subcontractor visibility
  const childCompanies = [...new Set(children.map((c) => c.ownerCompany))];
  const groupByCompany = childCompanies.length > 1 || (childCompanies.length === 1 && childCompanies[0] !== pkg.ownerCompany);

  return (
    <div className="tree-node" style={{ paddingLeft: level * 20 }}>
      <div
        className={`tree-node-row ${isSelected ? "tree-selected" : ""}`}
        onClick={() => onSelect(pkg.id)}
        style={companyColor ? { borderLeft: `3px solid ${companyColor}`, paddingLeft: 8 } : {}}
      >
        {hasChildren ? (
          <button className="tree-toggle" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="tree-toggle tree-leaf">–</span>
        )}
        <div className="tree-node-info">
          <span className="tree-code">{pkg.code}</span>
          <span className="tree-name">{pkg.name}</span>
          {level > 0 && pkg.ownerCompany && (
            <span className="tree-sub-company">{pkg.ownerCompany}</span>
          )}
        </div>
        <span className={`tree-status ${STATUS_COLORS[pkg.status]}`}>{pkg.status}</span>
      </div>
      {expanded && hasChildren && (
        <div className="tree-children">
          {groupByCompany
            ? childCompanies.map((company) => {
                const groupChildren = children.filter((c) => c.ownerCompany === company);
                const isSubcontractor = company !== pkg.ownerCompany;
                return (
                  <div key={company} className="tree-sub-group">
                    {isSubcontractor && (
                      <div className="tree-sub-group-label">
                        <span className="tree-sub-arrow">↳</span>
                        <span className="tree-sub-name">{company}</span>
                        <span className="tree-sub-badge">Subcontractor</span>
                      </div>
                    )}
                    {groupChildren.map((child) => (
                      <TreeNode
                        key={child.id} pkg={child} level={level + 1}
                        selectedId={selectedId} onSelect={onSelect} getChildren={getChildren}
                      />
                    ))}
                  </div>
                );
              })
            : children.map((child) => (
                <TreeNode
                  key={child.id} pkg={child} level={level + 1}
                  selectedId={selectedId} onSelect={onSelect} getChildren={getChildren}
                />
              ))
          }
        </div>
      )}
    </div>
  );
}

function ContractorGroup({
  company, color, packages, selectedId, onSelect, getChildren, defaultExpanded,
}: {
  company: string; color: string; packages: WorkPackage[];
  selectedId: string | null; onSelect: (id: string) => void;
  getChildren: (parentId: string | null, projectId: string) => WorkPackage[];
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const total = packages.length;
  const inProgress = packages.filter((p) => p.status === "In Progress").length;

  return (
    <div className="contractor-group">
      <div className="contractor-group-header" onClick={() => setExpanded(!expanded)}>
        <div className="contractor-group-left">
          <span className="contractor-color-dot" style={{ backgroundColor: color }} />
          <div>
            <span className="contractor-group-name">{company}</span>
            <span className="contractor-role-badge">Prime Contractor</span>
          </div>
        </div>
        <div className="contractor-group-right">
          <span className="contractor-pkg-count">{total} pkg{total !== 1 ? "s" : ""}</span>
          {inProgress > 0 && <span className="contractor-active-dot" />}
          <span className="contractor-toggle">{expanded ? "▾" : "▸"}</span>
        </div>
      </div>
      {expanded && (
        <div className="contractor-group-body">
          {packages.map((pkg) => (
            <TreeNode
              key={pkg.id} pkg={pkg} level={0}
              selectedId={selectedId} onSelect={onSelect} getChildren={getChildren}
              companyColor={color}
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

  useEffect(() => {
    loadProjects();
    if (projectId) loadPackages(projectId);
  }, [projectId]);

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
          {contractorGroups.length === 0 ? (
            <p className="pd-tree-empty">No work packages yet. Create one to get started.</p>
          ) : (
            contractorGroups.map((group) => (
              <ContractorGroup
                key={group.company}
                company={group.company}
                color={group.color}
                packages={group.packages}
                selectedId={selectedPkg}
                onSelect={(id) => { setSelectedPkg(id); setMobilePanel("detail"); }}
                getChildren={getChildren}
                defaultExpanded={contractorGroups.length <= 2}
              />
            ))
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
