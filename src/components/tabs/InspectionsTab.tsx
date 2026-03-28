import { useState } from "react";
import { INSPECTIONS } from "../../data/mock";

const RESULT_COLORS: Record<string, string> = {
  Open: "tag-blue",
  Passed: "tag-green",
  Failed: "tag-red",
};

export default function InspectionsTab({ packageId }: { packageId: string }) {
  const items = INSPECTIONS.filter((i) => i.packageId === packageId);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="tab-content">
      <div className="tab-bar">
        <span className="tab-count">{items.length} inspection(s)</span>
        <button className="btn-primary btn-sm" onClick={() => setShowNew(true)}>
          + New Inspection
        </button>
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
            <span className={`tag ${RESULT_COLORS[insp.result]}`}>{insp.result}</span>
          </div>
        ))}
        {items.length === 0 && <p className="empty-state">No inspections recorded yet.</p>}
      </div>

      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Inspection</h2>
            <div className="modal-fields">
              <label>Inspection Type<input placeholder="e.g. Dimensional Check" /></label>
              <label>Date<input type="date" /></label>
              <label>Inspector<input placeholder="Name" /></label>
              <label>Result
                <select>
                  <option>Open</option>
                  <option>Passed</option>
                  <option>Failed</option>
                </select>
              </label>
              <label>Notes<textarea rows={3} placeholder="Observations, findings..." /></label>
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
