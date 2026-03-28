import { useState } from "react";
import { useData } from "../../context/DataContext";
import type { PermissionRole } from "../../data/mock";

const ROLES: PermissionRole[] = ["Owner", "Contributor", "Approver", "Viewer"];

export default function PermissionsTab({ packageId }: { packageId: string }) {
  const { members, addMember, removeMember, updateMemberRole } = useData();
  const pkgMembers = members.filter((m) => m.packageId === packageId);
  const [showInvite, setShowInvite] = useState(false);

  // Form state
  const [fName, setFName] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fCompany, setFCompany] = useState("");
  const [fRole, setFRole] = useState<PermissionRole>("Contributor");

  const resetForm = () => {
    setFName(""); setFEmail(""); setFCompany(""); setFRole("Contributor");
  };

  const handleInvite = () => {
    if (!fEmail.trim()) return;
    addMember({
      packageId,
      name: fName.trim() || fEmail.split("@")[0],
      company: fCompany.trim() || "—",
      email: fEmail.trim(),
      role: fRole,
    });
    resetForm();
    setShowInvite(false);
  };

  return (
    <div className="tab-content">
      <div className="tab-bar">
        <span className="tab-count">{pkgMembers.length} member(s)</span>
        <button className="btn-primary btn-sm" onClick={() => setShowInvite(true)}>+ Invite Member</button>
      </div>

      <div className="members-list">
        {pkgMembers.map((m) => (
          <div key={m.id} className="member-row">
            <div className="member-avatar">{m.name.charAt(0)}</div>
            <div className="member-info">
              <span className="member-name">{m.name}</span>
              <span className="member-company">{m.company}</span>
              <span className="member-email">{m.email}</span>
            </div>
            <select
              className="status-select"
              value={m.role}
              onChange={(e) => updateMemberRole(m.id, e.target.value as PermissionRole)}
              style={{ fontSize: 12, padding: "4px 8px", marginRight: 8 }}
            >
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <button
              className="btn-reject"
              style={{ fontSize: 11, padding: "3px 10px" }}
              onClick={() => removeMember(m.id)}
              title="Remove member"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {showInvite && (
        <div className="modal-overlay" onClick={() => { setShowInvite(false); resetForm(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Invite Member</h2>
            <div className="modal-fields">
              <label>Email Address *<input type="email" placeholder="user@company.com" value={fEmail} onChange={(e) => setFEmail(e.target.value)} required /></label>
              <label>Full Name<input placeholder="Full name" value={fName} onChange={(e) => setFName(e.target.value)} /></label>
              <label>Company<input placeholder="Company name" value={fCompany} onChange={(e) => setFCompany(e.target.value)} /></label>
              <label>Role
                <select value={fRole} onChange={(e) => setFRole(e.target.value as PermissionRole)}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => { setShowInvite(false); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={handleInvite} disabled={!fEmail.trim()}>Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
