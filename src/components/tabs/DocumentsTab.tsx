import { useState } from "react";
import { useData } from "../../context/DataContext";
import type { Document, DocStatus } from "../../data/mock";

const STATUS_COLORS: Record<string, string> = {
  Draft: "tag-grey", Submitted: "tag-blue", "Approved for Use": "tag-green", Superseded: "tag-muted",
};

export default function DocumentsTab({ packageId }: { packageId: string }) {
  const { documents, addDocument } = useData();
  const docs = documents.filter((d) => d.packageId === packageId);
  const [showUpload, setShowUpload] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Form state
  const [fTitle, setFTitle] = useState("");
  const [fType, setFType] = useState("Procedure");
  const [fRev, setFRev] = useState("");
  const [fStatus, setFStatus] = useState<DocStatus>("Draft");
  const [fNotes, setFNotes] = useState("");

  // Group by title to show revision history
  const grouped = docs.reduce<Record<string, Document[]>>((acc, d) => {
    acc[d.title] = acc[d.title] ? [...acc[d.title], d] : [d];
    return acc;
  }, {});

  const resetForm = () => {
    setFTitle(""); setFType("Procedure"); setFRev(""); setFStatus("Draft"); setFNotes("");
  };

  const handleUpload = async () => {
    if (!fTitle.trim() || !fRev.trim()) return;
    await addDocument({
      packageId,
      title: fTitle.trim(),
      type: fType,
      revision: fRev.trim(),
      status: fStatus,
      uploadedBy: "Vindy",
      uploadDate: new Date().toISOString().split("T")[0],
      isCurrent: true,
      notes: fNotes.trim(),
    });
    resetForm();
    setShowUpload(false);
  };

  const handleUploadRevision = (title: string) => {
    setFTitle(title);
    const existingRevs = docs.filter((d) => d.title === title);
    const lastRev = existingRevs.sort((a, b) => b.revision.localeCompare(a.revision))[0];
    // Auto-increment revision letter
    if (lastRev) {
      const match = lastRev.revision.match(/Rev\s*([A-Z])/i);
      if (match) {
        const next = String.fromCharCode(match[1].charCodeAt(0) + 1);
        setFRev(`Rev ${next}`);
      } else {
        setFRev("");
      }
    }
    setShowUpload(true);
  };

  return (
    <div className="tab-content">
      <div className="tab-bar">
        <span className="tab-count">{docs.length} document(s)</span>
        <button className="btn-primary btn-sm" onClick={() => { resetForm(); setShowUpload(true); }}>
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
                      <span className="rev-by">{rev.uploadedBy} · {rev.uploadDate}</span>
                      {rev.notes && <span className="rev-notes">{rev.notes}</span>}
                    </div>
                  ))}
                <button className="btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => handleUploadRevision(title)}>
                  + Upload New Revision
                </button>
              </div>
            )}
          </div>
        );
      })}

      {docs.length === 0 && <p className="empty-state">No documents uploaded yet.</p>}

      {showUpload && (
        <div className="modal-overlay" onClick={() => { setShowUpload(false); resetForm(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{fTitle ? `Upload Revision — ${fTitle}` : "Upload Document"}</h2>
            <div className="modal-fields">
              <label>Document Title *<input placeholder="e.g. Overhaul Procedure" value={fTitle} onChange={(e) => setFTitle(e.target.value)} required /></label>
              <label>Document Type
                <select value={fType} onChange={(e) => setFType(e.target.value)}>
                  <option>Procedure</option><option>Method Statement</option><option>Certificate</option>
                  <option>Drawing</option><option>Report</option><option>Other</option>
                </select>
              </label>
              <label>Revision *<input placeholder="e.g. Rev A" value={fRev} onChange={(e) => setFRev(e.target.value)} required /></label>
              <label>Status
                <select value={fStatus} onChange={(e) => setFStatus(e.target.value as DocStatus)}>
                  <option>Draft</option><option>Submitted</option><option>Approved for Use</option>
                </select>
              </label>
              <label>Notes<textarea rows={2} value={fNotes} onChange={(e) => setFNotes(e.target.value)} /></label>
              <label>File<input type="file" /></label>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => { setShowUpload(false); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={handleUpload} disabled={!fTitle.trim() || !fRev.trim()}>Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
