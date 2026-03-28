import { useData } from "../../context/DataContext";
import type { WorkPackage, PackageStatus } from "../../data/mock";

const STATUS_COLORS: Record<string, string> = {
  "Not Started": "tag-grey", "In Progress": "tag-blue",
  "Awaiting Approval": "tag-yellow", "Ready for Handover": "tag-green", Closed: "tag-grey",
};

const STATUSES: PackageStatus[] = ["Not Started", "In Progress", "Awaiting Approval", "Ready for Handover", "Closed"];

export default function OverviewTab({ pkg }: { pkg: WorkPackage }) {
  const { updatePackageStatus, addApproval } = useData();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updatePackageStatus(pkg.id, e.target.value as PackageStatus);
  };

  const handleSubmitForApproval = () => {
    updatePackageStatus(pkg.id, "Awaiting Approval");
    addApproval({
      packageId: pkg.id,
      objectType: "Package",
      objectLabel: pkg.name,
      submittedBy: "Vindy",
      submittedDate: new Date().toISOString().split("T")[0],
      approver: "—",
      decision: "Pending",
      decisionDate: "",
      comments: "",
    });
  };

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
        <select className="status-select" value={pkg.status} onChange={handleStatusChange}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn-primary" onClick={handleSubmitForApproval}>Submit for Approval</button>
      </div>
    </div>
  );
}
