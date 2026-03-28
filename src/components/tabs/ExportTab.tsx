import { DOCUMENTS, INSPECTIONS, ISSUES, APPROVALS, ACTIVITY, type WorkPackage } from "../../data/mock";

export default function ExportTab({ pkg }: { pkg: WorkPackage }) {
  const docs = DOCUMENTS.filter((d) => d.packageId === pkg.id);
  const inspections = INSPECTIONS.filter((i) => i.packageId === pkg.id);
  const issues = ISSUES.filter((i) => i.packageId === pkg.id);
  const approvals = APPROVALS.filter((a) => a.packageId === pkg.id);
  const activity = ACTIVITY.filter((a) => a.packageId === pkg.id);

  const openIssues = issues.filter((i) => i.status !== "Closed").length;
  const pendingApprovals = approvals.filter((a) => a.decision === "Pending").length;
  const passedInspections = inspections.filter((i) => i.result === "Passed").length;

  const readiness = openIssues === 0 && pendingApprovals === 0;

  return (
    <div className="tab-content">
      <div className="export-header">
        <h3>Work Package Evidence Pack</h3>
        <p>Generate a complete handover record for <strong>{pkg.name}</strong></p>
      </div>

      <div className="readiness-card">
        <div className={`readiness-indicator ${readiness ? "ready" : "not-ready"}`}>
          {readiness ? "✓ Ready for Export" : "⚠ Package not yet ready"}
        </div>
        {!readiness && (
          <ul className="readiness-blockers">
            {openIssues > 0 && <li>{openIssues} open issue(s) must be closed</li>}
            {pendingApprovals > 0 && <li>{pendingApprovals} pending approval(s)</li>}
          </ul>
        )}
      </div>

      <div className="export-summary">
        <div className="export-stat">
          <span className="export-stat-value">{docs.length}</span>
          <span className="export-stat-label">Documents</span>
        </div>
        <div className="export-stat">
          <span className="export-stat-value">{inspections.length}</span>
          <span className="export-stat-label">Inspections</span>
        </div>
        <div className="export-stat">
          <span className="export-stat-value">{passedInspections}</span>
          <span className="export-stat-label">Passed</span>
        </div>
        <div className="export-stat">
          <span className="export-stat-value">{issues.length}</span>
          <span className="export-stat-label">Issues</span>
        </div>
        <div className="export-stat">
          <span className="export-stat-value">{approvals.filter((a) => a.decision === "Approved").length}</span>
          <span className="export-stat-label">Approved</span>
        </div>
        <div className="export-stat">
          <span className="export-stat-value">{activity.length}</span>
          <span className="export-stat-label">Audit Events</span>
        </div>
      </div>

      <div className="export-includes">
        <p className="export-section-label">Pack will include:</p>
        <ul>
          <li>Package summary sheet</li>
          <li>Document register + revision history</li>
          <li>Inspection records + evidence</li>
          <li>Issue/NCR records + closure status</li>
          <li>Approval / sign-off history</li>
          <li>Full audit trail</li>
          <li>Index of linked files</li>
        </ul>
      </div>

      <div className="export-btns">
        <button className="btn-primary">Generate PDF Summary</button>
        <button className="btn-ghost">Download ZIP Pack</button>
      </div>
    </div>
  );
}
