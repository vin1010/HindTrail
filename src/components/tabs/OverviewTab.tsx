import type { WorkPackage } from "../../data/mock";

const STATUS_COLORS: Record<string, string> = {
  "Not Started": "tag-grey",
  "In Progress": "tag-blue",
  "Awaiting Approval": "tag-yellow",
  "Ready for Handover": "tag-green",
  Closed: "tag-grey",
};

export default function OverviewTab({ pkg }: { pkg: WorkPackage }) {
  return (
    <div className="tab-content">
      <div className="overview-grid">
        <div className="ov-row">
          <span className="ov-label">Package Code</span>
          <span className="ov-value mono">{pkg.code}</span>
        </div>
        <div className="ov-row">
          <span className="ov-label">Status</span>
          <span className={`tag ${STATUS_COLORS[pkg.status]}`}>{pkg.status}</span>
        </div>
        <div className="ov-row">
          <span className="ov-label">Owner Company</span>
          <span className="ov-value">{pkg.ownerCompany}</span>
        </div>
        <div className="ov-row">
          <span className="ov-label">Responsible</span>
          <span className="ov-value">{pkg.responsible}</span>
        </div>
        <div className="ov-row">
          <span className="ov-label">Due Date</span>
          <span className="ov-value">{pkg.dueDate}</span>
        </div>
        <div className="ov-row ov-full">
          <span className="ov-label">Description</span>
          <p className="ov-desc">{pkg.description || "—"}</p>
        </div>
      </div>

      <div className="ov-actions">
        <select className="status-select" defaultValue={pkg.status}>
          <option>Not Started</option>
          <option>In Progress</option>
          <option>Awaiting Approval</option>
          <option>Ready for Handover</option>
          <option>Closed</option>
        </select>
        <button className="btn-primary">Submit for Approval</button>
      </div>
    </div>
  );
}
