import { APPROVALS } from "../../data/mock";

const DEC_COLORS: Record<string, string> = {
  Pending: "tag-yellow",
  Approved: "tag-green",
  Rejected: "tag-red",
};

export default function ApprovalsTab({ packageId }: { packageId: string }) {
  const items = APPROVALS.filter((a) => a.packageId === packageId);

  return (
    <div className="tab-content">
      <div className="tab-bar">
        <span className="tab-count">{items.length} approval request(s)</span>
      </div>

      <div className="list-rows">
        {items.map((a) => (
          <div key={a.id} className="list-row">
            <div className="list-row-main">
              <div className="list-row-head">
                <span className="obj-type-badge">{a.objectType}</span>
                <span className="list-title">{a.objectLabel}</span>
              </div>
              <div className="list-meta">
                <span>Submitted by {a.submittedBy} · {a.submittedDate}</span>
              </div>
              <div className="list-meta">
                <span>Approver: {a.approver}</span>
                {a.decisionDate && (
                  <>
                    <span className="dot">·</span>
                    <span>{a.decisionDate}</span>
                  </>
                )}
              </div>
              {a.comments && <p className="list-notes">{a.comments}</p>}
            </div>
            <div className="approval-actions">
              <span className={`tag ${DEC_COLORS[a.decision]}`}>{a.decision}</span>
              {a.decision === "Pending" && (
                <div className="appr-btns">
                  <button className="btn-approve">Approve</button>
                  <button className="btn-reject">Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="empty-state">No approval requests yet.</p>}
      </div>
    </div>
  );
}
