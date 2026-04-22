import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import OverviewTab from "../components/tabs/OverviewTab";
import DocumentsTab from "../components/tabs/DocumentsTab";
import InspectionsTab from "../components/tabs/InspectionsTab";
import IssuesTab from "../components/tabs/IssuesTab";
import ApprovalsTab from "../components/tabs/ApprovalsTab";
import ActivityTab from "../components/tabs/ActivityTab";
import PermissionsTab from "../components/tabs/PermissionsTab";
import ExportTab from "../components/tabs/ExportTab";
import NotesTab from "../components/tabs/NotesTab";
import "./WorkPackageDetail.css";

const TABS = ["Overview", "Documents", "Inspections", "Issues", "Approvals", "Activity", "Notes", "Permissions", "Export Pack"] as const;
type TabName = (typeof TABS)[number];

function ReadinessBanner({ pkg, onJumpTo }: { pkg: any; onJumpTo: (tab: TabName) => void }) {
  const r = pkg.rollup;
  if (!r) return null;
  const ready = r.completionPct >= 100 && r.openIssues === 0 && r.pendingApprovals === 0;
  const blockers: { label: string; tab: TabName }[] = [];
  if (r.openIssues > 0) blockers.push({ label: `${r.openIssues} open issue${r.openIssues !== 1 ? "s" : ""}`, tab: "Issues" });
  if (r.pendingApprovals > 0) blockers.push({ label: `${r.pendingApprovals} pending approval${r.pendingApprovals !== 1 ? "s" : ""}`, tab: "Approvals" });
  return (
    <div className={`readiness-banner ${ready ? "readiness-ready" : "readiness-blocked"}`}>
      <div className="readiness-score">
        <div className="readiness-pct">{r.completionPct}%</div>
        <div className="readiness-pct-label">ready</div>
      </div>
      <div className="readiness-body">
        <div className="readiness-title">
          {ready ? "Ready for handover" : blockers.length > 0 ? "Not yet ready" : "In progress"}
        </div>
        <div className="readiness-meta">
          {r.descendantCount > 0 && (
            <span>{r.descendantCount + 1} package{r.descendantCount > 0 ? "s" : ""} in scope · </span>
          )}
          <span>{r.documentsCount} doc{r.documentsCount !== 1 ? "s" : ""}</span>
          <span> · {r.inspectionsCount} inspection{r.inspectionsCount !== 1 ? "s" : ""}</span>
        </div>
        {blockers.length > 0 && (
          <div className="readiness-blockers">
            {blockers.map((b) => (
              <button
                key={b.tab}
                className="readiness-blocker"
                onClick={() => onJumpTo(b.tab)}
              >
                {b.label}
                <span className="readiness-arrow">→</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="readiness-progress">
        <div className="readiness-progress-fill" style={{ width: `${r.completionPct}%` }} />
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  "Not Started": "pkg-grey", "In Progress": "pkg-blue",
  "Awaiting Approval": "pkg-yellow", "Ready for Handover": "pkg-green", Closed: "pkg-muted",
};

export default function WorkPackageDetail() {
  const { projectId, packageId } = useParams<{ projectId: string; packageId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { projects, packages, loadProjects, loadPackages, loadPackageData } = useData();
  const [activeTab, setActiveTab] = useState<TabName>("Overview");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      loadProjects(),
      projectId ? loadPackages(projectId) : Promise.resolve(),
      packageId ? loadPackageData(packageId) : Promise.resolve(),
    ]).finally(() => setIsLoading(false));
  }, [projectId, packageId]);

  const project = projects.find((p) => p.id === projectId);
  const pkg = packages.find((wp) => wp.id === packageId);
  const activeCompany = user?.memberships.find((m) => m.id === user.activeCompanyId);

  // Determine viewer role on this package
  const projectRootPkgs = packages.filter((p) => p.projectId === projectId && !p.parentId);
  const viewerRole: "client" | "prime" | "subcontractor" = (() => {
    if (!activeCompany) return "prime";
    if (activeCompany.type === "client") return "client";
    const ownsRoot = projectRootPkgs.some(
      (p) => p.ownerCompany === activeCompany.name || p.ownerCompanyId === activeCompany.id
    );
    return ownsRoot ? "prime" : "subcontractor";
  })();

  if (isLoading) {
    return (
      <div className="wpd-layout">
        <div className="pd-empty">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!project || !pkg) {
    return (
      <div className="wpd-layout">
        <div className="pd-empty">
          <h2>Package not found</h2>
          <button className="btn-primary" onClick={() => navigate(`/projects/${projectId}`)}>Back to Project</button>
        </div>
      </div>
    );
  }

  // Subcontractor trying to open a package they don't own
  if (
    viewerRole === "subcontractor" &&
    pkg.ownerCompany !== activeCompany?.name &&
    pkg.ownerCompanyId !== activeCompany?.id
  ) {
    return (
      <div className="wpd-layout">
        <div className="pd-empty">
          <h2>Access Restricted</h2>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>You don't have permission to view this work package.</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate(`/projects/${projectId}`)}>Back to Project</button>
        </div>
      </div>
    );
  }

  function renderTab() {
    switch (activeTab) {
      case "Overview": return <OverviewTab pkg={pkg!} />;
      case "Documents": return <DocumentsTab packageId={pkg!.id} />;
      case "Inspections": return <InspectionsTab packageId={pkg!.id} />;
      case "Issues": return <IssuesTab packageId={pkg!.id} />;
      case "Approvals": return <ApprovalsTab packageId={pkg!.id} />;
      case "Activity": return <ActivityTab packageId={pkg!.id} />;
      case "Notes": return <NotesTab packageId={pkg!.id} />;
      case "Permissions": return <PermissionsTab packageId={pkg!.id} />;
      case "Export Pack": return <ExportTab pkg={pkg!} project={project!} />;
    }
  }

  return (
    <div className="wpd-layout">
      <aside className="wpd-sidebar">
        <div className="wpd-logo" onClick={() => navigate("/workspace")}>HindTrail</div>
        <nav className="wpd-nav">
          <a onClick={() => navigate("/workspace")}><span className="ws-nav-icon">&#9632;</span> Dashboard</a>
          <a onClick={() => navigate("/projects")}><span className="ws-nav-icon">&#9645;</span> Projects</a>
          <a onClick={() => navigate(`/projects/${projectId}`)}><span className="ws-nav-icon">&#9659;</span> {project.code}</a>
          <a className="active"><span className="ws-nav-icon">&#9654;</span> {pkg.code}</a>
          <a onClick={() => navigate("/help")}><span className="ws-nav-icon">&#9432;</span> Help & Docs</a>
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

      <main className="wpd-main">
        <div className="wpd-breadcrumb">
          <span className="wpd-bc-link" onClick={() => navigate("/projects")}>Projects</span>
          <span className="wpd-bc-sep">/</span>
          <span className="wpd-bc-link" onClick={() => navigate(`/projects/${projectId}`)}>{viewerRole === "subcontractor" ? "Project" : project.code}</span>
          <span className="wpd-bc-sep">/</span>
          <span className="wpd-bc-current">{pkg.code}</span>
        </div>

        <div className="wpd-header">
          <div>
            <h1>{pkg.name}</h1>
            <div className="wpd-header-meta">
              <span className={`tag ${STATUS_COLORS[pkg.status]}`}>{pkg.status}</span>
              <span className="wpd-header-company">{pkg.ownerCompany}</span>
              <span className="dot">&middot;</span>
              <span>{pkg.responsible}</span>
              <span className="dot">&middot;</span>
              <span>Due: {pkg.dueDate}</span>
            </div>
          </div>
        </div>

        <ReadinessBanner pkg={pkg} onJumpTo={(tab) => setActiveTab(tab)} />

        <div className="wpd-tabs">
          {TABS.map((tab) => (
            <button key={tab} className={`wpd-tab ${activeTab === tab ? "wpd-tab-active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        <div className="wpd-tab-content">{renderTab()}</div>
      </main>
    </div>
  );
}
