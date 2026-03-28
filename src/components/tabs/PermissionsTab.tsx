import { useState } from "react";
import { MEMBERS } from "../../data/mock";

const ROLE_COLORS: Record<string, string> = {
  Owner: "tag-blue",
  Contributor: "tag-yellow",
  Approver: "tag-green",
  Viewer: "tag-grey",
};

export default function PermissionsTab({ packageId }: { packageId: string }) {
  const members = MEMBERS.filter((m) => m.packageId === packageId);
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="tab-content">
      <div className="tab-bar">
        <span className="tab-count">{members.length} member(s)</span>
        <button className="btn-primary btn-sm" onClick={() => setShowInvite(true)}>
          + Invite Member
        </button>
      </div>

      <div className="members-list">
        {members.map((m) => (
          <div key={m.id} className="member-row">
            <div className="member-avatar">{m.name.charAt(0)}</div>
            <div className="member-info">
              <span className="member-name">{m.name}</span>
              <span className="member-company">{m.company}</span>
              <span className="member-email">{m.email}</span>
            </div>
            <span className={`tag ${ROLE_COLORS[m.role]}`}>{m.role}</span>
          </div>
        ))}
      </div>

      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Invite Member</h2>
            <div className="modal-fields">
              <label>Email Address<input type="email" placeholder="user@company.com" /></label>
              <label>Company<input placeholder="Company name" /></label>
              <label>Role
                <select>
                  <option>Owner</option>
                  <option>Contributor</option>
                  <option>Approver</option>
                  <option>Viewer</option>
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowInvite(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowInvite(false)}>Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
