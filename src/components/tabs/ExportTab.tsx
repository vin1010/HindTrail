import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { HandoverPackPDF } from "./ExportPDF";
import type { WorkPackage } from "../../data/mock";

export default function ExportTab({ pkg, project }: { pkg: WorkPackage; project: any }) {
  const { user } = useAuth();
  const { documents, inspections, issues, approvals, activity } = useData();
  const [exporting, setExporting] = useState(false);

  const docs = documents.filter((d) => d.packageId === pkg.id);
  const pkgInspections = inspections.filter((i) => i.packageId === pkg.id);
  const pkgIssues = issues.filter((i) => i.packageId === pkg.id);
  const pkgApprovals = approvals.filter((a) => a.packageId === pkg.id);
  const pkgActivity = activity.filter((a) => a.packageId === pkg.id);

  const openIssues = pkgIssues.filter((i) => i.status !== "Closed").length;
  const pendingApprovals = pkgApprovals.filter((a) => a.decision === "Pending").length;
  const passedInspections = pkgInspections.filter((i) => i.result === "Passed").length;

  const readiness = openIssues === 0 && pendingApprovals === 0;

  const generateTextExport = () => {
    const lines: string[] = [];
    lines.push("═══════════════════════════════════════════════════");
    lines.push("WORK PACKAGE EVIDENCE PACK");
    lines.push("═══════════════════════════════════════════════════");
    lines.push("");
    lines.push(`Package: ${pkg.name} (${pkg.code})`);
    lines.push(`Status: ${pkg.status}`);
    lines.push(`Owner: ${pkg.ownerCompany}`);
    lines.push(`Responsible: ${pkg.responsible}`);
    lines.push(`Due Date: ${pkg.dueDate}`);
    lines.push(`Description: ${pkg.description}`);
    lines.push("");

    lines.push("─── DOCUMENT REGISTER ─────────────────────────────");
    if (docs.length === 0) {
      lines.push("  No documents.");
    } else {
      docs.forEach((d) => {
        lines.push(`  ${d.title} | ${d.revision} | ${d.status} | ${d.uploadedBy} | ${d.uploadDate}`);
        if (d.notes) lines.push(`    Notes: ${d.notes}`);
      });
    }
    lines.push("");

    lines.push("─── INSPECTIONS ───────────────────────────────────");
    if (pkgInspections.length === 0) {
      lines.push("  No inspections.");
    } else {
      pkgInspections.forEach((i) => {
        lines.push(`  ${i.type} | ${i.result} | ${i.inspector} | ${i.date}`);
        if (i.notes) lines.push(`    Notes: ${i.notes}`);
      });
    }
    lines.push("");

    lines.push("─── ISSUES / NCR ──────────────────────────────────");
    if (pkgIssues.length === 0) {
      lines.push("  No issues.");
    } else {
      pkgIssues.forEach((i) => {
        lines.push(`  [${i.severity}] ${i.title} | ${i.status} | Owner: ${i.owner}`);
        if (i.closureNotes) lines.push(`    Closure: ${i.closureNotes}`);
      });
    }
    lines.push("");

    lines.push("─── APPROVALS / SIGN-OFFS ─────────────────────────");
    if (pkgApprovals.length === 0) {
      lines.push("  No approvals.");
    } else {
      pkgApprovals.forEach((a) => {
        lines.push(`  ${a.objectType}: ${a.objectLabel} | ${a.decision} | ${a.approver} | ${a.decisionDate || "—"}`);
        if (a.comments) lines.push(`    Comments: ${a.comments}`);
      });
    }
    lines.push("");

    lines.push("─── AUDIT TRAIL ───────────────────────────────────");
    if (pkgActivity.length === 0) {
      lines.push("  No activity.");
    } else {
      pkgActivity.forEach((a) => {
        lines.push(`  ${a.timestamp} | ${a.user} (${a.company}) | ${a.actionType} | ${a.objectLabel}`);
      });
    }
    lines.push("");
    lines.push("═══════════════════════════════════════════════════");
    lines.push(`Generated: ${new Date().toISOString()}`);

    return lines.join("\n");
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const activeCompany = user?.memberships.find((m) => m.id === user.activeCompanyId);
      const generatedBy = `${user?.fullName} (${activeCompany?.name || "—"})`;

      const blob = await pdf(
        <HandoverPackPDF
          pkg={pkg}
          project={project}
          documents={docs}
          inspections={pkgInspections}
          issues={pkgIssues}
          approvals={pkgApprovals}
          activity={pkgActivity}
          generatedBy={generatedBy}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pkg.code}_Evidence_Pack.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleExportZIP = () => {
    // For MVP, export as a structured text file (ZIP would require a library)
    const content = generateTextExport();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pkg.code}_Evidence_Pack_Full.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tab-content">
      <div className="export-header">
        <h3>Work Package Evidence Pack</h3>
        <p>Generate a complete handover record for <strong>{pkg.name}</strong></p>
      </div>

      <div className="readiness-card">
        <div className={`readiness-indicator ${readiness ? "ready" : "not-ready"}`}>
          {readiness ? "Ready for Export" : "Package not yet ready"}
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
          <span className="export-stat-value">{pkgInspections.length}</span>
          <span className="export-stat-label">Inspections</span>
        </div>
        <div className="export-stat">
          <span className="export-stat-value">{passedInspections}</span>
          <span className="export-stat-label">Passed</span>
        </div>
        <div className="export-stat">
          <span className="export-stat-value">{pkgIssues.length}</span>
          <span className="export-stat-label">Issues</span>
        </div>
        <div className="export-stat">
          <span className="export-stat-value">{pkgApprovals.filter((a) => a.decision === "Approved").length}</span>
          <span className="export-stat-label">Approved</span>
        </div>
        <div className="export-stat">
          <span className="export-stat-value">{pkgActivity.length}</span>
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
        </ul>
      </div>

      <div className="export-btns">
        <button className="btn-primary" onClick={handleExportPDF} disabled={exporting}>
          {exporting ? "Generating..." : "Download Evidence Pack"}
        </button>
        <button className="btn-ghost" onClick={handleExportZIP}>Download Full Report</button>
      </div>
    </div>
  );
}
