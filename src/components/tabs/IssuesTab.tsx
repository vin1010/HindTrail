import { useState } from "react";
import { ISSUES } from "../../data/mock";

const STATUS_COLORS: Record<string, string> = {
  Open: "tag-red",
  "In Progress": "tag-blue",
  "Awaiting Review": "tag-yellow",
  Closed: "tag-green",
};

const SEV_COLORS: Record<string, string> = {
  Critical: "sev-critical",
  Major: "sev-major",
  Minor: "sev-minor",
};

export default function IssuesTab({ packageId }: { packageId: string }) {
  const items = ISSUES.filter((i) => i.packageId === packageId);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="tab-content">
      <div className="tab-bar">
        <span className="tab-count">{items.length} issue(s)</span>
        <button className="btn-primary btn-sm" onClick={() => setShowNew(true)}>
          + Raise Issue
        </button>
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
            <span className={`tag ${STATUS_COLORS[iss.status]}`}>{iss.status}</span>
          </div>
        ))}
        {items.length === 0 && <p className="empty-state">No issues raised yet.</p>}
      </div>

      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Raise Issue</h2>
            <div className="modal-fields">
              <label>Title<input placeholder="Brief description of the issue" /></label>
              <label>Description<textarea rows={3} /></label>
              <label>Severity
                <select>
                  <option>Critical</option>
                  <option>Major</option>
                  <option>Minor</option>
                </select>
              </label>
              <label>Owner<input placeholder="Responsible person" /></label>
              <label>Due Date<input type="date" /></label>
              <label>Attachments<input type="file" multiple /></label>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowNew(false)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
