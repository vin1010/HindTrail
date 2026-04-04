import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Help.css";

const SECTIONS = [
  { id: "overview",    label: "What is HindTrail?" },
  { id: "login",       label: "Logging In" },
  { id: "projects",    label: "Projects" },
  { id: "packages",    label: "Work Packages" },
  { id: "tree",        label: "Project Tree" },
  { id: "documents",   label: "Documents" },
  { id: "inspections", label: "Inspections" },
  { id: "issues",      label: "Issues & NCRs" },
  { id: "approvals",   label: "Approvals" },
  { id: "export",      label: "Export Pack" },
  { id: "permissions", label: "Permissions" },
  { id: "status",      label: "Status Lifecycle" },
];

export default function Help() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [active, setActive] = useState("overview");

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeCompany = user?.memberships.find((m) => m.id === user.activeCompanyId);

  return (
    <div className="help-layout">
      {/* Sidebar */}
      <aside className="help-sidebar">
        <div className="help-logo" onClick={() => navigate("/workspace")}>HindTrail</div>
        <nav className="help-nav">
          <a onClick={() => navigate("/workspace")}>&#9632; Dashboard</a>
          <a onClick={() => navigate("/projects")}>&#9645; Projects</a>
          <a className="active">&#9654; Help & Docs</a>
        </nav>
        {user && (
          <div className="ws-user">
            <div className="ws-user-info">
              <div className="ws-avatar">{user.fullName.charAt(0)}</div>
              <div><strong>{user.fullName}</strong><span>{activeCompany?.name}</span></div>
            </div>
            <button className="ws-logout" onClick={() => { logout(); navigate("/login"); }}>Sign out</button>
          </div>
        )}
      </aside>

      {/* TOC */}
      <nav className="help-toc">
        <div className="help-toc-title">On this page</div>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`help-toc-item ${active === s.id ? "help-toc-active" : ""}`}
            onClick={() => scrollTo(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="help-content">
        <div className="help-hero">
          <h1>HindTrail — User Guide</h1>
          <p>Everything you need to know to manage work packages, track evidence, and generate handover packs.</p>
        </div>

        {/* ── Overview ──────────────────────────────── */}
        <section id="overview" className="help-section">
          <h2>What is HindTrail?</h2>
          <p>
            HindTrail is a project execution platform built for industrial contractors. It gives every work package
            a structured evidence trail — documents, inspections, issues, and approvals — that can be exported
            as a professional PDF handover pack at project close-out.
          </p>
          <div className="help-cards">
            <div className="help-card">
              <div className="help-card-icon">📁</div>
              <div className="help-card-title">Organise</div>
              <div className="help-card-body">Structure work into projects and hierarchical work packages across multiple contractors.</div>
            </div>
            <div className="help-card">
              <div className="help-card-icon">📋</div>
              <div className="help-card-title">Track</div>
              <div className="help-card-body">Log documents, inspections, issues, and approvals against each work package in real time.</div>
            </div>
            <div className="help-card">
              <div className="help-card-icon">📄</div>
              <div className="help-card-title">Export</div>
              <div className="help-card-body">Generate a complete PDF evidence pack — cover page, document register, inspection records, approvals, and audit trail.</div>
            </div>
          </div>
        </section>

        <div className="help-divider" />

        {/* ── Login ─────────────────────────────────── */}
        <section id="login" className="help-section">
          <h2>Logging In</h2>
          <p>HindTrail uses one-click test accounts for the MVP — no password required.</p>
          <div className="help-table-wrap">
            <table className="help-table">
              <thead><tr><th>Account</th><th>Company</th><th>Role</th><th>What they see</th></tr></thead>
              <tbody>
                <tr>
                  <td><strong>Vindy Sharma</strong></td>
                  <td>Roteq Engineering</td>
                  <td>Admin</td>
                  <td>Prime contractor view — creates and manages work packages</td>
                </tr>
                <tr>
                  <td><strong>John Smith</strong></td>
                  <td>Glencore Ltd</td>
                  <td>Admin</td>
                  <td>Client view — reviews and approves submitted work</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="help-note">
            <strong>Tip:</strong> If you have memberships in more than one company, use the <em>Viewing as</em> dropdown on the dashboard to switch context.
          </div>
        </section>

        <div className="help-divider" />

        {/* ── Projects ──────────────────────────────── */}
        <section id="projects" className="help-section">
          <h2>Projects</h2>
          <p>A <strong>Project</strong> is the top-level container. It belongs to a client and has a location, start date, and end date.</p>
          <ol className="help-steps">
            <li>Go to <strong>Projects</strong> from the sidebar.</li>
            <li>Click <strong>+ New Project</strong> and fill in the name, code, client, location, and dates.</li>
            <li>Click the project card to open it and start adding work packages.</li>
          </ol>
          <div className="help-note">
            The project <strong>Code</strong> (e.g. <code>RT-2026</code>) appears on all exported documents — keep it short and meaningful.
          </div>
        </section>

        <div className="help-divider" />

        {/* ── Packages ──────────────────────────────── */}
        <section id="packages" className="help-section">
          <h2>Work Packages</h2>
          <p>
            A <strong>Work Package</strong> is a scope of work assigned to a contractor. Packages can be nested —
            a prime contractor's package can contain sub-packages assigned to subcontractors.
          </p>
          <div className="help-table-wrap">
            <table className="help-table">
              <thead><tr><th>Field</th><th>Description</th></tr></thead>
              <tbody>
                <tr><td><strong>Code</strong></td><td>Short identifier used on documents and the export pack (e.g. <code>WP-BS-001</code>)</td></tr>
                <tr><td><strong>Owner Company</strong></td><td>The contractor responsible for this scope</td></tr>
                <tr><td><strong>Responsible</strong></td><td>Individual responsible for delivery</td></tr>
                <tr><td><strong>Due Date</strong></td><td>Target completion date</td></tr>
                <tr><td><strong>Status</strong></td><td>Not Started → In Progress → Awaiting Approval → Ready for Handover → Closed</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="help-divider" />

        {/* ── Tree ──────────────────────────────────── */}
        <section id="tree" className="help-section">
          <h2>Project Tree</h2>
          <p>
            The left panel of a project shows all work packages as a tree. Root packages belong to prime contractors;
            child packages belong to subcontractors.
          </p>
          <ul className="help-list">
            <li><strong>Contractor groups</strong> are collapsed by default when there are 3 or more contractors — click the row header to expand.</li>
            <li>A <strong>blue dot</strong> on a collapsed group means at least one package is In Progress.</li>
            <li>An <strong>amber dot</strong> means at least one package is Awaiting Approval.</li>
            <li>Click <strong>+ Add Subcontractor</strong> on any card to create a child package under it.</li>
            <li>Click a card to see its details in the right panel, or click <strong>Open Full View</strong> to go to the full work package page.</li>
          </ul>
        </section>

        <div className="help-divider" />

        {/* ── Documents ─────────────────────────────── */}
        <section id="documents" className="help-section">
          <h2>Documents</h2>
          <p>
            The <strong>Documents</strong> tab holds the document register for a work package. All revisions of a
            document are tracked — only the current revision is shown by default.
          </p>
          <ol className="help-steps">
            <li>Click <strong>+ Upload Document</strong>.</li>
            <li>Enter the title, type, revision (e.g. <em>Rev A</em>), and status.</li>
            <li>Optionally attach a file — it will be stored and a download link will appear in the revision history.</li>
            <li>To issue a new revision, expand the document and click <strong>+ Upload New Revision</strong>. The revision letter auto-increments.</li>
          </ol>
          <div className="help-table-wrap">
            <table className="help-table">
              <thead><tr><th>Status</th><th>Meaning</th></tr></thead>
              <tbody>
                <tr><td><span className="help-badge help-badge-grey">Draft</span></td><td>Work in progress, not yet submitted</td></tr>
                <tr><td><span className="help-badge help-badge-blue">Submitted</span></td><td>Sent to client for review</td></tr>
                <tr><td><span className="help-badge help-badge-green">Approved for Use</span></td><td>Client has approved — safe to proceed</td></tr>
                <tr><td><span className="help-badge help-badge-muted">Superseded</span></td><td>Replaced by a newer revision</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="help-divider" />

        {/* ── Inspections ───────────────────────────── */}
        <section id="inspections" className="help-section">
          <h2>Inspections</h2>
          <p>Log physical inspections against the work package. Each record captures the type, date, inspector, result, and notes.</p>
          <div className="help-table-wrap">
            <table className="help-table">
              <thead><tr><th>Result</th><th>Meaning</th></tr></thead>
              <tbody>
                <tr><td><span className="help-badge help-badge-green">Passed</span></td><td>Inspection completed and accepted</td></tr>
                <tr><td><span className="help-badge help-badge-red">Failed</span></td><td>Non-conformance found — raise an Issue</td></tr>
                <tr><td><span className="help-badge help-badge-grey">Open</span></td><td>Inspection scheduled but not yet completed</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="help-divider" />

        {/* ── Issues ────────────────────────────────── */}
        <section id="issues" className="help-section">
          <h2>Issues & NCRs</h2>
          <p>
            Raise an <strong>Issue</strong> for any non-conformance, outstanding action, or defect that must be resolved
            before handover. Issues block the export readiness check until closed.
          </p>
          <ul className="help-list">
            <li>Set <strong>Severity</strong> to Major or Minor to prioritise the work.</li>
            <li>Assign an <strong>Owner</strong> and a <strong>Due Date</strong>.</li>
            <li>When resolved, change status to <strong>Closed</strong> and add closure notes. HindTrail will automatically re-check whether the package is ready for handover.</li>
          </ul>
        </section>

        <div className="help-divider" />

        {/* ── Approvals ─────────────────────────────── */}
        <section id="approvals" className="help-section">
          <h2>Approvals</h2>
          <p>
            The <strong>Approvals</strong> tab records formal sign-offs. Each approval links to a document, procedure,
            or other object and captures the approver's decision.
          </p>
          <ul className="help-list">
            <li>Submit an approval request with the object label (e.g. <em>Boiler Inspection Report Rev B</em>) and the approver's name.</li>
            <li>The approver logs in, opens the package, and sets the decision to <strong>Approved</strong> or <strong>Rejected</strong>.</li>
            <li>When all approvals are <strong>Approved</strong> and all issues are closed, the package status automatically advances to <strong>Ready for Handover</strong>.</li>
          </ul>
          <div className="help-note">
            <strong>Notification:</strong> The dashboard bell icon shows a badge with the count of pending approvals assigned to you. Click it to jump directly to the relevant package.
          </div>
        </section>

        <div className="help-divider" />

        {/* ── Export ────────────────────────────────── */}
        <section id="export" className="help-section">
          <h2>Export Pack</h2>
          <p>
            The <strong>Export Pack</strong> tab generates a professional PDF handover pack for the work package.
            It is the primary deliverable — a self-contained record that can be handed to the client at project close-out.
          </p>
          <div className="help-cards">
            <div className="help-card help-card-sm">
              <div className="help-card-title">Cover Page</div>
              <div className="help-card-body">Package name, code, project, client, location, status, generated by, and date.</div>
            </div>
            <div className="help-card help-card-sm">
              <div className="help-card-title">1 — Overview</div>
              <div className="help-card-body">Owner company, responsible person, due date, and description.</div>
            </div>
            <div className="help-card help-card-sm">
              <div className="help-card-title">2 — Documents</div>
              <div className="help-card-body">Current revisions highlighted, superseded revisions listed separately.</div>
            </div>
            <div className="help-card help-card-sm">
              <div className="help-card-title">3 — Inspections</div>
              <div className="help-card-body">All inspection records with type, date, inspector, and colour-coded result.</div>
            </div>
            <div className="help-card help-card-sm">
              <div className="help-card-title">4 — Issues</div>
              <div className="help-card-body">All issues with severity, status, owner, and closure notes.</div>
            </div>
            <div className="help-card help-card-sm">
              <div className="help-card-title">5 — Approvals</div>
              <div className="help-card-body">All sign-offs with approver, decision, and date.</div>
            </div>
            <div className="help-card help-card-sm">
              <div className="help-card-title">6 — Audit Trail</div>
              <div className="help-card-body">Chronological list of every action taken on the package.</div>
            </div>
          </div>
          <div className="help-note">
            <strong>Readiness check:</strong> The export tab shows a green <em>Ready for Export</em> banner when all issues are closed and all approvals are granted. You can still export at any time — the banner is advisory only.
          </div>
        </section>

        <div className="help-divider" />

        {/* ── Permissions ───────────────────────────── */}
        <section id="permissions" className="help-section">
          <h2>Permissions</h2>
          <p>
            Each work package has its own member list. Add team members with a specific role to control what they can do.
          </p>
          <div className="help-table-wrap">
            <table className="help-table">
              <thead><tr><th>Role</th><th>Can do</th></tr></thead>
              <tbody>
                <tr><td><strong>Owner</strong></td><td>Full access — create, edit, delete, approve</td></tr>
                <tr><td><strong>Contributor</strong></td><td>Add documents, inspections, issues; cannot approve</td></tr>
                <tr><td><strong>Approver</strong></td><td>Review and approve/reject submitted items</td></tr>
                <tr><td><strong>Viewer</strong></td><td>Read-only access to all records</td></tr>
              </tbody>
            </table>
          </div>
          <p>When you add a member with their email address, HindTrail sends them an invite email automatically.</p>
        </section>

        <div className="help-divider" />

        {/* ── Status Lifecycle ──────────────────────── */}
        <section id="status" className="help-section">
          <h2>Status Lifecycle</h2>
          <p>Work package status moves through a defined lifecycle. Some transitions happen automatically.</p>
          <div className="help-lifecycle">
            <div className="help-lc-step">
              <span className="help-lc-badge" style={{ background: "#f3f4f6", color: "#6b7280" }}>Not Started</span>
              <span className="help-lc-arrow">→</span>
            </div>
            <div className="help-lc-step">
              <span className="help-lc-badge" style={{ background: "#eff6ff", color: "#1d4ed8" }}>In Progress</span>
              <span className="help-lc-arrow">→</span>
            </div>
            <div className="help-lc-step">
              <span className="help-lc-badge" style={{ background: "#fef9c3", color: "#92400e" }}>Awaiting Approval</span>
              <span className="help-lc-arrow">→</span>
            </div>
            <div className="help-lc-step">
              <span className="help-lc-badge" style={{ background: "#ecfdf5", color: "#047857" }}>Ready for Handover</span>
              <span className="help-lc-arrow">→</span>
            </div>
            <div className="help-lc-step">
              <span className="help-lc-badge" style={{ background: "#f3f4f6", color: "#9ca3af" }}>Closed</span>
            </div>
          </div>
          <div className="help-table-wrap" style={{ marginTop: 20 }}>
            <table className="help-table">
              <thead><tr><th>Transition</th><th>Trigger</th></tr></thead>
              <tbody>
                <tr><td>→ Awaiting Approval</td><td><strong>Automatic</strong> — when at least one approval is set to Pending</td></tr>
                <tr><td>→ Ready for Handover</td><td><strong>Automatic</strong> — when all approvals are Approved AND all issues are Closed</td></tr>
                <tr><td>→ Closed</td><td><strong>Manual</strong> — set by the package owner after handover is complete</td></tr>
                <tr><td>All other</td><td><strong>Manual</strong> — set directly on the package</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="help-footer">
          HindTrail · Project execution across contractors
        </div>
      </main>
    </div>
  );
}
