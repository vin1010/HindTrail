import { useState } from "react";
import { useData } from "../../context/DataContext";
import type { InspectionResult } from "../../data/mock";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

async function uploadPhoto(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Photo upload not configured — set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET");
  }
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.secure_url as string;
}

const RESULT_COLORS: Record<string, string> = {
  Open: "tag-blue", Passed: "tag-green", Failed: "tag-red",
};

export default function InspectionsTab({ packageId }: { packageId: string }) {
  const { inspections, addInspection, updateInspectionResult } = useData();
  const items = inspections.filter((i) => i.packageId === packageId);
  const [showNew, setShowNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  // Form state
  const [fType, setFType] = useState("");
  const [fDate, setFDate] = useState("");
  const [fInspector, setFInspector] = useState("");
  const [fResult, setFResult] = useState<InspectionResult>("Open");
  const [fNotes, setFNotes] = useState("");
  const [fPhotos, setFPhotos] = useState<string[]>([]);

  const resetForm = () => {
    setFType(""); setFDate(""); setFInspector(""); setFResult("Open");
    setFNotes(""); setFPhotos([]); setUploadErr(null);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadErr(null);
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadPhoto));
      setFPhotos((prev) => [...prev, ...urls]);
    } catch (e: any) {
      setUploadErr(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (url: string) => {
    setFPhotos((prev) => prev.filter((u) => u !== url));
  };

  const handleCreate = () => {
    if (!fType.trim()) return;
    addInspection({
      packageId,
      type: fType.trim(),
      linkedDocId: null,
      date: fDate || new Date().toISOString().split("T")[0],
      inspector: fInspector.trim() || "Vindy",
      result: fResult,
      notes: fNotes.trim(),
      evidencePhotos: fPhotos.length > 0 ? fPhotos : undefined,
    });
    resetForm();
    setShowNew(false);
  };

  const cycleResult = (id: string, current: InspectionResult) => {
    const next: Record<InspectionResult, InspectionResult> = {
      Open: "Passed", Passed: "Failed", Failed: "Open",
    };
    updateInspectionResult(id, next[current]);
  };

  return (
    <div className="tab-content">
      <div className="tab-bar">
        <span className="tab-count">{items.length} inspection(s)</span>
        <button className="btn-primary btn-sm" onClick={() => setShowNew(true)}>+ New Inspection</button>
      </div>

      <div className="list-rows">
        {items.map((insp) => (
          <div key={insp.id} className="list-row">
            <div className="list-row-main">
              <span className="list-title">{insp.type}</span>
              <div className="list-meta">
                <span>{insp.date}</span>
                <span className="dot">·</span>
                <span>{insp.inspector}</span>
                {insp.evidencePhotos && insp.evidencePhotos.length > 0 && (
                  <>
                    <span className="dot">·</span>
                    <span>📷 {insp.evidencePhotos.length} photo{insp.evidencePhotos.length !== 1 ? "s" : ""}</span>
                  </>
                )}
              </div>
              {insp.notes && <p className="list-notes">{insp.notes}</p>}
              {insp.evidencePhotos && insp.evidencePhotos.length > 0 && (
                <div className="insp-photo-grid">
                  {insp.evidencePhotos.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="insp-photo-thumb">
                      <img src={url} alt="Inspection evidence" loading="lazy" />
                    </a>
                  ))}
                </div>
              )}
            </div>
            <span
              className={`tag ${RESULT_COLORS[insp.result]}`}
              style={{ cursor: "pointer" }}
              title="Click to change result"
              onClick={() => cycleResult(insp.id, insp.result)}
            >
              {insp.result}
            </span>
          </div>
        ))}
        {items.length === 0 && <p className="empty-state">No inspections recorded yet.</p>}
      </div>

      {showNew && (
        <div className="modal-overlay" onClick={() => { setShowNew(false); resetForm(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Inspection</h2>
            <div className="modal-fields">
              <label>Inspection Type *<input placeholder="e.g. Dimensional Check" value={fType} onChange={(e) => setFType(e.target.value)} required /></label>
              <label>Date<input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} /></label>
              <label>Inspector<input placeholder="Name" value={fInspector} onChange={(e) => setFInspector(e.target.value)} /></label>
              <label>Result
                <select value={fResult} onChange={(e) => setFResult(e.target.value as InspectionResult)}>
                  <option>Open</option><option>Passed</option><option>Failed</option>
                </select>
              </label>
              <label>Notes<textarea rows={3} placeholder="Observations, findings..." value={fNotes} onChange={(e) => setFNotes(e.target.value)} /></label>

              <div className="insp-photo-capture">
                <div className="insp-photo-capture-label">Evidence photos</div>
                {fPhotos.length > 0 && (
                  <div className="insp-photo-grid insp-photo-grid-edit">
                    {fPhotos.map((url) => (
                      <div key={url} className="insp-photo-thumb">
                        <img src={url} alt="Evidence" />
                        <button type="button" className="insp-photo-remove" onClick={() => removePhoto(url)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                {CLOUD_NAME ? (
                  <>
                    <label className="insp-photo-btn">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => handleFiles(e.target.files)}
                      />
                      <span>📷 {uploading ? "Uploading..." : "Take / upload photos"}</span>
                    </label>
                    {uploadErr && <p className="insp-photo-err">{uploadErr}</p>}
                  </>
                ) : (
                  <p className="insp-photo-hint">Photo upload not configured — set VITE_CLOUDINARY_* env vars on Vercel.</p>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => { setShowNew(false); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate} disabled={!fType.trim() || uploading}>
                {uploading ? "Waiting for uploads..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
