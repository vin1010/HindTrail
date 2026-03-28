import { useState } from "react";
import { useData } from "../../context/DataContext";
import type { IssueStatus } from "../../data/mock";

const SEV_COLORS: Record<string, string> = {
  Critical: "sev-critical", Major: "sev-major", Minor: "sev-minor",
};

const ISSUE_STATUSES: IssueStatus[] = ["Open", "In Progress", "Awaiting Review", "Closed"];

export default function IssuesTab({ packageId }: { packageId: string }) {
  const { issues, addIssue, updateIssueStatus } = useData();
  const items = issues.filter((i) => i.packageId === packageId);
  const [showNew, setShowNew] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [closureNotes, setClosureNotes] = useState("");

  // Form state
  const [fTitle, setFTitle] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fSev, setFSev] = useState<"Critical" | "Major" | "Minor">("Major");
  const [fOwner, setFOwner] = useState("");
  const [fDue, setFDue] = useState("");

  const resetForm = () => {
    setFTitle(""); setFDesc(""); setFSev("Major"); setFOwner(""); setFDue("");
  };

  const handleCreate = () => {
    if (!fTitle.trim()) return;
    addIssue({
      packageId,
      title: fTitle.trim(),
      description: fDesc.trim(),
      severity: fSev,
      linkedInspectionId: null,
      owner: fOwner.trim() || "Vindy",
      dueDate: fDue || "—",
      status: "Open",
      closureNotes: "",
    });
    resetForm();
    setShowNew(false);
  };

  const handleStatusChange = (id: string, newStatus: IssueStatus) => {
    if (newStatus === "Closed") {
      setClosingId(id);
      setClosureNotes("");
    } else {
      updateIssueStatus(id, newStatus);
    }
  };

  const handleClose = () => {
    if (closingId) {
      updateIssueStatus(closingId, "Closed", closureNotes.trim());
      setClosingId(null);
      setClosureNotes("");
    }
  };

  return (
    <div className="tab-content">
      <div className="tab-bar">
        <span className="tab-count">{items.length} issue(s)</span>
        <button className="btn-primary btn-sm" onClick={() => setShowNew(true)}>+ Raise Issue</button>
      </div>

      <div className="list-rows">
        {items.map((iss) => (
          <div key={iss.id} className="list-row">
            <div className="list-row-main">
              <div className="list-row-head">
                <span className={`sev-dot ${SEV_COLORS[iss.severity]}`} title={iss.severity} />
                <span className="list-title">{iss.title}</span>
              </div>
              <p className="list-notes">{iss.description}</p>
              <div className="list-meta">
                <span>Owner: {iss.owner}</span>
                <span className="dot">·</span>
                <span>Due: {iss.dueDate}</span>
                {iss.closureNotes && (
                  <>
                    <span className="dot">·</span>
                    <span className="closure-note">{iss.closureNotes}</span>
                  </>
                )}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <select
                className="status-select"
                value={iss.status}
                onChange={(e) => handleStatusChange(iss.id, e.target.value as IssueStatus)}
                style={{ fontSize: 12, padding: "4px 8px" }}
              >
                {ISSUE_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="empty-state">No issues raised yet.</p>}
      </div>

      {/* New Issue Modal */}
      {showNew && (
        <div className="modal-overlay" onClick={() => { setShowNew(false); resetForm(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Raise Issue</h2>
            <div className="modal-fields">
              <label>Title *<input placeholder="Brief description of the issue" value={fTitle} onChange={(e) => setFTitle(e.target.value)} required /></label>
              <label>Description<textarea rows={3} value={fDesc} onChange={(e) => setFDesc(e.target.value)} /></label>
              <label>Severity
                <select value={fSev} onChange={(e) => setFSev(e.target.value as "Critical" | "Major" | "Minor")}>
                  <option>Critical</option><option>Major</option><option>Minor</option>
                </select>
              </label>
              <label>Owner<input placeholder="Responsible person" value={fOwner} onChange={(e) => setFOwner(e.target.value)} /></label>
              <label>Due Date<input type="date" value={fDue} onChange={(e) => setFDue(e.target.value)} /></label>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => { setShowNew(false); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate} disabled={!fTitle.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Close Issue Modal */}
      {closingId && (
        <div className="modal-overlay" onClick={() => setClosingId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Close Issue</h2>
            <div className="modal-fields">
              <label>Closure Notes<textarea rows={3} placeholder="Describe the resolution..." value={closureNotes} onChange={(e) => setClosureNotes(e.target.value)} /></label>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setClosingId(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleClose}>Close Issue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
