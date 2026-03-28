import { useState } from "react";
import { DOCUMENTS, type Document } from "../../data/mock";

const STATUS_COLORS: Record<string, string> = {
  Draft: "tag-grey",
  Submitted: "tag-blue",
  "Approved for Use": "tag-green",
  Superseded: "tag-muted",
};

export default function DocumentsTab({ packageId }: { packageId: string }) {
  const docs = DOCUMENTS.filter((d) => d.packageId === packageId);
  const [showUpload, setShowUpload] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Group by title to show revision history
  const grouped = docs.reduce<Record<string, Document[]>>((acc, d) => {
    acc[d.title] = acc[d.title] ? [...acc[d.title], d] : [d];
    return acc;
  }, {});

  return (
    <div className="tab-content">
      <div className="tab-bar">
        <span className="tab-count">{docs.length} document(s)</span>
        <button className="btn-primary btn-sm" onClick={() => setShowUpload(true)}>
          + Upload Document
        </button>
      </div>

      {Object.entries(grouped).map(([title, revs]) => {
        const current = revs.find((r) => r.isCurrent) ?? revs[0];
        const isOpen = expanded === title;
        return (
          <div key={title} className="doc-group">
            <div className="doc-row" onClick={() => setExpanded(isOpen ? null : title)}>
              <div className="doc-info">
                <span className="doc-type">{current.type}</span>
                <span className="doc-title">{title}</span>
              </div>
              <div className="doc-meta">
                <span className={`tag ${STATUS_COLORS[current.status]}`}>{current.status}</span>
                <span className="rev-badge">{current.revision}</span>
                <span className="chevron">{isOpen ? "▲" : "▼"}</span>
              </div>
            </div>

            {isOpen && (
              <div className="doc-revisions">
                {revs
                  .sort((a, b) => b.revision.localeCompare(a.revision))
                  .map((rev) => (
                    <div key={rev.id} className={`rev-row ${rev.isCurrent ? "rev-current" : ""}`}>
                      <span className="rev-tag">{rev.revision}</span>
                      <span className="rev-status">{rev.status}</span>
                      <span className="rev-by">
                        {rev.uploadedBy} · {rev.uploadDate}
                      </span>
                      {rev.notes && <span className="rev-notes">{rev.notes}</span>}
                      <button className="btn-link">Download</button>
                    </div>
                  ))}
                <button className="btn-ghost btn-sm" style={{ marginTop: 8 }}>
                  + Upload New Revision
                </button>
              </div>
            )}
          </div>
        );
      })}

      {docs.length === 0 && <p className="empty-state">No documents uploaded yet.</p>}

      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Upload Document</h2>
            <div className="modal-fields">
              <label>Document Title<input placeholder="e.g. Overhaul Procedure" /></label>
              <label>Document Type
                <select>
                  <option>Procedure</option>
                  <option>Method Statement</option>
                  <option>Certificate</option>
                  <option>Drawing</option>
                  <option>Report</option>
                  <option>Other</option>
                </select>
              </label>
              <label>Revision<input placeholder="e.g. Rev A" /></label>
              <label>Status
                <select>
                  <option>Draft</option>
                  <option>Submitted</option>
                  <option>Approved for Use</option>
                </select>
              </label>
              <label>Notes<textarea rows={2} /></label>
              <label>File<input type="file" /></label>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowUpload(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowUpload(false)}>Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
