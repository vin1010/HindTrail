import { useState } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import type { Document, DocStatus } from "../../data/mock";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary not configured — set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET");
  }
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.secure_url as string;
}

const STATUS_COLORS: Record<string, string> = {
  Draft: "tag-grey", Submitted: "tag-blue", "Approved for Use": "tag-green", Superseded: "tag-muted",
};

export default function DocumentsTab({ packageId }: { packageId: string }) {
  const { documents, addDocument } = useData();
  const { user } = useAuth();
  const docs = documents.filter((d) => d.packageId === packageId);
  const [showUpload, setShowUpload] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [fTitle, setFTitle] = useState("");
  const [fType, setFType] = useState("Procedure");
  const [fRev, setFRev] = useState("");
  const [fStatus, setFStatus] = useState<DocStatus>("Draft");
  const [fNotes, setFNotes] = useState("");
  const [fFile, setFFile] = useState<File | null>(null);

  // Group by title to show revision history
  const grouped = docs.reduce<Record<string, Document[]>>((acc, d) => {
    acc[d.title] = acc[d.title] ? [...acc[d.title], d] : [d];
    return acc;
  }, {});

  const resetForm = () => {
    setFTitle(""); setFType("Procedure"); setFRev(""); setFStatus("Draft"); setFNotes(""); setFFile(null);
  };

  const handleUpload = async () => {
    if (!fTitle.trim() || !fRev.trim()) return;
    setUploading(true);
    try {
      let fileUrl: string | undefined;
      if (fFile) {
        fileUrl = await uploadToCloudinary(fFile);
      }
      await addDocument({
        packageId,
        title: fTitle.trim(),
        type: fType,
        revision: fRev.trim(),
        status: fStatus,
        uploadedBy: user?.fullName ?? "Unknown",
        uploadDate: new Date().toISOString().split("T")[0],
        isCurrent: true,
        notes: fNotes.trim(),
        fileUrl,
      });
      resetForm();
      setShowUpload(false);
    } finally {
      setUploading(false);
    }
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
                      {rev.fileUrl && <a className="rev-download" href={rev.fileUrl} target="_blank" rel="noreferrer">⬇ Download</a>}
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
              <label>File (optional){CLOUD_NAME ? <input type="file" onChange={(e) => setFFile(e.target.files?.[0] ?? null)} /> : <span style={{ fontSize: 12, color: "#9ca3af" }}> Cloudinary not configured</span>}</label>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => { setShowUpload(false); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={handleUpload} disabled={!fTitle.trim() || !fRev.trim() || uploading}>{uploading ? "Uploading..." : "Upload"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
