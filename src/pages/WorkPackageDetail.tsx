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

  const activeCompany = user?.memberships.find((m) => m.id === user.activeCompanyId);

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
          <span className="wpd-bc-link" onClick={() => navigate(`/projects/${projectId}`)}>{project.code}</span>
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
