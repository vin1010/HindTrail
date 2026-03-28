import { useState } from "react";
import { useData } from "../../context/DataContext";
import type { InspectionResult } from "../../data/mock";

const RESULT_COLORS: Record<string, string> = {
  Open: "tag-blue", Passed: "tag-green", Failed: "tag-red",
};

export default function InspectionsTab({ packageId }: { packageId: string }) {
  const { inspections, addInspection, updateInspectionResult } = useData();
  const items = inspections.filter((i) => i.packageId === packageId);
  const [showNew, setShowNew] = useState(false);

  // Form state
  const [fType, setFType] = useState("");
  const [fDate, setFDate] = useState("");
  const [fInspector, setFInspector] = useState("");
  const [fResult, setFResult] = useState<InspectionResult>("Open");
  const [fNotes, setFNotes] = useState("");

  const resetForm = () => {
    setFType(""); setFDate(""); setFInspector(""); setFResult("Open"); setFNotes("");
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
              </div>
              {insp.notes && <p className="list-notes">{insp.notes}</p>}
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
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => { setShowNew(false); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate} disabled={!fType.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
