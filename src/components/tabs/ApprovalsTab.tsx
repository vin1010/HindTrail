import { useState } from "react";
import { useData } from "../../context/DataContext";

const DEC_COLORS: Record<string, string> = {
  Pending: "tag-yellow", Approved: "tag-green", Rejected: "tag-red",
};

export default function ApprovalsTab({ packageId }: { packageId: string }) {
  const { approvals, decideApproval } = useData();
  const items = approvals.filter((a) => a.packageId === packageId);
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const handleApprove = (id: string) => {
    decideApproval(id, "Approved", comment);
    setCommentingId(null);
    setComment("");
  };

  const handleReject = (id: string) => {
    setCommentingId(id);
  };

  const confirmReject = () => {
    if (commentingId) {
      decideApproval(commentingId, "Rejected", comment);
      setCommentingId(null);
      setComment("");
    }
  };

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
                  <><span className="dot">·</span><span>{a.decisionDate}</span></>
                )}
              </div>
              {a.comments && <p className="list-notes">{a.comments}</p>}
            </div>
            <div className="approval-actions">
              <span className={`tag ${DEC_COLORS[a.decision]}`}>{a.decision}</span>
              {a.decision === "Pending" && (
                <div className="appr-btns">
                  <button className="btn-approve" onClick={() => handleApprove(a.id)}>Approve</button>
                  <button className="btn-reject" onClick={() => handleReject(a.id)}>Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="empty-state">No approval requests yet.</p>}
      </div>

      {/* Reject with comment modal */}
      {commentingId && (
        <div className="modal-overlay" onClick={() => { setCommentingId(null); setComment(""); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Reject Approval</h2>
            <div className="modal-fields">
              <label>Rejection reason<textarea rows={3} placeholder="Explain why this is being rejected..." value={comment} onChange={(e) => setComment(e.target.value)} /></label>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => { setCommentingId(null); setComment(""); }}>Cancel</button>
              <button className="btn-reject" onClick={confirmReject} disabled={!comment.trim()}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
